import type { Product } from './domain.ts';
import type { RemoteName, RemoteStatus } from './remotes.ts';

/**
 * Mapa de eventos tipados do MessageBus — a fonte única da verdade sobre
 * o que um remote pode emitir/escutar (contrato entre frontends).
 */
export interface MfeEventMap {
  'cart:item-added': { product: Product; qty: number };
  'cart:item-removed': { productId: string };
  'cart:cleared': undefined;
  'order:placed': { orderId: string; total: number };
  'remote:status': { remote: RemoteName; status: RemoteStatus };
}

export type MfeEventName = keyof MfeEventMap;
