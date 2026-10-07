import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from '@microstore/ui';
import { TriangleAlertIcon } from 'lucide-react';
import { REMOTES, type RemoteName } from '@microstore/contracts';
import { useEffect, type ComponentType } from 'react';
import { remoteStatusStore } from './remoteStatusStore';

/**
 * Fallback do bridge: quando o remote falha ao carregar/executar, o shell
 * renderiza este componente NO LUGAR dele — o restante da página continua
 * vivo (é a prova visual do isolamento de falhas).
 */
export function createRemoteFallback(
  remote: RemoteName,
): ComponentType<{ error: Error }> {
  function RemoteFallback({ error }: { error: Error }) {
    const descriptor = REMOTES[remote];

    useEffect(() => {
      remoteStatusStore.set(remote, 'error');
    }, [remote]);

    return (
      <Alert
        variant="destructive"
        data-mfe-slot={remote}
        data-mfe-status="error"
      >
        <TriangleAlertIcon />
        <AlertTitle>{descriptor.label} indisponível</AlertTitle>
        <AlertDescription>
          <p>
            Falha ao carregar o remote{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              {remote}
            </code>{' '}
            — o restante do shell segue funcionando normalmente.
          </p>
          <p className="break-words font-mono text-xs">{error.message}</p>
          <p className="text-xs">
            Dica: verifique se o remote está no ar (porta{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              {descriptor.port}
            </code>{' '}
            — <code className="rounded bg-muted px-1 font-mono text-xs">
              npm run dev -w apps/{remote}
            </code>
            ) e recarregue a página.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={() => window.location.reload()}
          >
            Recarregar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return RemoteFallback;
}
