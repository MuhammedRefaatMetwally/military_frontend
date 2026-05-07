/**
 * MetricsCells - Renders table cells for metrics (net, yoy, mom, invoices, margin)
 */

import {
  AnalyticsBarCellContent,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import { MetricTrend } from "./MetricTrend";
import { type RollupMetrics, formatNumber } from "../utils/time-based-sales.constants";

interface MetricsCellsProps {
  metrics: RollupMetrics;
  maxNet: number;
  maxInvoices: number;
  barColor: string;
}

export function MetricsCells({
  metrics,
  maxNet,
  maxInvoices,
  barColor,
}: MetricsCellsProps) {
  return (
    <>
      <td style={{ ...analyticsTdBaseStyle("center"), position: "relative" }}>
        <AnalyticsBarCellContent
          value={metrics.net}
          max={maxNet}
          color={barColor}
          text={formatNumber(metrics.net)}
        />
      </td>
      {metrics.netYoyPrior != null ? (
        <td style={{ ...analyticsTdBaseStyle("center"), position: "relative" }}>
          <AnalyticsBarCellContent
            value={metrics.netYoyPrior}
            max={maxNet}
            color={barColor}
            text={formatNumber(metrics.netYoyPrior)}
          />
        </td>
      ) : (
        <td style={analyticsTdBaseStyle("center")}>
          <span style={{ color: "var(--text-muted)", fontSize: 10 }}>—</span>
        </td>
      )}
      <td style={analyticsTdBaseStyle("center")}>
        <MetricTrend value={metrics.yoy} />
      </td>
      <td style={analyticsTdBaseStyle("center")}>
        <MetricTrend value={metrics.mom} />
      </td>
      <td style={{ ...analyticsTdBaseStyle("center"), position: "relative" }}>
        <AnalyticsBarCellContent
          value={metrics.invoices}
          max={maxInvoices}
          color={barColor}
          text={formatNumber(metrics.invoices)}
        />
      </td>
      <td style={analyticsTdBaseStyle("center")}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
          dir="ltr"
        >
          {metrics.margin.toFixed(2)}%
        </span>
      </td>
    </>
  );
}
