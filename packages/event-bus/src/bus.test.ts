import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TypedEventBus } from './bus';

describe('TypedEventBus', () => {
  let bus: TypedEventBus;

  beforeEach(() => {
    bus = new TypedEventBus();
  });

  it('notifica ouvintes registrados', () => {
    const handler = vi.fn();
    bus.on('cart:item-added', handler);
    bus.emit('cart:item-added', {
      product: {
        id: 'p1',
        name: 'Monitor',
        description: '',
        price: 1299,
        category: ' Displays',
        emoji: '🖥️',
        hue: 210,
        stock: 3,
      },
      qty: 1,
    });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].qty).toBe(1);
  });

  it('unsubscribe remove o ouvinte', () => {
    const handler = vi.fn();
    const unsubscribe = bus.on('cart:cleared', handler);
    unsubscribe();
    bus.emit('cart:cleared', undefined);
    expect(handler).not.toHaveBeenCalled();
  });

  it('off remove o ouvinte específico', () => {
    const handler = vi.fn();
    bus.on('order:placed', handler);
    bus.off('order:placed', handler);
    bus.emit('order:placed', { orderId: 'x', total: 10 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('eventos diferentes não vazam entre si', () => {
    const handler = vi.fn();
    bus.on('cart:item-added', handler);
    bus.emit('cart:cleared', undefined);
    expect(handler).not.toHaveBeenCalled();
  });

  it('listenerCount reflete o número de ouvintes', () => {
    expect(bus.listenerCount('cart:item-added')).toBe(0);
    const off = bus.on('cart:item-added', vi.fn());
    expect(bus.listenerCount('cart:item-added')).toBe(1);
    off();
    expect(bus.listenerCount('cart:item-added')).toBe(0);
  });

  it('clear remove todos os ouvintes', () => {
    bus.on('cart:item-added', vi.fn());
    bus.on('cart:cleared', vi.fn());
    bus.clear();
    expect(bus.listenerCount('cart:item-added')).toBe(0);
    expect(bus.listenerCount('cart:cleared')).toBe(0);
  });
});
