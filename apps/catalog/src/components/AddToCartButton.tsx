import { useCartStore } from '@microstore/cart-store';
import type { Product } from '@microstore/contracts';
import { eventBus } from '@microstore/event-bus';
import { Button } from '@microstore/ui';
import { CheckIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AddToCartButtonProps {
  product: Product;
  qty?: number;
  fullWidth?: boolean;
}

/**
 * O ponto exato onde as três camadas de comunicação se encontram:
 *
 * 1. escreve na store compartilhada (singleton via MF)  → estado
 * 2. emite um evento nomeado no event-bus                → notificação
 * 3. feedback visual local (estado React deste botão)    → UI
 *
 * O estoque é respeitado na store (add retorna o que entrou de fato);
 * o evento e o feedback usam esse valor — nunca a quantidade pedida.
 */
export function AddToCartButton({ product, qty = 1, fullWidth = false }: AddToCartButtonProps) {
  const add = useCartStore((state) => state.add);
  const inCart = useCartStore(
    (state) => state.items.find((item) => item.product.id === product.id)?.qty ?? 0,
  );
  const [added, setAdded] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
    },
    [],
  );

  const atLimit = product.stock - inCart <= 0;

  const handleAdd = () => {
    const actuallyAdded = add(product, qty);
    if (actuallyAdded <= 0) return;
    eventBus.emit('cart:item-added', { product, qty: actuallyAdded });
    setAdded(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Button
      onClick={handleAdd}
      variant={added ? 'outline' : 'default'}
      className={fullWidth ? 'w-full' : ''}
      disabled={atLimit}
      aria-label={
        atLimit && !added
          ? `Limite do estoque no carrinho: ${product.name}`
          : `Adicionar ${product.name} ao carrinho`
      }
    >
      {added ? (
        <>
          <CheckIcon data-icon="inline-start" />
          Adicionado
        </>
      ) : atLimit ? (
        'Limite no carrinho'
      ) : qty > 1 ? (
        `Adicionar × ${qty}`
      ) : (
        'Adicionar'
      )}
    </Button>
  );
}
