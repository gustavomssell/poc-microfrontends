import { useCartCount, useCartStore, useCartTotal } from '@microstore/cart-store';
import { eventBus } from '@microstore/event-bus';
import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  cn,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  MfeLink,
  Price,
  formatCurrency,
  productGradient,
} from '@microstore/ui';
import { MinusIcon, PlusIcon, ShoppingCartIcon } from 'lucide-react';

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const setQty = useCartStore((state) => state.setQty);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const count = useCartCount();
  const total = useCartTotal();

  const changeQty = (productId: string, qty: number) => {
    setQty(productId, qty);
    if (qty <= 0) {
      eventBus.emit('cart:item-removed', { productId });
    }
  };

  const handleRemove = (productId: string) => {
    remove(productId);
    eventBus.emit('cart:item-removed', { productId });
  };

  const handleClear = () => {
    clear();
    eventBus.emit('cart:cleared', undefined);
  };

  if (items.length === 0) {
    return (
      <div data-mfe="cart">
        <Empty className="min-h-[45vh]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingCartIcon />
            </EmptyMedia>
            <h1 className="text-base font-semibold tracking-tight">
              Carrinho vazio
            </h1>
            <EmptyDescription>
              Os itens adicionados no catálogo aparecem aqui — a store é a
              mesma instância em todos os microfrontends.
            </EmptyDescription>
          </EmptyHeader>
          <MfeLink to="/catalog" className={buttonVariants()}>
            Explorar catálogo
          </MfeLink>
        </Empty>
      </div>
    );
  }

  return (
    <div data-mfe="cart" className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Carrinho</h1>
          <Badge variant="outline" className="font-mono font-normal">
            remote cart · :5002
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {count} {count === 1 ? 'item' : 'itens'} — lendo a store
          compartilhada via Module Federation.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <ul className="flex flex-col gap-3 lg:col-span-2">
          {items.map(({ product, qty }) => (
            <li key={product.id}>
              <Card size="sm" className="flex-row px-4">
                <div
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-xl text-2xl"
                  style={{ background: productGradient(product.hue) }}
                  aria-hidden
                >
                  {product.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(product.price)} · unidade
                  </p>
                </div>

                <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => changeQty(product.id, qty - 1)}
                    aria-label={`Diminuir quantidade de ${product.name}`}
                  >
                    <MinusIcon />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums">
                    {qty}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={qty >= product.stock}
                    onClick={() => changeQty(product.id, qty + 1)}
                    aria-label={
                      qty >= product.stock
                        ? `Estoque máximo de ${product.name} no carrinho`
                        : `Aumentar quantidade de ${product.name}`
                    }
                  >
                    <PlusIcon />
                  </Button>
                </div>

                <Price
                  value={product.price * qty}
                  className="w-28 shrink-0 text-right text-sm"
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(product.id)}
                  className="text-danger-500 hover:bg-danger-500/10 hover:text-danger-500"
                  aria-label={`Remover ${product.name} do carrinho`}
                >
                  Remover
                </Button>
              </Card>
            </li>
          ))}
        </ul>

        <Card className="h-fit">
          <CardHeader>
            <h2 className="text-base leading-snug font-semibold">Resumo</h2>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>Itens</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {count}
                </dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>Frete</dt>
                <dd className="font-medium text-success-600">Grátis</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>
                  <Price value={total} />
                </dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <MfeLink to="/checkout" className={cn(buttonVariants(), 'w-full')}>
              Finalizar compra
            </MfeLink>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="w-full text-muted-foreground hover:text-danger-500"
            >
              Esvaziar carrinho
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
