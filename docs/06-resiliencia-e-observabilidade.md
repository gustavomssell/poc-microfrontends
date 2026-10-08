# 06 — Resiliência e observabilidade

> O que acontece quando um remote cai — e como você **vê** a saúde do
> sistema sem abrir o DevTools.

## Camadas de contenção de falha

### Páginas inteiras (bridge)

Cada rota remota tem três proteções, nesta ordem:

1. **`loading`** — `<RemoteSkeleton>` enquanto o `remoteEntry` carrega;
2. **error boundary do bridge** — erro de runtime dentro do remote fica
   preso na div dele;
3. **`fallback` do shell** (`createRemoteFallback`) — remote inacessível →
   card de erro com nome do remote, porta e botão **"Recarregar"**
   (recarrega a página; a store persistida sobrevive) — **dentro da
   rota**, sem derrubar layout, nav ou as outras rotas.

```tsx
// apps/shell/src/remotes/apps.tsx
fallback: createRemoteFallback('catalog'),
```

### Widgets

`RemoteErrorBoundary` próprio por widget com degradação funcional:

| Widget | Se cair | O que o shell faz |
|---|---|---|
| `cart/MiniCart` | badge some | **`StoreBadge`**: fallback local que lê a store compartilhada — o usuário continua vendo a contagem |
| `catalog/ProductGrid` | destaque some | card "Catálogo indisponível" com instrução de como subir o remote; home segue inteira |

O shell **nunca** importa código dos remotes para esse fallback — ele
importa a **store** (package compartilhado). Resiliência sem acoplamento.

## Observabilidade: o painel de saúde no header

`StatusChips` (visível em telas ≥1280px) mostra, em tempo real:

```
[● catalog: ok] [● cart: ok] [● checkout: ocioso] [● state: 1] [● bus: 1]
```

- **status por remote** — `idle → loading → ok | error`, alimentado pelo
  próprio carregador de módulos (`remoteStatusStore`), inclusive pelo
  widget que falhou;
- **`state:` / `bus:`** — contagem de instâncias da store e do bus
  ([04 — Shared deps](./04-shared-deps-e-singletons.md));
- **modo avaliador** — o botão de atividade no header alterna a exibição
  da telemetria (chips acima, portas do rodapé, badges `remote · :porta`).
  A preferência vira a classe `telemetry-off` no `<html>` e o CSS esconde
  os elementos `[data-telemetry]` — mesma engenharia do dark mode: um
  toggle no shell alcança os 4 apps porque compartilham o documento.

Quando um remote morre, o evento `remote:status` também dispara um toast
no shell (via event-bus) — falha vira sinal, não silêncio.

## Toasts

`ToastContainer` do shell escuta os eventos do bus
(`cart:item-added`, `order:placed`, `remote:status`…). Nenhum remote
conhece o componente de toast — eles só emitem eventos tipados
([03 — Comunicação](./03-comunicacao-e-estado.md)).

## Prova executável: `scripts/verify-resilience.mjs`

```bash
# 3 terminais paralelos (dev server é bloqueante) — suba, sem o cart:
npm run dev -w @microstore/shell
npm run dev -w @microstore/catalog
npm run dev -w @microstore/checkout
# em um 4º terminal, com os três no ar:
node scripts/verify-resilience.mjs
```

Resultado registrado nesta POC: **8/8 PASS**

- shell renderiza sem o cart;
- badge degrada para `StoreBadge` e **continua atualizando** (mesma store);
- chip mostra `cart: erro`;
- widget do catálogo e rotas `/catalog` seguem normais;
- navegar para `/cart` com o remote caído mostra o fallback — sem quebra.

## Limitações conhecidas (ruído de console em dev)

Dois avisos aparecem **só** no React em modo desenvolvimento — a build de
produção não os emite (verificado em `react-dom-client.production.js`):

1. > `Attempted to synchronously unmount a root while React was already rendering`

   É o destroy do bridge acontecendo durante um commit do shell: o cleanup
   de `useEffect` do bridge-react chama `root.unmount()` síncrono e o
   React 19 sinaliza o risco de corrida. Não afeta o comportamento
   observado (smoke 17/17, sem `pageerror`). A última versão do bridge
   (`@module-federation/bridge-react@2.9.2`) ainda não adia o destroy;
   se um projeto exigir console limpo em dev, monitorar a issue upstream
   ou adiar via `bridgeHook.lifecycle.beforeBridgeDestroy`.

2. > `Encountered a script tag while rendering React component`

   O `<script>` inline do `next-themes` (aplicação do tema antes da
   hidratação) renderizado dentro da árvore React — mecanismo padrão da
   lib; em CSR o tema é aplicado pelo efeito do provider, então o aviso é
   cosmético.

Próximo: [07 — Deploy e versionamento](./07-deploy-e-versionamento.md).
