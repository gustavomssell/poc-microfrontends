import { ThemeProvider } from 'next-themes';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { TooltipProvider } from '@microstore/ui';
import { ToastContainer } from './components/Toast';
import { Layout } from './layout/Layout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CatalogApp, CartApp, CheckoutApp } from './remotes/apps';

/**
 * Sincroniza os routers dos remotes com navegações feitas pelo shell.
 *
 * Cada remote tem seu próprio <BrowserRouter> numa árvore React isolada e
 * só escuta `popstate` — um pushState do shell passaria despercebido.
 * A cada mudança de rota no shell, disparamos um popstate sintético para
 * que os remotes montados acompanhem a URL (o próprio bridge-react usa
 * esse mecanismo internamente).
 */
function RouterSync() {
  const location = useLocation();
  useEffect(() => {
    // Adiado para depois do commit: o remote que está saindo precisa ser
    // desmontado antes, senão o <Router> dele avisa que o basename não bate.
    const t = setTimeout(() => {
      window.dispatchEvent(
        new PopStateEvent('popstate', { state: window.history.state }),
      );
    }, 0);
    return () => clearTimeout(t);
  }, [location.pathname, location.search, location.hash]);
  return null;
}

/**
 * Prefixo do deploy (GitHub Pages etc.) — `VITE_ROUTER_PREFIX` com o mesmo
 * valor em todos os apps; vazio em dev, quando as rotas vivem na raiz.
 */
const DEPLOY_PREFIX = (import.meta.env.VITE_ROUTER_PREFIX ?? '').replace(
  /\/+$/,
  '',
);

/**
 * O shell é o DONO das rotas. Os remotes são montados em /catalog, /cart e
 * /checkout; cada remote cuida das sub-rotas internas (o basename é injetado
 * pelo bridge).
 *
 * Providers globais: tema (dark mode via classe `.dark` no <html>,
 * compartilhada com os remotes pelo DOM), tooltips e toasts (sonner).
 */
export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="microstore-theme"
    >
      <TooltipProvider delay={300}>
        <BrowserRouter basename={DEPLOY_PREFIX || undefined}>
          <RouterSync />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/catalog/*"
                element={<CatalogApp basename={`${DEPLOY_PREFIX}/catalog`} />}
              />
              <Route
                path="/cart/*"
                element={<CartApp basename={`${DEPLOY_PREFIX}/cart`} />}
              />
              <Route
                path="/checkout/*"
                element={
                  <CheckoutApp basename={`${DEPLOY_PREFIX}/checkout`} />
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}
