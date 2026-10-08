import { formatCurrency } from '../lib/format';

export interface PriceProps {
  value: number;
  className?: string;
}

export function Price({ value, className = '' }: PriceProps) {
  return (
    <span className={`font-semibold tabular-nums text-card-foreground ${className}`}>
      {formatCurrency(value)}
    </span>
  );
}
