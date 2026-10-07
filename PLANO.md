# Plano da POC — Microfrontends (MicroStore)

> E-commerce de demonstração para provar, com código real, como microfrontends
> funcionam no dia a dia: independência de build/deploy, composição no shell,
> compartilhamento de estado e dependências, isolamento de falhas e estilos.
>
> Stack: **Vite + React + Tailwind + TypeScript**, orquestração com
> **Module Federation 2.0**.

---

## 1. Objetivo e escopo

Construir um monorepo com 1 shell (host) e 3 microfrontends (remotes) que
demonstrem os conceitos centrais da arquitetura:

| Conceito | Como a POC prova |
|---|---|
| Composição | Shell monta páginas inteiras **e** widgets dos remotes |
| Independência | Cada app roda, builda e deploya isolado (portas/URLs próprias) |
| Estado compartilhado | Uma única instância da store do carrinho em todos os apps |
| Comunicação desacoplada | Event bus tipado entre domínios |
| Contratos entre times | Package de tipos como fronteira única |
| Resiliência | Remote caído não derruba o shell (error boundary + fallback) |
| Consistência visual | Design tokens compartilhados, CSS isolado por MFE |
| Shared deps | React/ReactDOM singletons, sem "Invalid hook call" |

**Fora de escopo:** SSR, auth real, backend, CI/CD, publicação em CDN
(documentado apenas teoricamente em `docs/07`).

---

## 2. Decisões técnicas

| Tema | Decisão | Justificativa |
|---|---|---|
| Orquestração | Module Federation 2.0 — `@module-federation/vite` + `@module-federation/bridge-react` | Runtime oficial (compatível webpack/Rspack/Vite), dev server com manifest, negociação de singletons |
| Monorepo | npm workspaces + `concurrently` | Sem pnpm/turbo no ambiente; zero dependências extras |
| Linguagem | TypeScript `^5.9` | Contratos tipados entre MFEs é parte das boas práticas |
| Bundler | Vite `^8` (fallback `^7`) | Plugin declara peer `^5 \|\| ^6 \|\| ^7 \|\| ^8` |
| UI | React `^19`, React Router `^7` | Padrão de mercado |
| Estilo | Tailwind `^4` (`@tailwindcss/vite`, CSS-first `@theme`) | Tokens em CSS compartilhado, sem JS de config acoplado |
| Estado | Zustand `^5` em package compartilhado via MF `shared` | Singleton garantido pelo runtime do MF |
| Testes | Vitest `^5` nos packages + smoke no shell | Lógica de domínio (store/event-bus) é o que vale testar |
| Lint | ESLint flat config único na raiz | Uma config para todos os apps |

### Portas e nomes

| App | Nome MF | Porta | Papel |
|---|---|---|---|
| `apps/shell` | `shell` | 5000 | Host: layout, nav, rotas, slots |
| `apps/catalog` | `catalog` | 5001 | Remote: produtos |
| `apps/cart` | `cart` | 5002 | Remote: carrinho |
| `apps/checkout` | `checkout` | 5003 | Remote: checkout |

---

## 3. Estrutura do repositório

```
poc-microfrontends/
├── apps/
│   ├── shell/                 # host (:5000)
│   │   └── src/
│   │       ├── App.tsx        # RouterSync + rotas dos remotes
│   │       ├── layout/        # Layout, Header, Footer, ThemeToggle
│   │       ├── pages/         # HomePage, NotFoundPage
│   │       ├── components/    # RemoteErrorBoundary, StatusChips, StoreBadge, Toast
│   │       └── remotes/       # apps (bridge), widgets, fallbacks, status store
│   ├── catalog/               # remote (:5001)
│   │   └── src/               # ProductListPage, ProductDetailPage, ProductGrid (exposto)
│   ├── cart/                  # remote (:5002)
│   │   └── src/               # CartPage, MiniCart (exposto)
│   └── checkout/              # remote (:5003)
│       └── src/               # CheckoutPage (pedido + confirmação)
├── packages/
│   ├── contracts/             # Product, CartItem, Order, eventos, registry REMOTES
│   ├── cart-store/            # store Zustand persistida (shared singleton via MF)
│   ├── event-bus/             # bus tipado (shared singleton via MF)
│   ├── ui/                    # theme.css (@theme), Button, Card, formatCurrency
│   └── build-config/          # fonte única do `shared` + alias + URLs de entry
├── docs/
│   ├── 01-arquitetura.md
│   ├── 02-composicao-e-roteamento.md
│   ├── 03-comunicacao-e-estado.md
│   ├── 04-shared-deps-e-singletons.md
│   ├── 05-estilos-e-design-tokens.md
│   ├── 06-resiliencia-e-observabilidade.md
│   ├── 07-deploy-e-versionamento.md
│   └── 08-tradeoffs-e-alternativas.md
├── scripts/                   # smoke, verify-preview, verify-resilience, screenshots
├── README.md
├── PLANO.md                   # este arquivo
├── package.json               # workspaces + scripts raiz
├── tsconfig.base.json
└── eslint.config.js
```

### `package.json` raiz — scripts

```json
{
  "scripts": {
    "dev": "concurrently -k -n shell,catalog,cart,checkout \"npm run dev -w @microstore/shell\" … (idem catalog/cart/checkout)",
    "build": "npm run build --workspaces --if-present",
    "preview": "concurrently -n shell,catalog,cart,checkout \"npm run preview -w @microstore/shell\" …",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "lint": "eslint .",
    "test": "vitest run",
    "smoke": "node scripts/smoke.mjs"
  }
}
```

---

## 4. Modelo de composição (dois níveis, de propósito)

### 4.1 Página inteira (remote como aplicação)

```tsx
// apps/shell/src/remotes/apps.tsx
export const CatalogApp = createRemoteAppComponent({
  loader: () => loadAppModule('catalog', 'App'),
  loading: <RemoteSkeleton label="Carregando Catálogo…" />,
  fallback: createRemoteFallback('catalog'), // remote caído → shell continua
});

// apps/shell/src/App.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/catalog/*" element={<CatalogApp basename="/catalog" />} />
  <Route path="/cart/*"    element={<CartApp    basename="/cart" />} />
  <Route path="/checkout/*" element={<CheckoutApp basename="/checkout" />} />
</Routes>
```

### 4.2 Widget (remote como componente)

- **Home** do shell renderiza `catalog/ProductGrid` (Destaques).
- **Header** do shell renderiza `cart/MiniCart` (badge de quantidade).

### 4.3 Status por slot

Cada remote expõe `idle | loading | ok | error` para um chip visual no
header (`catalog: ok`, com a porta nas badges das páginas) — demonstra
que cada remote é um serviço independente.

---

## 5. Comunicação entre MFEs (3 camadas)

```
┌──────────────┐   types/registry    ┌──────────────┐
│  contracts   │◄────────────────────│  todos apps  │
└──────────────┘                     └──────┬───────┘
                                            │
┌──────────────┐  singleton via MF shared   │   ┌──────────────┐
│  cart-store  │◄───────────────────────────┼──►│  event-bus   │
└──────────────┘                            │   └──────────────┘
  estado do carrinho (sincrono)             │     notificações (desacopladas)
                                     ┌──────┴───────┐
                                     │ shell/catalog│
                                     │ cart/checkout│
                                     └──────────────┘
```

1. **`contracts`** — `Product`, `CartItem`, `Order`/`OrderCustomer`, union
   de nomes de eventos e o registry `REMOTES` (nome → entry → rota).
   Fonte única da fronteira entre times; `RemoteName`/`REMOTES` tipam as
   chamadas do shell e `loadRemote` é convertido com tipo explícito em
   cada uso — nada de `any` solto.

2. **`cart-store`** — Zustand exportado e registrado como
   `shared: { '@microstore/cart-store': { singleton: true } }` em **todos**
   os apps. Estado persistido em `localStorage` (`zustand/persist`).
   Garantia verificável: store carrega um `instanceId` e um teste
   unitário + o chip `state:` do header conferem que só existe uma
   instância no runtime.

3. **`event-bus`** — eventos tipados (`cart:item-added`, `cart:cleared`,
   `remote:status`) para efeitos transversais (toast no shell) **sem** o
   shell importar código do catálogo.

### Fluxo principal (happy path)

```
catálogo: "Adicionar ao carrinho"
  → cart-store.add()                (estado compartilhado)
  → eventBus.emit('cart:item-added') (notificação)
  → MiniCart (header) re-renderiza   (mesma store)
  → shell mostra toast               (event bus)
  → /cart e /checkout leem o mesmo estado
```

---

## 6. Boas práticas aplicadas

- **Singleton de deps**: `react`, `react-dom`, `react-dom/`,
  `react-router-dom` com `singleton: true` e `requiredVersion` idêntico,
  definidos **uma única vez** em `packages/build-config` (anti-drift de config).
- **Config compartilhada**: helper `createSharedConfig()` centraliza o
  bloco `shared` (versões, singletons) + alias `@/` e URLs de entry;
  `react()`/`tailwindcss()`/`build.target` ficam em cada `vite.config.ts`
  (anti-drift do que importa: as versões).
- **URLs por ambiente**: entries dos remotes via env
  (`VITE_CATALOG_ENTRY` etc.) com default `localhost` — dev ≠ prod.
- **Resiliência**: error boundary + fallback do bridge por slot; toast de erro.
- **Isolamento de estilos**: cada raiz de remote com `data-mfe="<nome>"`,
  tokens em `@theme`, sem CSS global; doc dedicado (docs/05).
- **Contratos**: `RemoteName`/`REMOTES` tipam nome, rota e status das
  chamadas do shell; `loadRemote` é convertido com tipo explícito em
  cada uso.
- **Qualidade**: `typecheck`, `lint`, `test` como scripts de primeira classe.
- **Standalone**: todo remote roda sozinho (`npm run dev -w apps/catalog`)
  — pré-requisito para deploy independente.

---

## 7. Riscos conhecidos e fallbacks

| # | Risco | Mitigação |
|---|---|---|
| 1 | Vite 8 + plugin apresentar incompatibilidade | Downgrade para Vite 7 (peer range cobre) |
| 2 | CSS do remote não ser injetado quando montado no host em build de produção | `bundleAllCSS: true` / ajustar `cssCodeSplit`; validado no smoke `build + preview` |
| 3 | `shared` de package workspace não deduplicar (2 cópias da store) | Fallback documentado: instância da store registrada em `globalThis` (docs/03) |
| 4 | Bridge + Router interno do remote (basename) | Testar desde a fase do shell; se necessário `enableBridgeRouter: false` |
| 5 | Dev remoto sem HMR | Esperado em alguns cenários; doc mostra alternativa `vite build --watch` (docs/02) |

---

## 8. Etapas de implementação

| # | Fase | Entregável | Critério de pronto |
|---|---|---|---|
| 1 | Raiz do monorepo | workspaces, tsconfig base, scripts, eslint, vitest | `npm install` ok |
| 2 | Packages base | `contracts`, `build-config`, `ui` (tokens) | `typecheck` ok |
| 3 | Shell | layout, rotas, slots, error boundaries, status chips | shell roda com remotes "fantasma" |
| 4 | Catalog | standalone + expose `App` e `ProductGrid` | widget aparece na home do shell |
| 5 | Cart + store | `cart-store` shared, página `/cart`, `MiniCart` | **instância única** da store verificada |
| 6 | Checkout + bus | `/checkout` lê store, `event-bus`, toast no shell | fluxo completo end-to-end |
| 7 | Qualidade | testes, lint, typecheck, build + smoke de produção | todos os scripts verdes |
| 8 | Documentação | README + 8 docs | docs respondem às 4 perguntas do aceite |

---

## 9. Critérios de aceite

- [ ] `npm install && npm run dev` sobe os 4 apps; shell em `localhost:5000`
- [ ] Navegar entre `/`, `/catalog`, `/cart`, `/checkout` sem full reload
- [ ] Adicionar item no catálogo → badge do header **e** página do carrinho
      atualizam (mesma instância da store — comprovado pelo `instanceId`)
- [ ] Derrubar o server do cart → shell e catálogo seguem; slot exibe fallback
- [ ] Remotes rodam isolados (`npm run dev -w apps/catalog` funciona sozinho)
- [ ] `npm run build`, `npm run typecheck`, `npm run test`, `npm run lint` verdes
- [ ] Documentação responde: **por que MF2**, **como é a composição**,
      **como o estado é compartilhado**, **quando NÃO usar microfrontends**

---

## 10. Versões-alvo (verificadas em out/2026)

| Pacote | Versão |
|---|---|
| `vite` | `^8.3` (fallback `^7`) |
| `react` / `react-dom` | `^19.3` |
| `typescript` | `^5.9` |
| `tailwindcss` + `@tailwindcss/vite` | `^4.3` |
| `@module-federation/vite` | `^1.23` |
| `@module-federation/bridge-react` | `^2.9` |
| `react-router-dom` | `^7.18` |
| `zustand` | `^5.0` |
| `vitest` | `^5.0` |
| `concurrently` | `^10.0` |
