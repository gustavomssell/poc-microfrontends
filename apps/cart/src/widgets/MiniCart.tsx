import { useCartCount, useCartTotal } from '@microstore/cart-store';
import { buttonVariants, cn, formatCurrency } from '@microstore/ui';
import { ShoppingCartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
// Expose separado do App — carrega o CSS do cart na home do shell.
import '../styles.css';

/**
 * WIDGET exposto pelo remote (./MiniCart) — montado no header do shell.
 *
 * Lê a MESMA store que catálogo e checkout escrevem: badge atualiza em
 * tempo real sem o shell importar código deste remote.
 */
export default function MiniCart() {
  const count = useCartCount();
  const total = useCartTotal();

  return (
    <Link
      to="/cart"
      data-mfe-widget="cart/MiniCart"
      className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}
      aria-label={`Carrinho com ${count} itens`}
    >
      <ShoppingCartIcon data-icon="inline-start" />
      <span className="tabular-nums">{count}</span>
      <span className="hidden font-normal opacity-90 sm:inline">
        {formatCurrency(total)}
      </span>
    </Link>
  );
}
