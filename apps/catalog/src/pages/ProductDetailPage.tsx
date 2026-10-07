import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react';
import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  MfeLink,
  Price,
  productGradient,
} from '@microstore/ui';
import { useState } from 'react';
import { AddToCartButton } from '../components/AddToCartButton';
import { getProduct } from '../data/products';

export function ProductDetailPage() {
  const { id } = useParams();
  const product = getProduct(id);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div data-mfe="catalog">
        <Empty className="min-h-[45vh]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <h1 className="text-base font-semibold tracking-tight">
              Produto não encontrado
            </h1>
            <EmptyDescription>
              Este id não existe no catálogo.
            </EmptyDescription>
          </EmptyHeader>
          <Link to="/" className={buttonVariants({ variant: 'outline' })}>
            <ArrowLeftIcon data-icon="inline-start" />
            Voltar ao catálogo
          </Link>
        </Empty>
      </div>
    );
  }

  const decrement = () => setQty((current) => Math.max(1, current - 1));
  const increment = () => setQty((current) => Math.min(product.stock, current + 1));

  return (
    <div data-mfe="catalog" className="flex flex-col gap-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeftIcon aria-hidden />
        Voltar ao catálogo
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div
          className="relative h-64 rounded-3xl sm:h-80"
          style={{ background: productGradient(product.hue) }}
        >
          <span
            className="absolute inset-0 grid place-items-center text-7xl"
            aria-hidden
          >
            {product.emoji}
          </span>
        </div>

        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col gap-4 p-6">
            <Badge variant="secondary" className="w-fit font-semibold tracking-wide uppercase">
              {product.category}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <dl className="flex gap-6 text-sm">
              <div>
                <dt className="text-muted-foreground">Estoque</dt>
                <dd className="font-semibold">{product.stock} un.</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Envio</dt>
                <dd className="font-semibold text-success-600">Imediato</dd>
              </div>
            </dl>

            <Price value={product.price} className="block text-2xl" />

            <div className="flex items-center gap-3">
              <div className="flex items-center overflow-hidden rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={decrement}
                  disabled={qty <= 1}
                  aria-label="Diminuir quantidade"
                >
                  <MinusIcon />
                </Button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums">
                  {qty}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={increment}
                  disabled={qty >= product.stock}
                  aria-label="Aumentar quantidade"
                >
                  <PlusIcon />
                </Button>
              </div>
              <div className="min-w-0 flex-1">
                <AddToCartButton product={product} qty={qty} fullWidth />
              </div>
            </div>

            <MfeLink
              to="/cart"
              className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Ir para o carrinho
              <ArrowRightIcon aria-hidden />
            </MfeLink>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
