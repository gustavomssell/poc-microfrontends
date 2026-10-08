import { REMOTES, type RemoteName } from '@microstore/contracts';
import { fileURLToPath } from 'node:url';

export const SHELL_PORT = 5000;

/**
 * Alias `@/` → `packages/ui/src` para o Vite (fonte única: tsconfig.base.json).
 *
 * Necessário porque os componentes shadcn/ui importam entre si e o `cn`
 * pelo alias `@/...`; o Vite não lê `paths` do tsconfig sozinho.
 * Seguro com escopos npm (`@microstore/...`): o alias só casa `@/`.
 */
export const SHARED_RESOLVE_ALIAS: Record<string, string> = {
  '@': fileURLToPath(new URL('../../ui/src', import.meta.url)),
};

export interface SharedModuleConfig {
  singleton: boolean;
  requiredVersion?: string;
  eager?: boolean;
}

/**
 * Fonte única do bloco `shared` do Module Federation.
 *
 * Todos os apps importam esta função — assim as versões e flags nunca
 * divergem entre shell e remotes (a causa nº 1 de React duplicado).
 *
 * O que é compartilhado (e por quê):
 * - react / react-dom      → singleton obrigatório (estado de hooks quebraria)
 * - react-dom/             → prefixo com barra cobre submódulos (react-dom/client)
 * - react/jsx-runtime      → consumido pelos deps pré-bundlados (base-ui), nunca
 *   por source file; eager: true força o materialize no init do container
 *   senão o prefill acontece depois do primeiro render no modo standalone
 *   e o virtual module exporta jsx undefined ("jsx is not a function")
 * - react-router-dom        → widgets usam <Link> no contexto do shell
 * - @microstore/cart-store  → UMA instância da store em todos os MFEs
 * - @microstore/event-bus   → emissores e ouvintes no mesmo barramento
 *
 * O que NÃO é compartilhado (e por quê):
 * - @microstore/contracts   → valores puros e imutáveis (REMOTES,
 *   REMOTE_EXPOSES) além dos tipos; duplicar é inofensivo — sem estado
 *   nem identidade, não há o que unificar no runtime
 * - @microstore/ui          → duplicar é inofensivo (CSS é compilado por app)
 */
export function createSharedConfig(): Record<string, SharedModuleConfig> {
  return {
    react: { singleton: true, requiredVersion: '^19.3.0' },
    'react/jsx-runtime': {
      singleton: true,
      requiredVersion: '^19.3.0',
      eager: true,
    },
    'react-dom': { singleton: true, requiredVersion: '^19.3.0' },
    'react-dom/': { singleton: true, requiredVersion: '^19.3.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^7.18.0' },
    '@microstore/cart-store': { singleton: true, requiredVersion: '^1.0.0' },
    '@microstore/event-bus': { singleton: true, requiredVersion: '^1.0.0' },
  };
}

/**
 * URL do remoteEntry de um remote.
 *
 * Prioridade: variável de ambiente (produção/CDN) → default local (dev).
 * É o que permite ao shell apontar para builds diferentes sem recompilar.
 */
export function remoteEntryUrl(
  name: RemoteName,
  env: Record<string, string | undefined>,
): string {
  const descriptor = REMOTES[name];
  return env[descriptor.entryEnvVar] ?? `http://localhost:${descriptor.port}/remoteEntry.js`;
}
