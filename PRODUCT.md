# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primário:** devs e líderes técnicos avaliando arquitetura de microfrontends (situação: spike/POC/time considerando adoção; job: julgar composição, resiliência, deploy independente e shared deps antes de decidir).
- **Cenário secundário:** compradores fictícios da "MicroStore" — personas de demo que navegam, filtram, adicionam ao carrinho e finalizam pedido.

## Product Purpose

POC executável que demonstra um e-commerce composto por 4 apps independentes (shell, catalog, cart, checkout) via Module Federation 2.0. Sucesso = um avaliador consegue rodar o repo, observar a composição, derrubar um remote e ver o fallback, e concluir o fluxo de compra sem precisar ler código primeiro.

## Positioning

Integração entre microfrontends apenas por contratos tipados (pacote `contracts`) e event bus tipado, com design system compartilhado por build (tokens no CSS de cada app, sem injeção de CSS em runtime) — os apps não se conhecem diretamente; falam por eventos e rotas nomeadas.

## Operating Context

- Monorepo npm workspaces; dev simultâneo com 4 portas fixas (5000–5003); evidência em `docs/01–08` e scripts `smoke`, `verify-preview`, `verify-resilience`, `take-screenshots`.
- Avaliação local (Node ≥ 20, npm) e por leitura dos docs/screenshots no repo.

## Capabilities and Constraints

- Catálogo (lista, filtro por categoria, detalhe), carrinho (store compartilhada + eventos), checkout com validação e pedido confirmado; página 404; fallback quando um remote está fora do ar.
- Restrições: TypeScript, Vite + React + Tailwind v4, Module Federation 2.0 (bridge), dados mockados (sem backend nem pagamentos reais), copy pt-BR, preços em BRL.
- Decisões confirmadas neste ciclo: UI baseada em shadcn/ui, ícones lucide-react (substituindo emojis), dark mode incluso, identidade indigo preservada, a11y WCAG 2.1 AA.

## Brand Commitments

- Nome **MicroStore**; identidade visual indigo + neutros slate (vinculante — decisão explícita do usuário); voz pt-BR direta, sem hype.

## Evidence on Hand

- `docs/01–08`, scripts executáveis (smoke 17/17, preview 7/7, resilience 8/8) e `docs/screenshots/`. Screenshots e docs descrevem o estado pré-restyle — revalidar após a migração. Nenhum logotipo ou imagem de produto real existe (dados mockados); não fabricar.

## Product Principles

1. Cada remote é substituível e testável fora do shell.
2. Falha de um remote não derruba o todo — resiliência visível e demonstrável.
3. Contratos e eventos tipados são a única integração entre apps.
4. Evidência executável (testes e scripts) vale mais que prosa de documentação.

## Accessibility & Inclusion

- WCAG 2.1 AA como meta verificável: contraste, foco visível, navegação por teclado, aria em formulários e overlays; interface e cópia em pt-BR.
