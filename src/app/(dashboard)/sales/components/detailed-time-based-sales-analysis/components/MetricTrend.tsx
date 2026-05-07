/**
 * MetricTrend - Displays a percentage metric with trend indicator
 */

import { TrendingDown, TrendingUp } from "lucide-react";
import { formatPercent } from "../utils/time-based-sales.constants";

interface MetricTrendProps {
  value: number | null;
}

export function MetricTrend({ value }: MetricTrendProps) {
  if (value == null)
    return <span style={{ color: "var(--text-muted)", fontSize: 10 }}>—</span>;

  const isPositive = value >= 0;

  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-semibold"
      style={{
        color: isPositive ? "var(--accent-green)" : "var(--accent-red)",
      }}
      dir="ltr"
    >
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {formatPercent(value)}
    </span>
  );
}
