import { federation } from '@module-federation/vite';
import { REMOTES } from '@microstore/contracts';
import { createSharedConfig, SHARED_RESOLVE_ALIAS } from '@microstore/build-config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

const descriptor = REMOTES.cart;

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
        name: 'cart',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/export-app.tsx',
          './MiniCart': './src/widgets/MiniCart.tsx',
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
