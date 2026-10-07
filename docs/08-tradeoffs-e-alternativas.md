# 08 — Tradeoffs e alternativas

> Por que Module Federation 2.0 aqui, o que esta escolha custa e — o mais
> importante — **quando não usar microfrontends**.

## Por que MF 2.0 (e não X)

| Abordagem | Como compõe | Pontos fortes | Pontos fracos aqui |
|---|---|---|---|
| **iframes** | página dentro de página | isolamento total, zero conflito de CSS | router/scroll/links quebrados, UX ruim, estado só via postMessage |
| **single-spa / qiankun** | runtime orquestrando apps por rota | maduros, multi-framework | overhead de lifecycle próprio, HTML snapshot (qiankun) ou remakes de entry (single-spa); integração Vite menos fluida |
| **Build-time composition** (1 bundle só) | monorepo importa apps como packages | simples, tudo tipado, um deploy | **não** entrega deploy independente nem falha isolada — é monólito bem organizado |
| **Import maps nativas** | sem bundler de runtime | padrão da plataforma | sem shared de singletons, sem manifest, sem dev-server integration — muita casa própria |
| **Module Federation 2.0** (escolhido) | runtime carrega containers com `shared` negociado | Vite plugin oficial + bridge React, dev server com manifest, singletons, exposes de app **e** widget, mesma API no webpack/Rspack | complexidade de runtime; mais uma camada para aprender |

MF 2.0 é a única da lista que entrega **simultaneamente**: deploy
independente, composição em dois níveis (página e widget), dependências
compartilhadas com negociação e ferramenta de dev suportada — mantendo o
modelo mental de "cada app é um servidor".

## O que esta escolha custa (honestidade da POC)

| Custo | Como mitigamos | Estado |
|---|---|---|
| Router por remote (árvore isolada) | convenção de basename + `MfeLink`/`RouterSync` ([02](./02-composicao-e-roteamento.md)) | resolvido, com regras explícitas |
| Estado pode duplicar silenciosamente | `singleton` centralizado + chips `state:`/`bus:` ([04](./04-shared-deps-e-singletons.md)) | verificado (1 ✓) |
| CSS do remote no host | tema único, `data-mfe`, validação em produção ([05](./05-estilos-e-design-tokens.md)) | verificado (7/7) |
| Falha de remote derruba fluxo? | boundaries + fallbacks ([06](./06-resiliencia-e-observabilidade.md)) | verificado (8/8) |
| 4 dev servers, 4 builds | `concurrently` + scripts na raiz | aceito — é o preço da independência |
| Warn `synchronously unmount` (dev) | conhecido, sem `pageerror` | aceito e documentado ([06](./06-resiliencia-e-observabilidade.md)) |
| Nav ativa do shell defasada após navegação interna de remote | cosmético; sincroniza no próximo popstate | aceito ([02](./02-composicao-e-roteamento.md)) |

## Quando **NÃO** usar microfrontends

A régua honesta (maioria dos projetos cai aqui):

- **Um time pequeno, um produto** — a coordenação de contratos, versionamento
  e 4 pipelines custa mais do que a independência rende. Use um monorepo
  com **packages** e um único build.
- **Poucas mudanças independentes** — se os domínios quase sempre mudam
  juntos (UI inteira refazida de uma vez), deploy acoplado é feature.
- **Time ainda sem contratos claros** — microfrontend sem fronteira de
  tipo vira micro-mergulho: todo PR mexe em tudo.
- **Requisitos fortes de SEO/SSR na primeira pintura** — esta POC é
  client-side; SSR com MF é outro nível de complexidade.
- **CRUD interno simples** — a complexidade não se paga.

Microfrontends pagam quando: **times distintos** donos de domínios, com
**cadências de deploy diferentes** e necessidade de **falha isolada** —
exatamente o cenário que esta POC exagera para deixar visível.

## Alternativas que continuam válidas dentro do MF

- Só páginas (sem widgets) — metade da complexidade de roteamento;
- Só widgets no shell — sem basename, mas sem deploy de página própria;
- Trocar o bridge pelo `RouterProvider` do próprio react-router com
  rotas pré-definidas no shell (mais explícito, menos dinâmico).

## Próximos passos naturais (fora do escopo atual)

CI/CD por app, contract tests entre `contracts` e os emissores, E2E por
remote, versionamento automático de changelog, e — se SSR entrar —
avaliar o data-fetch do próprio bridge (já presente em
`@module-federation/bridge-react`).

---

Voltar: [README](../README.md) · [01 — Arquitetura](./01-arquitetura.md)
