import { eventBus } from '@microstore/event-bus';
import { formatCurrency, Toaster } from '@microstore/ui';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Ouvinte transversal do event-bus + Toaster (sonner).
 *
 * O shell NÃO importa código do catálogo/carrinho/checkout para saber o que
 * aconteceu — ele só assina eventos nomeados (contrato em @microstore/contracts).
 * O `toast()` do sonner é module-level: funciona fora da árvore React.
 */
export function ToastContainer() {
  useEffect(() => {
    const unsubscribes = [
      eventBus.on('cart:item-added', ({ product, qty }) =>
        toast.success(`${qty}× ${product.name} adicionado ao carrinho`),
      ),
      eventBus.on('cart:item-removed', () => toast('Item removido do carrinho')),
      eventBus.on('cart:cleared', () => toast('Carrinho esvaziado')),
      eventBus.on('order:placed', ({ orderId, total }) =>
        toast.success(`Pedido ${orderId} confirmado — ${formatCurrency(total)}`),
      ),
      eventBus.on('remote:status', ({ remote, status }) => {
        if (status === 'error') {
          toast.error(
            `O microfrontend "${remote}" não respondeu — veja o slot na página`,
          );
        }
      }),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return <Toaster position="bottom-right" closeButton />;
}
