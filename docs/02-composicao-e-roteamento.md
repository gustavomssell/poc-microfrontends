# 02 — Composição e roteamento

> Os dois níveis de composição (página inteira e widget), o desenho de
> roteamento com basename e as três regras para navegar sem cair em armadilha.

## Dois níveis de composição, de propósito

### 1. Página inteira — remote como aplicação (bridge)

O remote expõe um **app completo** (`./App`) e o shell o monta dentro da
rota que possui:

```tsx
// apps/shell/src/remotes/apps.tsx
export const CatalogApp = createRemoteAppComponent({
  loader: () => loadAppModule('catalog', 'App'),
  loading: <RemoteSkeleton label="Carregando Catálogo…" />,
  fallback: createRemoteFallback('catalog'), // remote caído → aviso + Recarregar
});
```

```tsx
// apps/shell/src/App.tsx
<Route path="/catalog/*" element={<CatalogApp basename="/catalog" />} />
<Route path="/cart/*"    element={<CartApp    basename="/cart" />} />
<Route path="/checkout/*" element={<CheckoutApp basename="/checkout" />} />
```

No lado do remote, a exposição é uma linha:

```tsx
// apps/catalog/src/export-app.tsx
export default createBridgeComponent({ rootComponent: App });
```

O bridge cuida do ciclo de vida (render/destroy em uma div-alvo), do
error boundary e da passagem do `basename` para o `App`.

### 2. Widget — remote como componente

O shell também importa **componentes soltos** dos remotes, montados na
árvore React **do shell** (sem bridge):

- `cart/MiniCart` → badge do header (lê a store compartilhada);
- `catalog/ProductGrid` → seção "Destaques" da home.

```tsx
// apps/shell/src/remotes/widgets.tsx — React.lazy + loadRemote
const ProductGrid = loadWidget('catalog', 'ProductGrid');
```

Como o widget roda dentro do router **do shell**, ele usa `Link` normal
(aponta para `/catalog/:id`, paths absolutos do shell). A regra muda para
as páginas dos remotes — ver "Três regras de navegação" abaixo.

## Roteamento: por que cada remote cria o próprio `<BrowserRouter>`

O bridge renderiza cada app em **uma raiz React isolada** (um `createRoot`
próprio dentro de uma div). O contexto de router do shell **não atravessa**
essa fronteira — então o remote não tem router, a não ser que ele mesmo
crie um. O shell resolve isso injetando o `basename`:

```
shell (BrowserRouter do shell)
 └─ rota /catalog/*  →  <CatalogApp basename="/catalog" />
                          └─ bridge renderiza em div própria
                               └─ App({ basename: '/catalog' })
                                    └─ <BrowserRouter basename="/catalog">
                                         └─ rotas: / , /:id   (relativas)
```

- **Embarcado**: shell passa `basename="/catalog"` → as rotas internas do
  remote são relativas (`/`, `:id`) e a URL final vira
  `/catalog/kb-aurora`.
- **Standalone** (`npm run dev -w apps/catalog`): não há shell passando
  basename → `App` usa `'/'` → mesmas rotas relativas funcionam na raiz.

Isso é o que permite **o mesmo código** rodar nos dois modos sem ajuste.

Em deploy (GitHub Pages) o app vive em `/<repo>/` e não na raiz — daí o
prefixo `VITE_ROUTER_PREFIX` (mesmo valor em todos os apps, vazio em
dev): o shell aplica no `basename` e nos basenames dos remotes,
`MfeLink`/`softNavigate` prefixam cada `pushState`; no standalone, o
`main.tsx` deriva o basename do `base` do Vite (`VITE_BASE_URL`).
Detalhes e layout do site em [07 — Deploy](./07-deploy-e-versionamento.md).

## Três regras de navegação

| Contexto | Componente | Exemplo | Por quê |
|---|---|---|---|
| Link **dentro** do remote (relativo ao basename) | `<Link>` do react-router | `to={\`/${product.id}\`}` | Recebe o basename automaticamente |
| Link **para outro remote/shell** (`/checkout`, `/`, `/catalog`) | `<MfeLink>` (de `@microstore/ui`) | `<MfeLink to="/checkout">` | `Link` aplicaria o basename errado (`/cart/checkout`) e o router do shell não veria o push |
| Link **dentro de um widget** (árvore do shell) | `<Link>` do react-router | `to="/cart"` | O router é o do shell; paths absolutos estão corretos |

`MfeLink` faz um `pushState` + **popstate sintético** (`softNavigate` em
`packages/ui/src/lib/navigation.ts`) — mesmo mecanismo que o próprio
bridge-react usa internamente. Assim shell e remotes sincronizam sem
recarregar a página (a store compartilhada é preservada — e, como ela
persiste em `localStorage`, sobreviveria até a recarga).

## Sincronização shell → remotes

Cada remote só escuta `popstate`; um `pushState` do shell passaria
despercebido por eles. Por isso o shell tem um `RouterSync`
(`apps/shell/src/App.tsx`): a cada mudança de rota no shell ele emite um
popstate sintético, e os remotes montados acompanham a URL.

Limitação conhecida documentada: a navegação **interna** de um remote não
repinta o `NavLink` ativo do shell (a URL do shell fica defasada até o
próximo popstate). É cosmético — nenhuma rota quebra.

## Standalone

Todo remote roda sozinho — pré-requisito de deploy independente:

```bash
npm run dev -w apps/catalog   # :5001, rotas na raiz
npm run dev -w apps/cart      # :5002
npm run dev -w apps/checkout  # :5003
```

A única diferença é o `main.tsx` (entry standalone); o `App` é o mesmo.
Validado no smoke (`scripts/smoke.mjs`, passos 9–10: catalog e
checkout — o cart standalone usa o mesmo mecanismo, sem step dedicado).

## HMR em dev

- **Shell**: HMR normal.
- **Remotes**: o dev server de cada remote também faz HMR do próprio
  código. Quando um arquivo do remote muda enquanto ele está montado no
  shell, o shell recebe a atualização pelo `remoteEntry` do remote em
  execução. Se o HMR entre fronteiras se perder (cenário conhecido com
  alguns setups), `vite build --watch` no remote + reload do shell é o
  fallback documentado — em POC o HMR direto funcionou em todos os apps.

Próximo: [03 — Comunicação e estado](./03-comunicacao-e-estado.md).
