export function formatNumber(n: number): string {
  return n.toLocaleString("nb-NO");
}

export function formatCurrency(n: number): string {
  return `${formatNumber(n)} kr`;
}

export function formatSqm(n: number): string {
  return `${formatNumber(n)} m²`;
}
