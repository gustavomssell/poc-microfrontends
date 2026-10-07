import type { Product } from '@microstore/contracts';
import { Card, CardContent, Price, productGradient } from '@microstore/ui';
import { Badge } from '@microstore/ui';
import { Link } from 'react-router-dom';
import { AddToCartButton } from './AddToCartButton';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="gap-0 py-0">
      <Link
        to={`/${product.id}`}
        className="relative block h-36"
        style={{ background: productGradient(product.hue) }}
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <span
          className="absolute inset-0 grid place-items-center text-4xl"
          aria-hidden
        >
          {product.emoji}
        </span>
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 border border-background/40 bg-background/85 font-semibold tracking-wide uppercase backdrop-blur"
        >
          {product.category}
        </Badge>
      </Link>

      <CardContent className="flex flex-1 flex-col p-4">
        <Link
          to={`/${product.id}`}
          className="font-medium text-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <Price value={product.price} className="text-sm" />
          <AddToCartButton product={product} />
        </div>
      </CardContent>
    </Card>
  );
}
