import type { Product } from '@microstore/contracts';
import { Card, CardContent, Price, productGradient } from '@microstore/ui';
import { Link } from 'react-router-dom';
import { AddToCartButton } from '../components/AddToCartButton';
import { PRODUCTS } from '../data/products';
// Widget é um expose separado do App — precisa carregar o CSS do catalog
// quando montado sozinho na home do shell.
import '../styles.css';

interface ProductGridProps {
  title?: string;
  limit?: number;
}

/**
 * WIDGET exposto pelo remote (./ProductGrid).
 *
 * Montado DENTRO da árvore do shell (home) — não cria router próprio; o
 * <Link> usa o react-router compartilhado, resolvendo para /catalog/:id.
 */
export default function ProductGrid({ title = 'Destaques', limit = 4 }: ProductGridProps) {
  const products: Product[] = PRODUCTS.slice(0, limit);

  return (
    <section data-mfe-widget="catalog/ProductGrid" aria-label={title}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="gap-0 py-0">
            <Link
              to={`/catalog/${product.id}`}
              className="relative block h-32"
              style={{ background: productGradient(product.hue) }}
              aria-label={`Ver detalhes de ${product.name}`}
            >
              <span
                className="absolute inset-0 grid place-items-center text-4xl"
                aria-hidden
              >
                {product.emoji}
              </span>
            </Link>
            <CardContent className="flex flex-1 flex-col p-3">
              <Link
                to={`/catalog/${product.id}`}
                className="text-sm font-medium text-foreground hover:text-link"
              >
                {product.name}
              </Link>
              <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                <Price value={product.price} className="text-sm" />
                <AddToCartButton product={product} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
