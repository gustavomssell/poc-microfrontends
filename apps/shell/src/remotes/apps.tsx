import { createRemoteAppComponent } from '@module-federation/bridge-react';
import { loadRemote } from '@module-federation/runtime';
import type { RemoteName } from '@microstore/contracts';
import { createRemoteFallback } from './RemoteFallback';
import { RemoteSkeleton } from './RemoteSkeleton';
import { remoteStatusStore } from './remoteStatusStore';

/**
 * Carrega um módulo exposto por um remote e reporta o status para o shell.
 *
 * `REMOTES` (contracts) é a fonte única de nome/porta/rota/entryEnvVar;
 * os `exposes` de cada remote vivem no `vite.config.ts` dele (o registry
 * `REMOTE_EXPOSES` documenta o mapa, mas não é consumido em runtime).
 * Aqui evitamos `any` explícito com o tipo do contrato de `RemoteName`.
 */
async function loadAppModule(remote: RemoteName, moduleName: string) {
  remoteStatusStore.set(remote, 'loading');
  try {
    const module = await loadRemote(`${remote}/${moduleName}`);
    remoteStatusStore.set(remote, 'ok');
    return module;
  } catch (error) {
    remoteStatusStore.set(remote, 'error');
    throw error;
  }
}

/** Aplicações completas (bridge) — cada uma cuida das próprias sub-rotas. */
export const CatalogApp = createRemoteAppComponent({
  loader: () => loadAppModule('catalog', 'App'),
  loading: <RemoteSkeleton label="Carregando Catálogo…" />,
  fallback: createRemoteFallback('catalog'),
});

export const CartApp = createRemoteAppComponent({
  loader: () => loadAppModule('cart', 'App'),
  loading: <RemoteSkeleton label="Carregando Carrinho…" />,
  fallback: createRemoteFallback('cart'),
});

export const CheckoutApp = createRemoteAppComponent({
  loader: () => loadAppModule('checkout', 'App'),
  loading: <RemoteSkeleton label="Carregando Checkout…" />,
  fallback: createRemoteFallback('checkout'),
});
