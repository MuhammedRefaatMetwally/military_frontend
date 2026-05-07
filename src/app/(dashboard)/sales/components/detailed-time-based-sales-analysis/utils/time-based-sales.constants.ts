/**
 * Constants for Detailed Time-Based Sales Analysis component
 */

/**
 * Rollup metrics aggregated from detailed sales data
 */
export type RollupMetrics = {
  net: number;
  netYoyPrior: number | null;
  yoy: number | null;
  mom: number | null;
  invoices: number;
  margin: number;
};

/**
 * Calculate Year-over-Year percentage change
 */
export function calculateYoy(
  net: number,
  netYoyPrior: number | null
): number | null {
  if (netYoyPrior == null || netYoyPrior === 0) return null;
  return ((net - netYoyPrior) / netYoyPrior) * 100;
}

/**
 * Calculate weighted average margin across months
 */
export function calculateWeightedMargin(
  months: Array<{ net: number; margin: number }>
): number {
  const totalNet = months.reduce((sum, m) => sum + m.net, 0);
  if (totalNet === 0) return 0;
  return months.reduce((sum, m) => sum + m.margin * m.net, 0) / totalNet;
}

/**
 * Calculate average of non-null numeric values
 */
export function calculateAverage(values: Array<number | null>): number | null {
  const valid = values.filter((v): v is number => v != null);
  if (!valid.length) return null;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

/**
 * Format percentage with sign and 2 decimals
 */
export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
