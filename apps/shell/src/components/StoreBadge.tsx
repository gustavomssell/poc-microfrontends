import { useCartCount, useCartTotal } from '@microstore/cart-store';
import { buttonVariants, cn, formatCurrency } from '@microstore/ui';
import { ShoppingCartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Badge do carrinho escrito pelo PRÓPRIO shell.
 *
 * É o fallback do MiniCart remoto: se o remote "cart" estiver fora do ar,
 * o shell ainda consegue exibir a contagem — porque a store é compartilhada
 * como singleton via Module Federation (a mesma instância, não uma cópia).
 */
export function StoreBadge() {
  const count = useCartCount();
  const total = useCartTotal();

  return (
    <Link
      to="/cart"
      title="Fallback do shell: lê a store compartilhada (o remote MiniCart não carregou)"
      aria-label={`Carrinho com ${count} itens`}
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
    >
      <ShoppingCartIcon data-icon="inline-start" />
      <span>{count}</span>
      <span className="hidden font-normal text-muted-foreground sm:inline">
        {formatCurrency(total)}
      </span>
    </Link>
  );
}
