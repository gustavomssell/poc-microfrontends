import { loadRemote } from '@module-federation/runtime';
import type { RemoteName } from '@microstore/contracts';
import { Alert, AlertDescription, AlertTitle, Skeleton } from '@microstore/ui';
import { TriangleAlertIcon } from 'lucide-react';
import { lazy, Suspense, type ComponentType } from 'react';
import { RemoteErrorBoundary } from '../components/RemoteErrorBoundary';
import { StoreBadge } from '../components/StoreBadge';
import { remoteStatusStore } from './remoteStatusStore';

/**
 * Carrega um WIDGET remoto (componente solto, sem bridge/rota própria).
 *
 * O componente é montado DENTRO da árvore do shell — por isso compartilhamos
 * react (singleton) e react-router-dom (Link/Router do shell valem para ele).
 */
function loadWidget(remote: RemoteName, moduleName: string): ComponentType<Record<string, unknown>> {
  return lazy(async () => {
    remoteStatusStore.set(remote, 'loading');
    try {
      const module = (await loadRemote(`${remote}/${moduleName}`)) as {
        default?: ComponentType<Record<string, unknown>>;
      };
      if (!module.default) {
        throw new Error(`Módulo ${remote}/${moduleName} não expõe export default`);
      }
      remoteStatusStore.set(remote, 'ok');
      return { default: module.default };
    } catch (error) {
      remoteStatusStore.set(remote, 'error');
      throw error;
    }
  });
}

const MiniCart = loadWidget('cart', 'MiniCart');
const ProductGrid = loadWidget('catalog', 'ProductGrid');

function WidgetLoading() {
  return (
    <Skeleton
      role="status"
      aria-label="Carregando widget"
      className="h-8 w-28 rounded-lg"
    />
  );
}

/** Badge do carrinho no header — se cair, o shell degrada para a store compartilhada. */
export function MiniCartWidget() {
  return (
    <RemoteErrorBoundary remote="cart" fallback={<StoreBadge />}>
      <Suspense fallback={<WidgetLoading />}>
        <MiniCart />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function FeaturedFallback() {
  return (
    <Alert variant="destructive" data-mfe-slot="catalog" data-mfe-status="error">
      <TriangleAlertIcon />
      <AlertTitle>Catálogo indisponível.</AlertTitle>
      <AlertDescription>
        <p>
          O widget de destaques não pôde ser carregado — o restante da home
          segue funcionando.
        </p>
        <p className="text-xs">
          Suba o remote com{' '}
          <code className="rounded bg-muted px-1 font-mono">
            npm run dev -w apps/catalog
          </code>
          .
        </p>
      </AlertDescription>
    </Alert>
  );
}

/** Destaques do catálogo montados na home do shell (composição granular). */
export function FeaturedProducts() {
  return (
    <RemoteErrorBoundary remote="catalog" fallback={<FeaturedFallback />}>
      <Suspense fallback={<RemoteGridSkeleton />}>
        <ProductGrid title="Destaques" limit={4} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function RemoteGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando destaques"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-56 rounded-xl" />
      ))}
    </div>
  );
}
