import { Badge, ToggleGroup, ToggleGroupItem } from '@microstore/ui';
import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES, PRODUCTS } from '../data/products';

export function ProductListPage() {
  const [category, setCategory] = useState<string | null>(null);
  const products = category
    ? PRODUCTS.filter((product) => product.category === category)
    : PRODUCTS;

  return (
    <div data-mfe="catalog" className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
          <Badge variant="outline" className="font-mono font-normal" data-telemetry>
            remote catalog · :5001
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Listagem e detalhe rodam como aplicação independente — e são montados
          no shell sob{' '}
          <code className="rounded bg-muted px-1 font-mono text-xs text-foreground">
            /catalog/*
          </code>
          .
        </p>
      </header>

      <ToggleGroup
        role="group"
        aria-label="Filtrar por categoria"
        variant="outline"
        value={category ? [category] : ['all']}
        onValueChange={(value) => {
          const next = value.find((item) => item !== 'all');
          setCategory(next ?? null);
        }}
        className="flex flex-wrap"
      >
        <ToggleGroupItem value="all">Todos</ToggleGroupItem>
        {CATEGORIES.map((item) => (
          <ToggleGroupItem key={item} value={item}>
            {item}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
