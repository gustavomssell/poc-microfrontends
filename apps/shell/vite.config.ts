import { federation } from '@module-federation/vite';
import {
  createSharedConfig,
  remoteEntryUrl,
  SHARED_RESOLVE_ALIAS,
  SHELL_PORT,
} from '@microstore/build-config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

/**
 * Shell (host): não expõe nada, apenas consome os remotes.
 *
 * As URLs de entrada vêm do ambiente (VITE_*_ENTRY) — é o que permite
 * apontar o shell para builds de staging/produção sem recompilar.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_BASE_URL || '/',
    resolve: { alias: SHARED_RESOLVE_ALIAS },
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'shell',
        remotes: {
          catalog: {
            type: 'module',
            name: 'catalog',
            entry: remoteEntryUrl('catalog', env),
            entryGlobalName: 'catalog',
            shareScope: 'default',
          },
          cart: {
            type: 'module',
            name: 'cart',
            entry: remoteEntryUrl('cart', env),
            entryGlobalName: 'cart',
            shareScope: 'default',
          },
          checkout: {
            type: 'module',
            name: 'checkout',
            entry: remoteEntryUrl('checkout', env),
            entryGlobalName: 'checkout',
            shareScope: 'default',
          },
        },
        shared: createSharedConfig(),
        dts: false,
      }),
    ],
    server: { port: SHELL_PORT, strictPort: true },
    preview: { port: SHELL_PORT, strictPort: true },
    build: { target: 'esnext' },
  };
});
