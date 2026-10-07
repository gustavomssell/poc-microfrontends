import {
  buttonVariants,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@microstore/ui';
import { CompassIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Empty className="min-h-[45vh]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CompassIcon />
        </EmptyMedia>
        <h1 className="text-base font-semibold tracking-tight">
          Rota não encontrada
        </h1>
        <EmptyDescription>
          Esta URL não pertence ao shell nem a nenhum remote montado.
        </EmptyDescription>
      </EmptyHeader>
      <Link to="/" className={buttonVariants({ variant: 'outline' })}>
        Voltar para a home
      </Link>
    </Empty>
  );
}
