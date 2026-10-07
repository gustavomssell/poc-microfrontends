import type { RemoteName } from '@microstore/contracts';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { remoteStatusStore } from '../remotes/remoteStatusStore';

interface RemoteErrorBoundaryProps {
  remote: RemoteName;
  fallback: ReactNode;
  children: ReactNode;
}

interface RemoteErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary dedicado a widgets remotos.
 *
 * Diferente do fallback do bridge (aplicações), widgets são componentes
 * normais dentro da árvore do shell — quem garante que um widget quebrado
 * não derruba o header é este boundary.
 */
export class RemoteErrorBoundary extends Component<
  RemoteErrorBoundaryProps,
  RemoteErrorBoundaryState
> {
  state: RemoteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RemoteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(
      `[shell] widget do remote "${this.props.remote}" falhou:`,
      error,
      info.componentStack,
    );
    remoteStatusStore.set(this.props.remote, 'error');
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
