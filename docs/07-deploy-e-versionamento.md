# 07 — Deploy e versionamento

> O que cada app publica, como o shell aponta para ele e como versionar
> sem acoplar os times. O CI (`.github/workflows/ci.yml`) roda quality e
> smoke em cada push/PR e **publica no GitHub Pages** a cada push em
> `master`.

## Cada app builda e publica separado

```bash
npm run build -w @microstore/cart    # só o cart
```

Saída: `apps/cart/dist/` — `remoteEntry.js`, chunks com hash,
`index.html` (standalone), `mf-manifest.json` (manifest do federation) e
CSS próprio. **O shell não inclui uma linha dos remotes** no dele.

| App | Artefato | Público em |
|---|---|---|
| shell | `dist/` (HTML + JS + CSS do host) | `https://gustavomssell.github.io/poc-microfrontends/` |
| catalog | `dist/` (container + chunks) | `…/poc-microfrontends/_remotes/catalog/` |
| cart | idem | `…/poc-microfrontends/_remotes/cart/` |
| checkout | idem | `…/poc-microfrontends/_remotes/checkout/` |

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

## Deploy desta POC: GitHub Pages

Fluxo real — job `deploy` do `ci.yml`, só em push para `master` e depois
de `quality` + `smoke` verde:

1. build das 4 apps com env de produção (mesmo esquema do rehearsal);
2. montagem do site num diretório único (shell na raiz, remotes em
   `_remotes/<app>/`, `index.html` copiado para `404.html`);
3. `actions/upload-pages-artifact` + `actions/deploy-pages`;
4. checagens por curl no site publicado: `200` nas três entries,
   deep link `404` **com o shell** no corpo.

Env de produção (calculada no workflow a partir de `GITHUB_REPOSITORY`;
é o que você seta para reproduzir o build em qualquer máquina):

| Variável | Valor neste repo | Onde age |
|---|---|---|
| `VITE_ROUTER_PREFIX` | `/poc-microfrontends` | `basename` do shell, basenames dos remotes, `softNavigate`/`MfeLink` |
| `VITE_BASE_URL` (shell) | `/poc-microfrontends/` | `base` dos assets do shell |
| `VITE_BASE_URL` (cada remote) | `/poc-microfrontends/_remotes/<app>/` | `base` dos chunks + basename standalone |
| `VITE_*_ENTRY` | `https://gustavomssell.github.io/poc-microfrontends/_remotes/<app>/remoteEntry.js` | entry de cada remote no shell |

Layout do site publicado:

```
…/poc-microfrontends/
├─ index.html          # shell
├─ 404.html            # cópia do index — fallback SPA do Pages
├─ assets/…            # chunks do shell
└─ _remotes/
   ├─ catalog/         # dist completo do remote (remoteEntry.js + index.html)
   ├─ cart/
   └─ checkout/
```

Semântica de URL (o Pages devolve `404` para o `404.html` — deep link
com status não-200 é esperado e correto):

| URL | Resposta |
|---|---|
| `/<repo>/` (raiz do app) | 200 → shell |
| `/<repo>/checkout` ou `/<repo>/cart` (recarga em rota) | 404 → shell monta a rota (o header não some) |
| `/<repo>/catalog/kb-aurora` (deep link) | 404 → shell + remote catalog montados |
| `/<repo>/_remotes/catalog/` | 200 → remote standalone |

Por que `_remotes/` e não `/catalog/` na raiz: um diretório que colide
com a rota faria o Pages servir o `index.html` **do remote** na recarga,
trocando o shell pelo standalone no meio do fluxo.

Habilitação (uma única vez por repo): **Settings → Pages → Source:
GitHub Actions** (ou
`gh api -X POST /repos/<owner>/<repo>/pages -f build_type=workflow`).
Se o repo se chama `<owner>.github.io`, o workflow detecta e usa a raiz
como prefixo.

## Fluxo de deploy de um remote (sem tocar nos outros)

```
1. time do cart: npm run build -w @microstore/cart
2. publica dist/ em …/_remotes/cart/       (URLs imutáveis com hash)
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

## CDN (desenho teórico — o Pages desta POC é estático)

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
carrinho → checkout) rodando no build de produção. A checagem do site
com prefixo (hrefs, recarga em rota, deep link) é o `deploy` job que
faz por curl após publicar.

Próximo: [08 — Tradeoffs e alternativas](./08-tradeoffs-e-alternativas.md).
