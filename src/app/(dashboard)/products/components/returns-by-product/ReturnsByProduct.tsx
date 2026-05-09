import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useReturnsByProduct } from "@/hooks/useProductAnalysis";
import { useFilterStore } from "@/store/filterStore";
import { useThemeStore } from "@/store/themeStore";
import { ChartErrorBoundary } from "../chartErrorBoundary";
import { productsStandardGrid } from "../../utils/data";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  { ssr: false, loading: () => <SkeletonChart /> },
);

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonChart() {
  return (
    <div
      style={{
        height: 480,
        borderRadius: 12,
        background: "var(--bg-panel)",
        border: "1px solid var(--border-subtle)",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* fake title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ width: 160, height: 14, borderRadius: 6, background: "var(--bg-elevated)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ width: 220, height: 10, borderRadius: 6, background: "var(--bg-elevated)", animation: "pulse 1.5s ease-in-out infinite", opacity: 0.6 }} />
      </div>

      {/* fake bars */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 10, padding: "0 8px 24px" }}>
        {[65, 45, 80, 35, 55, 70, 40, 60].map((h, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
            <div
              style={{
                width: "100%",
                height: `${h}%`,
                borderRadius: "4px 4px 0 0",
                background: "var(--bg-elevated)",
                animation: `pulse 1.5s ease-in-out ${i * 0.08}s infinite`,
              }}
            />
            <div style={{ width: "60%", height: 8, borderRadius: 4, background: "var(--bg-elevated)", opacity: 0.5, animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      style={{
        height: 480,
        borderRadius: 12,
        background: "var(--bg-panel)",
        border: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ opacity: 0.3 }}>
        <rect x="4" y="28" width="6" height="8" rx="2" fill="var(--accent-red)" />
        <rect x="13" y="20" width="6" height="16" rx="2" fill="var(--accent-red)" />
        <rect x="22" y="24" width="6" height="12" rx="2" fill="var(--accent-red)" />
        <rect x="31" y="16" width="6" height="20" rx="2" fill="var(--accent-red)" />
        <path d="M6 10 L18 4 L26 8 L36 2" stroke="var(--accent-red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
      </svg>
      <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
        لا توجد بيانات مرتجعات للفلاتر الحالية
      </span>
      <span style={{ fontSize: 10, color: "var(--text-muted)", opacity: 0.7 }}>
        جرّب تغيير الفترة الزمنية أو الفروع
      </span>
    </div>
  );
}

// ─── Tooltip formatter ─────────────────────────────────────────────────────────

type TooltipParam = {
  axisValueLabel?: string;
  marker?: string;
  seriesName?: string;
  value?: number | string;
};

function formatTooltip(params: TooltipParam | TooltipParam[]) {
  const items = Array.isArray(params) ? params : [params];
  const title = items[0]?.axisValueLabel ?? "";
  const rows = items
    .map(
      (item) => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;">
        <div style="display:flex;align-items:center;gap:6px;">
          ${item.marker ?? ""}
          <span style="font-size:11px;">${item.seriesName ?? ""}</span>
        </div>
        <strong style="font-size:11px;">${Number(item.value ?? 0).toLocaleString("en-US")}</strong>
      </div>`,
    )
    .join("");
  return `
    <div style="display:flex;flex-direction:column;gap:6px;min-width:180px;padding:2px 0;">
      <div style="font-weight:700;font-size:11px;border-bottom:1px solid rgba(148,163,184,0.2);padding-bottom:4px;margin-bottom:2px;">
        ${title}
      </div>
      ${rows}
    </div>`;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Truncate long product names intelligently — keep first 3 meaningful words */
function truncateName(name: string, maxLen = 18): string {
  if (name.length <= maxLen) return name;
  const words = name.split(" ");
  let result = "";
  for (const w of words) {
    if ((result + w).length > maxLen) break;
    result += (result ? " " : "") + w;
  }
  return result + "…";
}

// ─── Main Component ────────────────────────────────────────────────────────────

const ReturnsByProduct = () => {
  // ── Global filters ──────────────────────────────────────────────────────────
  const year            = useFilterStore((s) => s.year);
  const quarter         = useFilterStore((s) => s.quarter);
  const month           = useFilterStore((s) => s.month);
  const region          = useFilterStore((s) => s.region);
  const activeBranches  = useFilterStore((s) => s.activeBranches);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory     = useFilterStore((s) => s.subcategory);
  const product         = useFilterStore((s) => s.product);

  // ── NEW: date range filters (case 9 — from_date / to_date) ─────────────────
  const dateRangeFrom      = useFilterStore((s) => s.dateRangeFrom);
  const dateRangeTo        = useFilterStore((s) => s.dateRangeTo);
  const isDateRangeApplied = useFilterStore((s) => s.isDateRangeApplied);

  // ── Theme ───────────────────────────────────────────────────────────────────
  const mode   = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  const spineColor     = isDark ? "#64748b" : "#94a3b8";
  const splitLineColor = isDark ? "rgba(148,163,184,0.22)" : "rgba(100,116,139,0.3)";

  // ── Date-range guard ────────────────────────────────────────────────────────
  // When the user applies a custom date range (case 9), send fromDate/toDate
  // and suppress year/quarter/month to avoid conflicting params on the backend.
  // For standard period selections (cases 3 & 10), use year/quarter/month as before.
  const usingDateRange = isDateRangeApplied && !!dateRangeFrom && !!dateRangeTo;

  // ── Query ───────────────────────────────────────────────────────────────────
  const { data, isLoading, error, refetch } = useReturnsByProduct({
    // Temporal — mutually exclusive with date range
    year:     !usingDateRange && year    ? Number(year)      : undefined,
    quarter:  !usingDateRange && quarter ? [Number(quarter)] : undefined,
    month:    !usingDateRange && month   ? [Number(month)]   : undefined,
    // Date range — case 9 (from_date / to_date)
    fromDate: usingDateRange ? dateRangeFrom : undefined,
    toDate:   usingDateRange ? dateRangeTo   : undefined,
    // Dimensions — cases 3 (branch) & 10 (region + group1 + year)
    regionIds: region.length          ? region          : undefined,
    branchIds: activeBranches.length  ? activeBranches  : undefined,
    group1Ids: productCategory.length ? productCategory : undefined,
    group2Ids: subcategory.length     ? subcategory     : undefined,
    group3Ids: product.length         ? product         : undefined,
  });

  // ── Processed data — top 10 by return_qty, descending ──────────────────────
  const returnsData = useMemo(() => {
    if (!data?.data?.length) return [];
    return [...data.data]
      .sort((a, b) => b.return_qty - a.return_qty)
      .slice(0, 10)
      .map((p) => ({
        fullName:    p.name,
        shortName:   truncateName(p.name),
        return_qty:  p.return_qty,
        return_rate: p.return_rate,
        sold_qty:    p.sold_qty,
      }));
  }, [data]);

  // ── Chart option ────────────────────────────────────────────────────────────
  const returnsOption = useMemo(() => {
    const names = returnsData.map((p) => p.shortName);

    // Colour scale: deeper red = higher return rate
    const getBarColor = (rate: number) => {
      if (rate >= 15) return "#991b1b"; // critical
      if (rate >= 8)  return "#dc2626"; // high
      if (rate >= 4)  return "#f97316"; // medium
      return "#fb923c";                 // low
    };

    return {
      tooltip: {
        trigger: "axis" as const,
        formatter: (params: TooltipParam | TooltipParam[]) => formatTooltip(params),
      },
      legend: {
        data: ["كمية المرتجعات", "نسبة الإرجاع %"],
        bottom: 0,
        textStyle: { fontSize: 10 },
        itemGap: 20,
      },
      grid: {
        ...productsStandardGrid,
        bottom: "12%",
        right: "8%",
      },
      xAxis: {
        type: "category" as const,
        data: names,
        axisLabel: {
          rotate: 28,
          fontSize: 9,
          interval: 0,
          color: isDark ? "#94a3b8" : "#64748b",
        },
        splitLine: { show: false },
        axisLine: { show: true, lineStyle: { width: 2, color: spineColor } },
        axisTick: { show: true, length: 4, lineStyle: { color: spineColor } },
      },
      yAxis: [
        // Left Y — return quantity
        {
          type: "value" as const,
          name: "الكمية",
          nameTextStyle: { fontSize: 9 },
          nameLocation: "middle" as const,
          nameGap: 40,
          axisLabel: { fontSize: 9 },
          axisTick: { show: false },
          axisLine: { show: true, lineStyle: { width: 2, color: spineColor } },
          splitLine: {
            show: true,
            lineStyle: { type: "dashed" as const, color: splitLineColor, width: 1 },
          },
        },
        // Right Y — return rate %
        {
          type: "value" as const,
          name: "النسبة %",
          nameTextStyle: { fontSize: 9 },
          nameLocation: "middle" as const,
          nameGap: 32,
          min: 0,
          axisLabel: { fontSize: 9, formatter: "{value}%" },
          axisTick: { show: false },
          axisLine: { show: true, lineStyle: { width: 2, color: "#f97316" } },
          splitLine: { show: false },
        },
      ],
      series: [
        // ── Bar: return quantity ───────────────────────────────────────────
        {
          name: "كمية المرتجعات",
          type: "bar" as const,
          yAxisIndex: 0,
          barWidth: 22,
          data: returnsData.map((p) => ({
            value: p.return_qty,
            itemStyle: {
              color: getBarColor(p.return_rate),
              borderRadius: [4, 4, 0, 0],
            },
            label: {
              show: p.return_qty > 0,
              position: "top" as const,
              fontSize: 8,
              fontWeight: "bold",
              color: getBarColor(p.return_rate),
              formatter: () =>
                p.return_qty >= 1000
                  ? `${(p.return_qty / 1000).toFixed(1)}K`
                  : String(p.return_qty),
            },
          })),
          emphasis: {
            itemStyle: { shadowBlur: 8, shadowColor: "rgba(220,38,38,0.4)" },
          },
        },
        // ── Line: return rate % ───────────────────────────────────────────
        {
          name: "نسبة الإرجاع %",
          type: "line" as const,
          yAxisIndex: 1,
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2, color: "#f97316" },
          itemStyle: { color: "#f97316", borderColor: "#fff", borderWidth: 1.5 },
          data: returnsData.map((p) => p.return_rate),
          label: {
            show: true,
            position: "top" as const,
            fontSize: 8,
            fontWeight: "bold",
            color: "#f97316",
            formatter: (p: { value: number }) => `${p.value.toFixed(1)}%`,
          },
        },
      ],
    };
  }, [returnsData, isDark, spineColor, splitLineColor]);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) return <SkeletonChart />;

  if (!isLoading && !error && returnsData.length === 0) return <EmptyState />;

  return (
    <ChartErrorBoundary
      title="المرتجعات حسب المنتج"
      subtitle="كمية المرتجعات ونسبة الإرجاع لأعلى 10 منتجات"
      isLoading={false}
      error={error}
      onRetry={() => refetch()}
      height="480px"
      titleFlag="green"
      delay={2}
    >
      <ChartCard
        title="المرتجعات حسب المنتج"
        titleFlag="green"
        subtitle="كمية المرتجعات ونسبة الإرجاع لأعلى 10 منتجات"
        option={returnsOption}
        height="480px"
        delay={2}
      />
    </ChartErrorBoundary>
  );
};

export default ReturnsByProduct;