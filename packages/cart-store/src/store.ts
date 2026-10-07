import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem, Product } from '@microstore/contracts';

export type { CartItem };

export interface CartStoreState {
  items: CartItem[];
  /** Adiciona ao estoque do item; retorna a quantidade realmente adicionada. */
  add: (product: Product, qty?: number) => number;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

const PERSIST_KEY = 'microstore-cart';

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as { product?: unknown; qty?: unknown };
  const product = item.product as { id?: unknown; stock?: unknown } | undefined;
  return (
    !!product &&
    typeof product.id === 'string' &&
    typeof product.stock === 'number' &&
    typeof item.qty === 'number'
  );
}

/** Fallback in-memory para ambientes sem localStorage (ex.: testes em node). */
const memoryFallback = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const cartStorage =
  typeof localStorage !== 'undefined'
    ? createJSONStorage<CartStoreState>(() => localStorage)
    : createJSONStorage<CartStoreState>(() => memoryFallback);

/**
 * Store do carrinho — compartilhada como singleton via Module Federation.
 *
 * Nunca importa React nem emite eventos: quem chama as ações decide se
 * notifica o event-bus. Isso mantém o store testável e sem acoplamento.
 *
 * Regras de negócio vivem AQUI (não na UI):
 * - quantidade é sempre limitada a `product.stock` (add e setQty);
 * - o estado é persistido em localStorage e revalidado na rehidratação.
 */
export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      items: [],

      add: (product, qty = 1) => {
        if (qty <= 0 || product.stock <= 0) return 0;
        let added = 0;
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);
          const current = existing?.qty ?? 0;
          const target = Math.min(current + qty, product.stock);
          added = target - current;
          if (added <= 0) return state;
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { product, qty: target }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { product, qty: target }] };
        });
        return added;
      },

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      setQty: (productId, qty) =>
        set((state) => {
          const item = state.items.find((entry) => entry.product.id === productId);
          if (!item) return state;
          const clamped = Math.min(qty, item.product.stock);
          if (clamped <= 0) {
            return { items: state.items.filter((entry) => entry.product.id !== productId) };
          }
          if (clamped === item.qty) return state;
          return {
            items: state.items.map((entry) =>
              entry.product.id === productId ? { ...entry, qty: clamped } : entry,
            ),
          };
        }),

      clear: () => set({ items: [] }),
    }),
    {
      name: PERSIST_KEY,
      version: 1,
      storage: cartStorage,
      merge: (persistedState, currentState) => {
        const raw = (persistedState as { items?: unknown } | undefined)?.items;
        const items = Array.isArray(raw) ? raw : [];
        return {
          ...currentState,
          items: items
            .filter(isCartItem)
            .map(({ product, qty }) => ({
              product,
              qty: Math.min(Math.max(qty, 0), product.stock),
            }))
            .filter((item) => item.qty > 0),
        };
      },
    },
  ),
);

export const selectCount = (state: CartStoreState): number =>
  state.items.reduce((total, item) => total + item.qty, 0);

export const selectTotal = (state: CartStoreState): number =>
  state.items.reduce((total, item) => total + item.qty * item.product.price, 0);

export function useCartCount(): number {
  return useCartStore(selectCount);
}

export function useCartTotal(): number {
  return useCartStore(selectTotal);
}
