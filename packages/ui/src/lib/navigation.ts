/**
 * Navegação SPA que atravessa fronteiras de microfrontends.
 *
 * Cada remote monta o próprio <BrowserRouter> (árvore React isolada pelo
 * bridge), então um `pushState` comum NÃO é visto pelos outros routers —
 * eles só reagem a `popstate`. Depois de mudar a URL, emitimos um
 * `popstate` sintético para sincronizar shell e remotes — o mesmo
 * mecanismo usado internamente pelo próprio bridge-react.
 */

/**
 * Prefixo do deploy (ex.: GitHub Pages em `/poc-microfrontends`).
 *
 * `VITE_ROUTER_PREFIX` é definido igual em TODOS os apps na hora do build
 * de produção; em dev fica vazio e o comportamento é idêntico ao anterior
 * (rotas a partir da raiz do host).
 */
const DEPLOY_PREFIX = (import.meta.env.VITE_ROUTER_PREFIX ?? '').replace(
  /\/+$/,
  '',
);

/**
 * Caminho lógico (contrato dos MfeLinks: `/checkout`) → caminho real do
 * browser, com o prefixo do deploy quando houver.
 */
export function withDeployPrefix(to: string): string {
  if (!DEPLOY_PREFIX || !to.startsWith('/')) return to;
  return to === '/' ? `${DEPLOY_PREFIX}/` : `${DEPLOY_PREFIX}${to}`;
}

export function softNavigate(to: string): void {
  const target = withDeployPrefix(to);
  const current = `${window.location.pathname}${window.location.search}`;
  if (current === target) return;
  window.history.pushState(window.history.state, '', target);
  window.dispatchEvent(
    new PopStateEvent('popstate', { state: window.history.state }),
  );
}
