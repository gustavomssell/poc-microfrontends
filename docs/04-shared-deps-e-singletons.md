# 04 — Shared deps e singletons

> O bloco `shared` do Module Federation: o que é compartilhado, por quê,
> e como garantir — verificável em runtime — que existe uma cópia só.

## A fonte única: `createSharedConfig()`

Todos os `vite.config.ts` importam o **mesmo helper**
(`packages/build-config/src/index.ts`). Nenhuma app declara `shared` por
conta própria — assim as versões e flags nunca divergem (a causa nº 1 de
"React duplicado" num monorepo).

| Módulo | Flag | Por quê |
|---|---|---|
| `react` | `singleton: true` | Duas cópias = "Invalid hook call" |
| `react-dom` | `singleton: true` | idem |
| `react-dom/` | `singleton: true` | prefixo com barra cobre submódulos (`react-dom/client`) |
| `react/jsx-runtime` | `singleton: true, eager: true` | consumido **só** pelos deps pré-bundlados (base-ui), nunca por source file; sem `eager` o materialize não acontece e o prefill da share termina **depois** do primeiro render no modo standalone → `TypeError: jsx is not a function` |
| `react-router-dom` | `singleton: true` | widgets usam `<Link>` no contexto do shell; shells e remotes precisam ler a mesma árvore de rotas |
| `@microstore/cart-store` | `singleton: true` | **UMA** store: badge, carrinho e checkout veem o mesmo estado |
| `@microstore/event-bus` | `singleton: true` | emissores e ouvintes no mesmo barramento |

`requiredVersion` espelha os ranges declarados nos workspaces
(`apps/*/package.json`: `react ^19.3.0`, `react-router-dom ^7.18.0`; `^1.0.0`
é a `version` dos packages internos) — o runtime **nega** compartilhar se
as versões forem incompatíveis e cai em cópia própria (é justamente o caso
que o chip de status captura). A raiz não declara dependências de runtime:
a dedupe de uma versão só é feita pelo hoisting do npm workspaces.

### O que NÃO é compartilhado (e por quê)

| Módio | Motivo da não-isenção |
|---|---|
| `@microstore/contracts` | Valores puros e imutáveis (`REMOTES`, `REMOTE_EXPOSES`) além dos tipos — duplicar é inofensivo: sem estado nem identidade, não há o que unificar no runtime |
| `@microstore/ui` | Duplicar é inofensivo: componentes são puros e o CSS é compilado por cada app (ver [05](./05-estilos-e-design-tokens.md)) |
| `@microstore/build-config` | Usado só na hora do build (o `vite.config.ts`) |

## Como a negociação funciona

1. O **shell** carrega primeiro e define a versão vencedora de cada módulo
   no scope `default`.
2. Quando um remote carrega, o runtime compara a `requiredVersion` dele
   com a versão já publicada.
3. Compatível → o remote **usa a instância do shell** (nenhum byte
   duplicado). Incompatível → warn + cópia própria (e o chip denuncia).

Só de declarar `singleton: true` **em todos os apps** já resolvemos o caso
usual; a detecção abaixo existe para o resto.

## Detecção em runtime: os chips `state:` e `bus:`

`cart-store` e `event-bus` não confiam na promessa da config — eles
**verificam**. Ao serem importados, registram um `instanceId` em
`globalThis`:

```ts
// packages/cart-store/src/instance.ts — essência (o código real usa
// readIds()/writeIds() sobre globalThis['__MICROSTORE_CART_STORE_IDS__'])
export const storeModuleId = crypto.randomUUID(); // id desta avaliação
if (!readIds().includes(storeModuleId)) writeIds([...readIds(), storeModuleId]);
```

O chip no header (`apps/shell/src/components/StatusChips.tsx`, lendo
`getStoreInstanceIds()`) mostra a contagem a cada 2s:

```
[● catalog: ok] [● cart: ok] [● state: 1] [● bus: 1]
```

- **1** → ponto verde: compartilhamento ok.
- **≥2** → ponto vermelho + chip em tom de âmbar: alguma build embalou a
  própria cópia — o bug de estado divergente vira um sinal óbvio na tela,
  não uma investigação.

Mesmo mecanismo protege o event-bus (`__MICROSTORE_EVENT_BUS_IDS__`).

## Checklist: adicionar uma dependência compartilhada

1. Instale via workspaces (raiz) — o hoisting mantém uma versão só; o
   range fica no `package.json` do workspace que publica o módulo.
2. Adicione o módulo em `createSharedConfig()` com `singleton: true` e
   `requiredVersion` igual ao range declarado naquele workspace.
3. Importe normalmente nos apps — o `vite.config.ts` de todos já herda o
   bloco.
4. Se for estado vivo (como a store), aplique o padrão de `instanceId` +
   chip para auto-monitoramento.
5. `npm run typecheck && npm run test && npm run build` antes de fechar.

## O que dá errado sem isso

| Sintoma | Causa clássica |
|---|---|
| `Invalid hook call` | react/react-dom duplicados (faltou `singleton` ou uma app embalou o próprio) |
| `TypeError: jsx is not a function` no standalone | `react/jsx-runtime` sem `eager: true` — a share é materializada só sob demanda e perde a corrida contra o primeiro render |
| Badge some ao navegar | duas stores (uma no header, outra na página) |
| Toast que nunca apareca | dois buses (quem emite não é quem escuta) |
| `Link` que navega mas a URL "não cola" | dois react-routers com contexts diferentes |

Próximo: [05 — Estilos e design tokens](./05-estilos-e-design-tokens.md).
