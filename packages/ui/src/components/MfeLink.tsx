import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { softNavigate, withDeployPrefix } from '../lib/navigation.ts';

interface MfeLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Caminho ABSOLUTO fora do namespace do remote (ex.: "/checkout"). */
  to: string;
  /** Conteúdo do link. */
  children?: ReactNode;
}

/**
 * Link que cruza a fronteira de um remote (remote → shell ou → outro remote).
 *
 * O <Link> do react-router aplicaria o basename do remote
 * (ex.: "/cart/checkout") e não notificaria o router do shell. Este
 * componente usa um <a> puro + pushState com popstate sintético: shell e
 * remotes sincronizam sem recarregar a página — a store em memória
 * (carrinho, toasts) é preservada.
 */
export function MfeLink({ to, children, onClick, ...rest }: MfeLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    if (rest.target && rest.target !== '_self') return;
    event.preventDefault();
    softNavigate(to);
  };

  return (
    <a href={withDeployPrefix(to)} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
