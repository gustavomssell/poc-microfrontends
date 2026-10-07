# 03 — Comunicação e estado

> As três camadas de comunicação entre MFEs — contratos, estado
> síncrono e eventos — e o happy path que as atravessa.

## As três camadas

```
┌──────────────┐   tipos + registry    ┌──────────────────────┐
│  contracts   │◄──────────────────────│ shell · catalog ·    │
└──────────────┘      (compile time)   │ cart · checkout      │
                                       └──────────┬───────────┘
┌──────────────┐  singleton via MF shared         │
│  cart-store  │◄─────────────────────────────────┤
└──────────────┘   estado síncrono (runtime)      │
                                                 │
┌──────────────┐  singleton via MF shared         │
│  event-bus   │◄─────────────────────────────────┘
└──────────────┘   eventos desacoplados
```

Nenhum app importa código de outro app — só destes packages.

## 1. `@microstore/contracts` — fronteira de tipos

- `Product`, `CartItem`, `Order`, `OrderCustomer` — domínio;
- `MfeEventMap` / `MfeEventName` — **quais eventos existem e o payload de
  cada um** (o compilador rejeita um evento inventado);
- `REMOTES` — nome, rota, porta e `entryEnvVar` de cada remote (lido por
  shell, builds e docs);
- `REMOTE_EXPOSES` — mapa documental do que cada remote expõe (`app` vs
  `widget`); os `exposes` em si ficam no `vite.config.ts` de cada remote;
- `RemoteStatus` — `idle | loading | ok | error`.

`RemoteName` e `REMOTES` tipam as chamadas do shell; `loadRemote` é a API
genérica do runtime e cada chamada converte o módulo com tipo explícito —
sem `any` solto.

## 2. `@microstore/cart-store` — estado síncrono compartilhado

Store Zustand registrada como `shared: { '@microstore/cart-store':
{ singleton: true } }` em **todos** os apps. Uma única instância no
runtime — é o que faz o badge do header e a página do carrinho
conversarem sem nenhum evento. O estado é **persistido em `localStorage`**
(chave `microstore-cart`, middleware `zustand/persist`): um reload não
zera o carrinho e, na rehidratação, as quantidades são revalidadas contra
`product.stock`.

```ts
// uso (idêntico em qualquer app)
const items = useCartStore((s) => s.items);
const add   = useCartStore((s) => s.add);
const count = useCartCount();   // selector pronto
```

### Como provamos que é uma instância só

Cada cópia do package registra um `instanceId` em
`globalThis.__MICROSTORE_CART_STORE_IDS__`. O chip **`state: N`** do header
(`StatusChips`) lê esse array a cada 2s:

- `state: 1` → pontinho verde: compartilhamento negociado corretamente;
- `state: 2` → ponto vermelho + chip em tom de âmbar: algum app embalou a
  própria cópia (o problema aparece em vez de virar bug misterioso de
  estado divergente).

O mesmo vale para o bus (`bus: N`). Testes unitários cobrem a lógica da
store e do bus (`packages/*/src/*.test.ts`, 21 testes: 15 na store + 6
no bus).

## 3. `@microstore/event-bus` — eventos desacoplados

Barramento tipado (`TypedEventBus`) para efeitos transversais. O shell
escuta sem conhecer o código dos remotes:

| Evento | Quem emite | Quem escuta | Efeito |
|---|---|---|---|
| `cart:item-added` | catalog (AddToCartButton) | shell (Toast) | toast "adicionado" |
| `cart:item-removed` | cart | shell | toast informativo |
| `cart:cleared` | cart | shell | toast informativo |
| `order:placed` | checkout | shell | toast "pedido confirmado" |
| `remote:status` | shell (remoteStatusStore) | shell (Toast) | aviso quando remote cai |

O mapa completo, com payload, está em
`packages/contracts/src/events.ts` — emitir algo fora do mapa é erro de
compilação.

## O happy path (e onde ele acontece no código)

```
catálogo: usuário clica em "Adicionar"
  │ apps/catalog/src/components/AddToCartButton.tsx
  ├─ add(product, qty)                       → store compartilhada
  ├─ eventBus.emit('cart:item-added', …)     → bus tipado
  └─ estado local do botão ("Adicionado ✓")  → feedback imediato
        │
        ├─ MiniCart no header re-renderiza   (mesma store — sem glue code)
        ├─ shell mostra o toast              (event bus — sem importar catalog)
        └─ /cart e /checkout leem o mesmo estado ao montar

checkout: "Confirmar pedido"
  │ apps/checkout/src/pages/CheckoutPage.tsx
  ├─ eventBus.emit('order:placed', …)        → toast no shell
  ├─ clear()                                 → badge volta a 0 (store)
  └─ UI local mostra "Pedido confirmado"
```

Tudo validado de ponta a ponta em `scripts/smoke.mjs` (17 passos),
incluindo a ida ao checkout e a zeragem do badge.

## Quando usar cada camada

| Preciso de… | Use | Exemplo |
|---|---|---|
| Estado que vários apps **leem e escrevem** | `cart-store` | carrinho, badge, checkout |
| Um aviso/transitory que outro domínio **emite** | `event-bus` | toasts, status de remote |
| Um formato/nome que outro time **assina** | `contracts` | payload de evento, lista de remotes |
| Re-render reativo dentro de um app | estado local (React) | quantidade no stepper do detalhe |

Próximo: [04 — Shared deps e singletons](./04-shared-deps-e-singletons.md).
