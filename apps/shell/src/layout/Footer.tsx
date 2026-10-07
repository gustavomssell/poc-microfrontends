import { REMOTES } from '@microstore/contracts';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          <strong className="font-semibold text-foreground">MicroStore</strong>{' '}
          — POC de microfrontends com Vite + React + Tailwind + Module
          Federation 2.0
        </p>
        <p className="font-mono text-xs">
          shell:5000 ·{' '}
          {Object.values(REMOTES)
            .map((r) => `${r.name}:${r.port}`)
            .join(' · ')}
        </p>
      </div>
    </footer>
  );
}
