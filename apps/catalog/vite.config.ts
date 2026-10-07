import { federation } from '@module-federation/vite';
import { REMOTES } from '@microstore/contracts';
import { createSharedConfig, SHARED_RESOLVE_ALIAS } from '@microstore/build-config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

const descriptor = REMOTES.catalog;

/**
 * Remote "catalog": roda sozinho (:5001) e também é montado pelo shell.
 *
 * `base` aponta para a origem deste remote — chunks dinâmicos e o
 * remoteEntry precisam ser resolvidos contra o servidor DELE, não do shell.
 * VITE_BASE_URL sobrepõe em produção (CDN).
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_URL ?? `http://localhost:${descriptor.port}/`;

  return {
    base,
    resolve: { alias: SHARED_RESOLVE_ALIAS },
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'catalog',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/export-app.tsx',
          './ProductGrid': './src/widgets/ProductGrid.tsx',
        },
        shared: createSharedConfig(),
        dts: false,
        manifest: true,
      }),
    ],
    server: {
      port: descriptor.port,
      strictPort: true,
      origin: `http://localhost:${descriptor.port}`,
    },
    preview: { port: descriptor.port, strictPort: true },
    build: { target: 'esnext' },
  };
});
