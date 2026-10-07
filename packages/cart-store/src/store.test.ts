import { beforeEach, describe, expect, it } from 'vitest';
import type { Product } from '@microstore/contracts';
import {
  getStoreInstanceIds,
  resetStoreInstanceIds,
  selectCount,
  selectTotal,
  storeModuleId,
  useCartStore,
} from './index';

const keyboard: Product = {
  id: 'kb-1',
  name: 'Teclado Mecânico',
  description: 'Switch roxo',
  price: 499.9,
  category: 'periféricos',
  emoji: '⌨️',
  hue: 260,
  stock: 10,
};

const mouse: Product = {
  id: 'ms-1',
  name: 'Mouse Ergonômico',
  description: '7 botões',
  price: 249.9,
  category: 'periféricos',
  emoji: '🖱️',
  hue: 200,
  stock: 5,
};

beforeEach(() => {
  useCartStore.getState().clear();
});

describe('useCartStore', () => {
  it('adiciona um item novo', () => {
    useCartStore.getState().add(keyboard);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({ product: keyboard, qty: 1 });
  });

  it('acumula quantidade quando o mesmo produto é adicionado duas vezes', () => {
    useCartStore.getState().add(keyboard);
    useCartStore.getState().add(keyboard, 2);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(3);
  });

  it('remove item pelo productId', () => {
    useCartStore.getState().add(keyboard);
    useCartStore.getState().add(mouse);
    useCartStore.getState().remove(keyboard.id);
    expect(useCartStore.getState().items.map((i) => i.product.id)).toEqual(['ms-1']);
  });

  it('setQty com zero remove o item', () => {
    useCartStore.getState().add(keyboard, 2);
    useCartStore.getState().setQty(keyboard.id, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('esvazia o carrinho no clear', () => {
    useCartStore.getState().add(keyboard);
    useCartStore.getState().add(mouse);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('limites de estoque', () => {
  it('add não deixa a quantidade passar de product.stock', () => {
    const added = useCartStore.getState().add(keyboard, 15);
    expect(added).toBe(10);
    expect(useCartStore.getState().items[0].qty).toBe(10);
  });

  it('acumula até o limite do estoque entre adições', () => {
    useCartStore.getState().add(mouse, 3);
    const added = useCartStore.getState().add(mouse, 5);
    expect(added).toBe(2);
    expect(useCartStore.getState().items[0].qty).toBe(5);
  });

  it('add retorna 0 e não muda o estado quando já está no limite', () => {
    useCartStore.getState().add(mouse, 5);
    const added = useCartStore.getState().add(mouse, 1);
    expect(added).toBe(0);
    expect(useCartStore.getState().items[0].qty).toBe(5);
  });

  it('add com qty zero ou estoque zero retorna 0', () => {
    expect(useCartStore.getState().add(keyboard, 0)).toBe(0);
    expect(useCartStore.getState().items).toHaveLength(0);
    const semEstoque = { ...keyboard, id: 'zero-1', stock: 0 };
    expect(useCartStore.getState().add(semEstoque, 2)).toBe(0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('setQty acima do estoque é cortado para stock', () => {
    useCartStore.getState().add(mouse, 1);
    useCartStore.getState().setQty(mouse.id, 99);
    expect(useCartStore.getState().items[0].qty).toBe(5);
  });

  it('setQty negativo remove o item', () => {
    useCartStore.getState().add(keyboard, 2);
    useCartStore.getState().setQty(keyboard.id, -3);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('selectors', () => {
  it('calcula contagem e total somando qty × preço', () => {
    useCartStore.getState().add(keyboard, 2);
    useCartStore.getState().add(mouse, 1);
    const state = useCartStore.getState();
    expect(selectCount(state)).toBe(3);
    expect(selectTotal(state)).toBeCloseTo(499.9 * 2 + 249.9);
  });

  it('retorna zero para carrinho vazio', () => {
    const state = useCartStore.getState();
    expect(selectCount(state)).toBe(0);
    expect(selectTotal(state)).toBe(0);
  });
});

describe('detecção de cópias duplicadas da store', () => {
  it('registra esta avaliação do módulo em globalThis', () => {
    expect(getStoreInstanceIds()).toContain(storeModuleId);
  });

  it('reset limpa o registro (útil entre testes/demos)', () => {
    resetStoreInstanceIds();
    expect(getStoreInstanceIds()).toHaveLength(0);
  });
});
