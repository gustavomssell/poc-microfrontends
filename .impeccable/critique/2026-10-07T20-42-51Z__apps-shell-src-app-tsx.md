---
target: MicroStore shell (apps/shell/src/App.tsx)
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
target_identity: "file:C:\\pessoal\\projetos\\web\\poc-microfrontends\\apps\\shell\\src\\App.tsx"
target_fingerprint: "sha256:7926d7067f69cc2fc8ddd27c0be1113b703ac8e8b3ef7326f8178333321779ec"
target_path: "C:\\pessoal\\projetos\\web\\poc-microfrontends\\apps\\shell\\src\\App.tsx"
timestamp: 2026-10-07T20-42-51Z
slug: apps-shell-src-app-tsx
---
Method: dual-agent (A: ses_ee7f9f186ffe3K7Jqi2wl9A6YI · B: ses_ee7f9b037ffeJyTbq4FDEtPRIh)

# Crítica — MicroStore (shell + remotes)

## Design Health Score

| # | Heurística | Nota | Problema-chave |
|---|-----------|------|----------------|
| 1 | Visibilidade do Status do Sistema | **3** | Toast + "Adicionado" + badge excelentes; mas o filtro ativo não dá retorno perceptível |
| 2 | Correspondência com o Mundo Real | **3** | Funil em pt-BR natural; jargão de arquitetura ("contratos tipados", "falhas isoladas") invade a vitrine |
| 3 | Controle e Liberdade do Usuário | **2** | Voltar/filtros/steppers ✓; "Esvaziar carrinho" sem confirmação e F5 zera o carrinho (zustand sem persist — packages/cart-store/src/store.ts:18) |
| 4 | Consistência e Padrões | **3** | Ritmo idêntico nas 4 telas; quebras: raio 12 vs 36, padding p-4 vs p-6, grid 3 vs 5 col no funil |
| 5 | Prevenção de Erros | **3** | Validação inline com aria-invalid+role="alert" exemplar; placeholder "Ada Lovelace" parece valor preenchido em erro |
| 6 | Reconhecimento vs Memorização | **2** | Estado do filtro praticamente invisível (1.06:1); no carrinho mobile, total e "Remover" fora da tela |
| 7 | Flexibilidade e Eficiência | **2** | Nav direta e filtros; sem busca/ordenação nem atalhos |
| 8 | Estética e Design Minimalista | **2** | 4 camadas de telemetria de arquitetura + 8 gradientes/emoji competindo com a tarefa de compra |
| 9 | Recuperação de Erros | **2** | Erros de formulário e fallback de remote derrubado ✓; carrinho perdido no reload não tem como recuperar |
| 10 | Ajuda e Documentação | **2** | Hero documenta a arquitetura para o dev; consumidor sem ajuda contextual no funil |
| **Total** | | **24/40** | **Acceptable (60%)** |

## Design Specificity Verdict

**LLM assessment**: O resultado é autoral em partes — a identidade indigo está aplicada com intenção no chrome, no hero e nos CTAs, os chips de telemetria e os badges `remote · :5001` são uma assinatura que nenhuma loja genérica teria, e os tokens semânticos propagam dark mode aos 4 apps sem coordenação JS (prova real de microfrontends). Mas a especificidade se dilui em duas frentes: (a) 8 gradientes arco-íris + emoji por tela (apps/catalog/src/data/products.ts:16-86) leem como template, não como "indigo + slate"; (b) a telemetria de arquitetura (chips no header, badge no h1, legenda de widget, portas no rodapé) está em quatro camadas dentro do fluxo de compra — para o público dev é character, para o consumidor é ruído. Oportunidade perdida mais clara: o preço nunca usa a cor da marca (Price.tsx:10) — hierarquia de preço depende só de peso/contraste, e é exatamente onde o dark mode falha.

**Deterministic scan (B)**: CLI estático `detect --json` = 0 achados (exit 0, JSON `[]`; probes de sanidade confirmam que o detector funciona — a cegueira é do modo estático com estilos inline de objetos React). Overlay em página = 7 anti-patterns: `undersized-ui-text` (10px no "POC MFE"), `line-length` (~160 chars), `ai-color-palette` ×4, `layout-transition` (`transition: height`). O detector pegou o que a revisão missed: texto de 10px e linhas de ~160 chars. Acordo: `ai-color-palette` ×4 confirma o achado sobre os gradientes arco-íris. Falsos positivos prováveis: `layout-transition` (transição de height é intenção) e boa parte de `ai-color-palette` (arte de produto é placeholder deliberado).

**Visual overlays**: injeção funcionou (6 marcações + banner; console `[impeccable] 7 anti-patterns found`); screenshot em `C:\Users\gusta\AppData\Local\Temp\opencode\critique-detect-overlay.png`. Aba fechada na limpeza — não há overlay aberto agora.

## Overall Impression
O funil é sólido até o carrinho: detalhe e checkout parecem produto real (preço grande, estoque/envio, validação clara), e a engenharia de tokens/multi-remote funciona de verdade. O que não funciona é o contraste no dark (preço a 1.24:1), o carrinho no mobile (overflow esconde total e "Remover") e a hierarquia da home (CTA indigo sobre indigo). Maior oportunidade: fazer a telemetria e a arte de produto pararem de brigar com a compra.

## What's Working
1. Tokens semânticos propagam dark aos 4 remotes sem JS (theme.css) — provado nas capturas dark com estrutura idêntica.
2. Validação de checkout exemplar: borda destructive + mensagem por campo + aria-invalid + role="alert" (CheckoutPage.tsx:187-231, field.tsx:217).
3. Feedback imediato de add-to-cart: "Adicionado" por 1200ms, toast transversal via event-bus e badge atualizando entre remotes (AddToCartButton.tsx:39, Toast.tsx:16).

## Priority Issues

**P0 — Preços ilegíveis no dark mode em todas as telas**
- Why it matters: pixel do preço (15,23,42) sobre card (30,41,59) = 1.24:1 (exige 4.5:1); o consumidor não lê preço nem total no dark, e o bug propaga aos 4 apps de uma vez pelo componente compartilhado.
- Fix: Price.tsx:10 usa a primitiva text-ink-900 (só light) — apontar para token semântico (text-card-foreground) e auditar outras primitivas fora do @theme.
- Suggested command: $impeccable colorize

**P0 — Carrinho quebra em duas frentes (mobile + reload)**
- Why it matters: (1) em 390–490px a linha do item estoura horizontalmente: total e "Remover" fora da tela (CartPage.tsx:105-140, flex-row nowrap + w-28 shrink-0); (2) achado na preparação: F5 zera o carrinho — store in-memory sem persist (packages/cart-store/src/store.ts:18), e o líder técnico que testa a demo vai pressionar F5.
- Fix: abaixo de lg, empilhar a linha do item, eliminar larguras fixas, min-w-0 no track; adicionar persist (localStorage) à store.
- Suggested command: $impeccable layout

**P1 — CTA primário invisível na home (indigo sobre indigo)**
- Why it matters: fundo do botão idêntico ao hero (HomePage.tsx:90 + Button default bg-primary) — o secundário rouba a primazia; hierarquia invertida na tela de entrada.
- Fix: variante contrastante sobre superfície primária para o CTA que deve vencer.
- Suggested command: $impeccable bolder

**P1 — Filtro de categoria sem estado selecionado perceptível**
- Why it matters: ativo (241,245,249) vs inativo (248,250,252) = 1.06:1 (toggle.tsx:6 só aplica bg-muted) — o usuário presume que o clique não funcionou.
- Fix: selecionado com borda/cor da marca + marcador visual, não fill de 2% de luminância.
- Suggested command: $impeccable clarify

**P1 — Texto de sucesso abaixo do AA (Grátis, Imediato)**
- Why it matters: #059669 sobre branco = 3.77:1 (CartPage.tsx:160, ProductDetailPage.tsx:98) — descumpre a meta WCAG AA do próprio PRODUCT.md:49-50.
- Fix: variante de success com nível AA no light e no dark.
- Suggested command: $impeccable harden

## Persona Red Flags (Casey · Riley · Jordan — e-commerce/checkout)

**Casey (mobile, uma mão)**: em 11-cart-light-mobile.png o total some e "Remover" está fora da tela — o funil não completa no celular; alvos de 28–32px (<44px) no stepper e no tema; a ação primária (Adicionar) vive no card, longe da zona do polegar na listagem.

**Riley (stress tester)**: F5 no meio do fluxo apaga o carrinho silenciosamente (sem aviso, sem recuperação); clicar num filtro parece não fazer nada; "Esvaziar carrinho" é destrutivo sem confirmação nem undo; placeholder "Ada Lovelace" + erro no mesmo campo parece dado preenchido.

**Jordan (primeira vez)**: "Explorar catálogo" parece texto solto e o botão branco parece o principal (hierarquia invertida); jargão do hero ("contratos tipados", "falhas isoladas") sem tradução; chips `state: 1 · bus: 1` no header exigem conhecimento prévio; o clique no filtro não dá certeza de que funcionou.

## Minor Observations
- Raio inconsistente: imagem de detalhe rounded-3xl (36px) vs card rounded-xl (12px) (ProductDetailPage.tsx:70, card.tsx:14).
- Padding de card muda entre telas: p-4 (listagem) vs p-6 (detalhe).
- Coluna direita do funil desloca 72px entre passos: carrinho 3 col vs checkout 5 col.
- Header translúcido (bg-background/75 backdrop-blur, Header.tsx:15) deixa gradiente de card sangrar sob a nav e derruba labels inativos a ~3.16:1 em rolagem.
- Texto de 10px no badge "POC MFE" (detector: undersized-ui-text); linhas de ~160 chars (detector: line-length).
- Toast cobre a legenda do rodapé em página de detalhe (Toaster position="bottom-right").
- Espaço morto: conteúdo termina antes dos 60% da altura em 1440×900 em detalhe/carrinho/checkout.
- Header mobile não tem gatilho de menu — nav quebra em 2 linhas (funciona, mas denso).

## Questions to Consider
- A telemetria de arquitetura deve permanecer dentro do fluxo de compra ou virar um modo "avaliador" alternável?
- Arte de produto (gradiente + emoji) é o placeholder definitivo da POC ou o primeiro rascunho de um catálogo real — que direção de identidade ela deve tomar?
- Dark mode é escopo de "ship" nesta POC? Hoje ele só atinge o piso com a correção do token de preço.
- O funil deveria ter uma única grade de colunas entre carrinho e checkout?
