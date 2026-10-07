import { Skeleton } from '@microstore/ui';

export function RemoteSkeleton({
  label = 'Carregando módulo…',
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
    >
      <Skeleton className="h-5 w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
