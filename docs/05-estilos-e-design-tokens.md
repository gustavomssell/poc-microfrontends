# 05 — Estilos e design tokens

> Tailwind CSS 4 no modo CSS-first, tokens compartilhados entre apps e o
> isolamento que impede um remote de poluir o outro.

## Design tokens em um arquivo só

Os tokens vivem em `packages/ui/src/theme.css` no formato CSS-first do
Tailwind 4 — sem `tailwind.config.js`:

```css
@import 'tailwindcss';

@theme {
  --color-ink-50: #f8fafc;      /* … escala ink (6 passos) … */
  --color-brand-600: #4f46e5;   /* … escala brand (indigo) … */
  --font-sans: ui-sans-serif, system-ui, …; /* stack do sistema */
}
```

Cada app importa o tema na sua entry e estende com seus utilitários:

```css
/* apps/shell/src/styles.css (idêntico nos 4 apps) */
@import 'tailwindcss';
@import '@microstore/ui/theme.css';

@source '../../../packages/ui/src';  /* + os src dos 4 apps: cada build */
@source '../../shell/src';           /* gera o MESMO conjunto de */
@source '../../catalog/src';         /* utilitários na MESMA ordem */
@source '../../cart/src';
@source '../../checkout/src';
```

Como o CSS é **compilado por cada app**, os utilitários usados existem em
cada `dist/` — não há dependência de estilos "herdados" de outro bundle.

## Componentes compartilhados vs. estilo local

- `@microstore/ui` exporta `Button`, `Card`, `Price`, `MfeLink`,
  `formatCurrency` — usados por shell **e** remotes, sempre com o mesmo
  visual porque os tokens são os mesmos.
- Detalhe específico de uma tela (gradiente de produto, stepper de
  quantidade) fica no próprio app, com classes utilitárias.

## Isolamento entre MFEs

1. **Sem CSS global de app**: cada remote estiliza a partir da própria
   raiz (`data-mfe="catalog" | "cart" | "checkout"`, e
   `data-mfe-widget="…"` nos widgets).
2. **Escopo visual**: o reset/base do Tailwind é idêntico em todos (mesmo
   tema) — não existe "CSS do catálogo vaza para o carrinho".
3. **Tailwind evita colisão acidental**: utilitários têm nome derivado da
   propriedade; o risco real seria classes custom com nome genérico — a
   convenção é prefixar por app quando isso acontecer.

O doc-completo sobre a mecânica de build (o que gera cada CSS) também
está em [04 — Shared deps](./04-shared-deps-e-singletons.md) (o `ui` não é
compartilhado justamente por causa do CSS).

## CSS em produção (validado, não suposto)

Risco registrado no `PLANO.md` nº 2: "CSS do remote não ser injetado no
host". Verificado com o build real:

```bash
npm run build
npm run preview          # 4 servidores, 5000–5003
node scripts/verify-preview.mjs   # 7/7 ✓
```

O script checa **propriedades computadas** de elementos vindos do remote
ex.: `border-radius: 12px` num card do catálogo montado no shell) —
prova de que o CSS do remote chegou ao host em produção.

## Como adicionar um token

1. Declare em `packages/ui/src/theme.css` dentro de `@theme`
   (`--color-<escala>-<passo>` ou `--font-…`).
2. `npm run build` (o tema é resolvido em cada app).
3. Use o utilitário correspondente (`bg-<escala>-<passo>`) em qualquer
   app — sem importar nada além do `styles.css` que já existe.

Tokens atuais: escalas `ink` (6 passos: 50/100/200/500/700/900), `brand`
(indigo), `success`, `warning`, `danger` + tipografia system-ui (stacks
`--font-sans`/`--font-mono` no mesmo bloco).

Próximo: [06 — Resiliência e observabilidade](./06-resiliencia-e-observabilidade.md).
