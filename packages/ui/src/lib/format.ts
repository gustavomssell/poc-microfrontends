const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value: number): string {
  return brl.format(value);
}

/** Placeholder visual determinístico — a POC não depende de imagens externas. */
export function productGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 75% 62%), hsl(${(hue + 45) % 360} 75% 45%))`;
}
