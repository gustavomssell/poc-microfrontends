export type RemoteName = 'catalog' | 'cart' | 'checkout';

/**
 * idle    → remote ainda não foi solicitado
 * loading → remoteEntry em carregamento
 * ok      → módulo carregado com sucesso
 * error   → falha ao carregar/executar (o shell continua vivo)
 */
export type RemoteStatus = 'idle' | 'loading' | 'ok' | 'error';

export interface RemoteDescriptor {
  name: RemoteName;
  label: string;
  route: string | null;
  port: number;
  entryEnvVar: string;
  description: string;
}

/** Fonte única sobre quem é quem no runtime (usado pelo shell e pela documentação). */
export const REMOTES: Record<RemoteName, RemoteDescriptor> = {
  catalog: {
    name: 'catalog',
    label: 'Catálogo',
    route: '/catalog',
    port: 5001,
    entryEnvVar: 'VITE_CATALOG_ENTRY',
    description: 'Listagem, detalhe de produtos e widgets de destaque.',
  },
  cart: {
    name: 'cart',
    label: 'Carrinho',
    route: '/cart',
    port: 5002,
    entryEnvVar: 'VITE_CART_ENTRY',
    description: 'Página do carrinho e badge do header (MiniCart).',
  },
  checkout: {
    name: 'checkout',
    label: 'Checkout',
    route: '/checkout',
    port: 5003,
    entryEnvVar: 'VITE_CHECKOUT_ENTRY',
    description: 'Resumo do pedido, formulário e confirmação.',
  },
};

/** Módulos expostos por cada remote: `app` = aplicação completa (bridge), `widget` = componente solto. */
export const REMOTE_EXPOSES: Record<RemoteName, Record<string, 'app' | 'widget'>> = {
  catalog: {
    './App': 'app',
    './ProductGrid': 'widget',
  },
  cart: {
    './App': 'app',
    './MiniCart': 'widget',
  },
  checkout: {
    './App': 'app',
  },
};
