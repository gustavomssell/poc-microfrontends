/**
 * Navegação SPA que atravessa fronteiras de microfrontends.
 *
 * Cada remote monta o próprio <BrowserRouter> (árvore React isolada pelo
 * bridge), então um `pushState` comum NÃO é visto pelos outros routers —
 * eles só reagem a `popstate`. Depois de mudar a URL, emitimos um
 * `popstate` sintético para sincronizar shell e remotes — o mesmo
 * mecanismo usado internamente pelo próprio bridge-react.
 */
export function softNavigate(to: string): void {
  const current = `${window.location.pathname}${window.location.search}`;
  if (current === to) return;
  window.history.pushState(window.history.state, '', to);
  window.dispatchEvent(
    new PopStateEvent('popstate', { state: window.history.state }),
  );
}
