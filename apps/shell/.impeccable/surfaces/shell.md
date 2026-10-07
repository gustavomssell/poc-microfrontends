---
version: 1
slug: "shell"
primary_target: "shell"
related_targets: ["catalog","cart","checkout"]
---

# Shell (primária) + catalog, cart, checkout (relacionados)

## Escopo e modo

Operate. O shell compõe header, footer, rotas e os três remotes; catalog/cart/checkout são as telas da mesma experiência. Trabalho: migrar a UI para primitivos shadcn/ui, ícones lucide-react e dark mode, preservando identidade indigo, fluxos e contratos.

## Audiência e job

Devs/líderes técnicos avaliando a arquitetura. Sucesso: o fluxo completo segue verde (smoke 17/17, preview 7/7, resilience 8/8) com UI visivelmente mais polida e acessível (WCAG 2.1 AA).

## Prova e conteúdo

Scripts executáveis como evidência; screenshots desktop+mobile novos em `.impeccable/review/` e `docs/screenshots/`; dados mockados e cópia pt-BR existentes preservados.

## Restrições

Identidade indigo (vinculante), lucide-react, dark mode incluso, shadcn/ui como fonte dos primitivos, Tailwind v4, sem mudança de fluxos/rotas/contratos, sem backend, MF bridge intacto.

## Direção escolhida e momento memorável

Extensão do mundo incumbente: camada shadcn sobre tokens indigo/slate light+dark. Momento: o toggle dark aplicado de ponta a ponta (shell + remotes) no DOM compartilhado, sem injeção de CSS em runtime.

## Pendências

Nenhuma decisão visual aberta; escopo fechado nas rodadas de entrevista.

## Direction contract

### THESIS

UI inteira sobre primitivos shadcn/ui com tokens semânticos mapeados na identidade indigo; recusa componentes ad-hoc com classes manuais e o misturado atual entre componentes próprios e utilitários soltos.

### OWN-WORLD

Vars shadcn `:root`/`.dark` mapeadas para brand indigo + neutros slate via `@theme inline` (Tailwind v4); ícones lucide-react; radius do sistema; superfícies background/muted/card/border; dark via classe `.dark` no html propagada aos remotes pelo DOM compartilhado.

### STORY

O avaliador vê a mesma MicroStore com UI consistente, dark mode e estados de loading/vazio/erro tratados, e conclui que a arquitetura sustenta um design system real entre apps.

### FIRST VIEWPORT

Header do shell: marca, navegação com estado ativo, badge de status do remote, carrinho com contador e toggle dark. Catálogo: chips de categoria (toggle-group) e grid de cards shadcn com ícone lucide, preço e ação primária clara.

### FORM

Forma: extensão do sistema incumbente (primitivos shadcn sobre o mundo indigo existente). Seed key: n/a — extensão não passa pela roleta de conceito.

### FINISH

unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
