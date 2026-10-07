# 07 — Deploy e versionamento

> O que cada app publica, como o shell aponta para ele e como versionar
> sem acoplar os times. (CDN real e CI/CD estão fora do escopo da POC —
> aqui está o desenho teórico, já refletido na config.)

## Cada app builda e publica separado

```bash
npm run build -w @microstore/cart    # só o cart
```

Saída: `apps/cart/dist/` — `remoteEntry.js`, chunks com hash,
`index.html` (standalone), `mf-manifest.json` (manifest do federation) e
CSS próprio. **O shell não inclui uma linha dos remotes** no dele.

| App | Artefato | Público em |
|---|---|---|
| shell | `dist/` (HTML + JS + CSS do host) | `https://app.exemplo.com/` |
| catalog | `dist/` (container + chunks) | `https://cdn.exemplo.com/catalog/v1.4.0/` |
| cart | idem | `https://cdn.exemplo.com/cart/v2.1.0/` |
| checkout | idem | `https://cdn.exemplo.com/checkout/v1.0.3/` |

## O shell aponta para os remotes por variável de ambiente

O `vite.config.ts` do shell resolve a entry de cada remote assim
(`packages/build-config → remoteEntryUrl`):

```bash
# apps/shell/.env (exemplo — ver .env.example)
VITE_CATALOG_ENTRY=https://cdn.exemplo.com/catalog/v1.4.0/remoteEntry.js
VITE_CART_ENTRY=https://cdn.exemplo.com/cart/v2.1.0/remoteEntry.js
VITE_CHECKOUT_ENTRY=https://cdn.exemplo.com/checkout/v1.0.3/remoteEntry.js
```

Sem a variável, o default é `http://localhost:<porta>/remoteEntry.js`
(dev). Ou seja: **mesmo build de shell + env diferente = aponta para
outra topologia**. Detalhe honesto: `loadEnv` roda no **build** do shell
— trocar a entry exige rebuild do shell (ou injeção de env no pipeline).

Cada remote também aceita `VITE_BASE_URL` para o `base` dos chunks — em
produção ele precisa apontar para a origem/CDN do próprio remote
(`apps/catalog/vite.config.ts`).

## Fluxo de deploy de um remote (sem tocar nos outros)

```
1. time do cart: npm run build -w @microstore/cart
2. publica dist/ em cdn.../cart/v2.1.0/        (URLs imutáveis com hash)
3. atualiza VITE_CART_ENTRY e rebuilda o shell
4. rollout do shell
```

- **Rollback**: aponta `VITE_CART_ENTRY` de volta para a versão anterior
  e rebuilda o shell — o remote antigo continua publicado.
- **Versões side-by-side**: por causa das URLs versionadas, duas versões
  do mesmo remote convivem; o shell escolhe qual carregar.
- Nenhum outro remote é rebuildado ou reiniciado.

## Versionamento

- **Semver por app/package** (cada workspace tem seu próprio
  `package.json`).
- `requiredVersion` no `shared` define a janela de compatibilidade entre
  shell e remotes para dependências comuns
  ([04 — Shared deps](./04-shared-deps-e-singletons.md)): minor/patch
  dentro do range é compatível; breaking em `react`/`router` exige
  atualizar todos os lados no mesmo release.
- **Contratos** (`@microstore/contracts`): mudança em tipo de evento ou
  registry é major e precisa ser consumida pelos apps que a usam — como é
  um package workspace, o monorepo garante que o typecheck de todos
  acuse a mudança antes do merge.

## CDN (desenho teórico — fora de escopo executar)

| Arquivo | Cache |
|---|---|
| chunks `assets/*.[hash].js`, CSS | `immutable`, longo prazo |
| `remoteEntry.js` | curto (ou `no-cache`) — é o ponteiro da versão |
| `mf-manifest.json` | curto — usado pelo runtime na negociação |

## Validação local do que vai para produção

```bash
npm run build && npm run preview
node scripts/verify-preview.mjs    # 7/7 ✓ nesta POC
```

O script cobre: shell monta, CSS dos remotes chega ao host (propriedades
computadas), store singleton funciona e os três níveis (home → detalhe →
carrinho → checkout) rodam no build de produção.

Próximo: [08 — Tradeoffs e alternativas](./08-tradeoffs-e-alternativas.md).
