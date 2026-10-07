import { eventBus } from '@microstore/event-bus';
import type { RemoteName, RemoteStatus } from '@microstore/contracts';
import { useSyncExternalStore } from 'react';

export type RemoteStatuses = Record<RemoteName, RemoteStatus>;

let state: RemoteStatuses = { catalog: 'idle', cart: 'idle', checkout: 'idle' };
const listeners = new Set<() => void>();

/**
 * Registro de status por remote (loading/ok/error) dentro do shell.
 *
 * é um pub/sub minúsculo com useSyncExternalStore — cada slot reporta seu
 * estado e o header exibe os chips. As transições também entram no event-bus
 * para que o toast (corte transversal) reaja sem o shell importar código do remote.
 */
export const remoteStatusStore = {
  set(name: RemoteName, status: RemoteStatus): void {
    if (state[name] === status) return;
    state = { ...state, [name]: status };
    eventBus.emit('remote:status', { remote: name, status });
    listeners.forEach((listener) => listener());
  },
  getSnapshot(): RemoteStatuses {
    return state;
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useRemoteStatuses(): RemoteStatuses {
  return useSyncExternalStore(
    remoteStatusStore.subscribe,
    remoteStatusStore.getSnapshot,
  );
}
