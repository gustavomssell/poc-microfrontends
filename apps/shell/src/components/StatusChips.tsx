import { getEventBusInstanceIds } from '@microstore/event-bus';
import { getStoreInstanceIds } from '@microstore/cart-store';
import { Badge, cn } from '@microstore/ui';
import { REMOTES, type RemoteStatus } from '@microstore/contracts';
import { useEffect, useState } from 'react';
import { useRemoteStatuses } from '../remotes/remoteStatusStore';

const statusVisual: Record<RemoteStatus, { dot: string; label: string }> = {
  idle: { dot: 'bg-muted-foreground/40', label: 'ocioso' },
  loading: { dot: 'bg-warning-400 animate-pulse', label: 'carregando' },
  ok: { dot: 'bg-success-500', label: 'ok' },
  error: { dot: 'bg-danger-500', label: 'erro' },
};

function Chip({
  title,
  dot,
  children,
  warn = false,
}: {
  title: string;
  dot: string;
  children: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      title={title}
      className={cn(
        'gap-1.5 font-normal text-muted-foreground',
        warn && 'border-warning-400/60 bg-warning-400/15 text-foreground',
      )}
    >
      <span className={cn('size-1.5 rounded-full', dot)} aria-hidden />
      {children}
    </Badge>
  );
}

/**
 * Painel de saúde da arquitetura (só em telas largas).
 *
 * Mostra o status de cada remote + a contagem de instâncias da store e do
 * event-bus: se algum app embalar a própria cópia de um pacote compartilhado,
 * o número vira 2 e o chip fica âmbar — o problema aparece em vez de virar
 * bug misterioso de estado divergente.
 */
export function StatusChips() {
  const statuses = useRemoteStatuses();
  const [instances, setInstances] = useState({ store: 1, bus: 1 });

  useEffect(() => {
    const update = () =>
      setInstances({
        store: getStoreInstanceIds().length,
        bus: getEventBusInstanceIds().length,
      });
    update();
    const timer = setInterval(update, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      data-telemetry
      className="hidden items-center gap-2 xl:flex"
      aria-label="Status dos microfrontends"
    >
      {Object.values(REMOTES).map((remote) => {
        const visual = statusVisual[statuses[remote.name]];
        return (
          <Chip
            key={remote.name}
            title={`${remote.label} — ${remote.description}`}
            dot={visual.dot}
          >
            {remote.name}: {visual.label}
          </Chip>
        );
      })}

      <Chip
        title="Instâncias da store do carrinho no runtime (1 = compartilhada corretamente)"
        dot={instances.store === 1 ? 'bg-success-500' : 'bg-danger-500'}
        warn={instances.store !== 1}
      >
        state: {instances.store}
      </Chip>

      <Chip
        title="Instâncias do event-bus no runtime (1 = compartilhado corretamente)"
        dot={instances.bus === 1 ? 'bg-success-500' : 'bg-danger-500'}
        warn={instances.bus !== 1}
      >
        bus: {instances.bus}
      </Chip>
    </div>
  );
}
