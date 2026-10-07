import { REMOTES, type RemoteName } from '@microstore/contracts';
import { buttonVariants, Card, CardContent, CardHeader, CardTitle } from '@microstore/ui';
import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRemoteStatuses } from '../remotes/remoteStatusStore';
import { FeaturedProducts } from '../remotes/widgets';

const statusDot: Record<string, string> = {
  idle: 'bg-muted-foreground/40',
  loading: 'bg-warning-400 animate-pulse',
  ok: 'bg-success-500',
  error: 'bg-danger-500',
};

function CompositionCard({ remote }: { remote: RemoteName | 'shell' }) {
  const statuses = useRemoteStatuses();

  if (remote === 'shell') {
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
            shell
            <span className="ml-auto font-mono text-xs font-normal text-muted-foreground">
              :5000
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Host: layout, navegação, roteamento, slots e fallbacks. Não expõe
            nada.
          </p>
          <p className="text-xs font-medium text-primary">
            App local (não é remote)
          </p>
        </CardContent>
      </Card>
    );
  }

  const descriptor = REMOTES[remote];
  const status = statuses[remote];

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            className={`size-2 shrink-0 rounded-full ${statusDot[status]}`}
            aria-hidden
          />
          {descriptor.name}
          <span className="ml-auto font-mono text-xs font-normal text-muted-foreground">
            :{descriptor.port}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {descriptor.description}
        </p>
        <p className="text-xs text-muted-foreground">
          Deploy independente · entry via{' '}
          <code className="rounded bg-muted px-1 font-mono text-foreground">
            {descriptor.entryEnvVar}
          </code>
        </p>
      </CardContent>
    </Card>
  );
}

export function HomePage() {
  return (
    <div
      data-mfe-content="shell-home"
      className="flex flex-col gap-12"
    >
      <section className="overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10">
        <h1 className="max-w-2xl text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          Um shell, três microfrontends, times e deploys independentes —
          montados em runtime.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
          O header (MiniCart) e os destaques abaixo são widgets carregados do
          remote <strong>catalog</strong> e do remote <strong>cart</strong>.
          Navegue pelas páginas: cada rota é um remote servido de outra porta,
          com estado compartilhado, contratos tipados e falhas isoladas.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/catalog" className={buttonVariants()}>
            Explorar catálogo
          </Link>
          <Link to="/checkout" className={buttonVariants({ variant: 'secondary' })}>
            Ir para o checkout
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Destaques</h2>
            <p className="text-sm text-muted-foreground">
              Widget{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                catalog/ProductGrid
              </code>{' '}
              — composto na home do shell
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            ver todos
            <ArrowRightIcon aria-hidden />
          </Link>
        </div>
        <FeaturedProducts />
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight">
          Quem compõe esta página
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Cada card abaixo é um processo/build separado — o shell apenas os
          monta.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CompositionCard remote="shell" />
          <CompositionCard remote="catalog" />
          <CompositionCard remote="cart" />
          <CompositionCard remote="checkout" />
        </div>
      </section>
    </div>
  );
}
