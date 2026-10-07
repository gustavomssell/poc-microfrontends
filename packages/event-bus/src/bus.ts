import type { MfeEventMap, MfeEventName } from '@microstore/contracts';

type Handler<E extends MfeEventName> = (payload: MfeEventMap[E]) => void;

/**
 * Barramento tipado mínimo.
 *
 * Compartilhado como singleton via Module Federation: emissores (catálogo)
 * e ouvintes (shell) precisam falar com a MESMA instância — se cada app
 * embalar sua própria cópia, os eventos não chegam a lugar nenhum.
 */
export class TypedEventBus {
  private readonly handlers = new Map<MfeEventName, Set<Handler<MfeEventName>>>();

  /** Assina um evento. Retorna a função de unsubscribe. */
  on<E extends MfeEventName>(event: E, handler: Handler<E>): () => void {
    const set = this.handlers.get(event) ?? new Set<Handler<MfeEventName>>();
    set.add(handler as Handler<MfeEventName>);
    this.handlers.set(event, set);
    return () => this.off(event, handler);
  }

  off<E extends MfeEventName>(event: E, handler: Handler<E>): void {
    this.handlers.get(event)?.delete(handler as Handler<MfeEventName>);
  }

  emit<E extends MfeEventName>(event: E, payload: MfeEventMap[E]): void {
    this.handlers.get(event)?.forEach((handler) => {
      (handler as Handler<E>)(payload);
    });
  }

  listenerCount(event: MfeEventName): number {
    return this.handlers.get(event)?.size ?? 0;
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const eventBus = new TypedEventBus();
