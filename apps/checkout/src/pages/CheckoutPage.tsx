import { useCartStore, useCartTotal } from '@microstore/cart-store';
import type { CartItem, Order } from '@microstore/contracts';
import { eventBus } from '@microstore/event-bus';
import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  MfeLink,
  Price,
  formatCurrency,
} from '@microstore/ui';
import { CircleCheckIcon, ReceiptTextIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type CustomerErrors = Partial<Record<'name' | 'email' | 'card', string>>;

function generateOrderId(): string {
  return `MS-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

export function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const total = useCartTotal();

  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState({ name: '', email: '', card: '' });
  const [errors, setErrors] = useState<CustomerErrors>({});

  /** Atualiza o campo E descarta o erro dele — erro velho não sobrevive à correção. */
  const updateCustomer = <K extends keyof typeof customer>(
    field: K,
    value: string,
  ) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = (): CustomerErrors => {
    const next: CustomerErrors = {};
    if (customer.name.trim().length < 2) {
      next.name = 'Informe seu nome completo.';
    }
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) {
      next.email = 'Informe um e-mail válido.';
    }
    if (customer.card.replace(/\D/g, '').length < 12) {
      next.card = 'Informe ao menos 12 dígitos do cartão.';
    }
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const placed: Order = {
      id: generateOrderId(),
      items,
      total,
      customer: { ...customer },
      placedAt: new Date().toISOString(),
    };

    // 1. notifica (event-bus) → shell mostra o toast
    eventBus.emit('order:placed', { orderId: placed.id, total: placed.total });
    // 2. escreve na store compartilhada → badge e carrinho atualizam
    clear();
    // 3. UI local confirma
    setOrder(placed);
  };

  if (order) {
    const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
    return (
      <div data-mfe="checkout" className="mx-auto max-w-lg">
        <Card className="items-center p-10 text-center">
          <CircleCheckIcon className="size-12 text-success" aria-hidden />
          <h1 className="text-2xl font-bold tracking-tight">
            Pedido confirmado
          </h1>
          <p className="text-sm">
            Obrigado, <strong>{order.customer.name}</strong>! Seu pedido{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              {order.id}
            </code>{' '}
            foi criado pelo remote <strong>checkout</strong>.
          </p>
          <p className="text-3xl font-bold text-link">
            {formatCurrency(order.total)}
          </p>
          <p className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'} · carrinho
            esvaziado na store compartilhada
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <MfeLink to="/catalog" className={buttonVariants()}>
              Continuar comprando
            </MfeLink>
            <MfeLink to="/" className={buttonVariants({ variant: 'secondary' })}>
              Voltar à home
            </MfeLink>
          </div>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div data-mfe="checkout">
        <Empty className="min-h-[45vh]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptTextIcon />
            </EmptyMedia>
            <h1 className="text-base font-semibold tracking-tight">
              Nada para finalizar
            </h1>
            <EmptyDescription>
              O checkout lê a store compartilhada — adicione itens no catálogo
              para continuar.
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
    <div data-mfe="checkout" className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Finalizar compra
          </h1>
          <Badge variant="outline" className="font-mono font-normal" data-telemetry>
            remote checkout · :5003
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Este remote nunca viu o catálogo: ele apenas lê a mesma instância da
          store do carrinho.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-base leading-snug font-semibold">
                Dados de pagamento
              </h2>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="customer-name">
                      Nome completo
                    </FieldLabel>
                    <Input
                      id="customer-name"
                      value={customer.name}
                      onChange={(event) =>
                        updateCustomer('name', event.target.value)
                      }
                      placeholder="Ada Lovelace"
                      required
                      autoComplete="name"
                      aria-invalid={errors.name ? true : undefined}
                    />
                    <FieldError>{errors.name}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="customer-email">E-mail</FieldLabel>
                    <Input
                      id="customer-email"
                      type="email"
                      value={customer.email}
                      onChange={(event) =>
                        updateCustomer('email', event.target.value)
                      }
                      placeholder="ada@exemplo.com"
                      required
                      autoComplete="email"
                      aria-invalid={errors.email ? true : undefined}
                    />
                    <FieldError>{errors.email}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="customer-card">
                      Cartão (simulado)
                    </FieldLabel>
                    <Input
                      id="customer-card"
                      value={customer.card}
                      onChange={(event) =>
                        updateCustomer('card', event.target.value)
                      }
                      placeholder="4242 4242 4242 4242"
                      required
                      minLength={12}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className="font-mono"
                      aria-invalid={errors.card ? true : undefined}
                    />
                    <FieldError>{errors.card}</FieldError>
                  </FieldContent>
                </Field>
              </FieldGroup>

              <p className="mt-4 text-xs text-muted-foreground">
                Pagamento fictício — a POC não conversa com backend algum.
              </p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Confirmar pedido · {formatCurrency(total)}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <Card className="h-fit lg:col-span-1">
          <CardHeader>
            <h2 className="text-base leading-snug font-semibold">
              Seu pedido
            </h2>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {items.map((item: CartItem) => (
                <li key={item.product.id} className="flex items-center gap-3">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-lg"
                    aria-hidden
                  >
                    {item.product.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.qty} × {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <Price
                    value={item.product.price * item.qty}
                    className="text-sm"
                  />
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 font-bold">
              <span>Total</span>
              <Price value={total} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
