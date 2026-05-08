import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useSalesProfitContribution } from "@/hooks/useProductAnalysis";
import { useFilterStore } from "@/store/filterStore";
import { useThemeStore } from "@/store/themeStore";
import { ChartErrorBoundary } from "../chartErrorBoundary";

// ─── Constants ─────────────────────────────────────────────────────────────────

const CHART_OUTER_HEIGHT_PX = 480;
const ROW_HEIGHT_PX         = 36;
const CHART_HEADER_PX       = 140;
const MIN_INNER_HEIGHT_PX   = 280;

// ─── Dynamic import ────────────────────────────────────────────────────────────

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  { ssr: false, loading: () => <SkeletonChart /> },
);

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonChart() {
  const rows = 7;
  return (
    <div
      style={{
        height: CHART_OUTER_HEIGHT_PX,
        borderRadius: 12,
        background: "var(--bg-panel)",
        border: "1px solid var(--border-subtle)",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        overflow: "hidden",
      }}
    >
      {/* Title + subtitle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            width: 200,
            height: 14,
            borderRadius: 6,
            background: "var(--bg-elevated)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            width: 280,
            height: 10,
            borderRadius: 6,
            background: "var(--bg-elevated)",
            opacity: 0.6,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Fake horizontal bar rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {Array.from({ length: rows }).map((_, i) => {
          const labelW  = 80 + (i % 3) * 30;
          const bar1W   = 30 + ((i * 17) % 45);
          const bar2W   = 20 + ((i * 11) % 35);
          const delay   = `${i * 0.07}s`;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Product name */}
              <div
                style={{
                  width: labelW,
                  height: 9,
                  borderRadius: 4,
                  background: "var(--bg-elevated)",
                  flexShrink: 0,
                  animation: `pulse 1.5s ease-in-out ${delay} infinite`,
                }}
              />
              {/* Sales volume bar */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                <div
                  style={{
                    width: `${bar1W}%`,
                    height: 8,
                    borderRadius: 3,
                    background: "rgba(8,145,178,0.25)",
                    animation: `pulse 1.5s ease-in-out ${delay} infinite`,
                  }}
                />
                <div
                  style={{
                    width: `${bar2W}%`,
                    height: 8,
                    borderRadius: 3,
                    background: "rgba(4,120,87,0.25)",
                    animation: `pulse 1.5s ease-in-out ${delay} infinite`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Fake legend */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        {["rgba(8,145,178,0.3)", "rgba(4,120,87,0.3)"].map((bg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 20, height: 8, borderRadius: 3, background: bg }} />
            <div
              style={{
                width: 70,
                height: 8,
                borderRadius: 4,
                background: "var(--bg-elevated)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
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
        height: CHART_OUTER_HEIGHT_PX,
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
        <rect x="2" y="10" width="10" height="8"  rx="2" fill="var(--accent-cyan)"  />
        <rect x="2" y="22" width="7"  height="8"  rx="2" fill="var(--accent-green)" />
        <rect x="15" y="8"  width="10" height="8"  rx="2" fill="var(--accent-cyan)"  />
        <rect x="15" y="20" width="14" height="8"  rx="2" fill="var(--accent-green)" />
        <rect x="28" y="12" width="10" height="8"  rx="2" fill="var(--accent-cyan)"  />
        <rect x="28" y="24" width="5"  height="8"  rx="2" fill="var(--accent-green)" />
      </svg>
      <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
        لا توجد بيانات مساهمة للفلاتر الحالية
      </span>
      <span style={{ fontSize: 10, color: "var(--text-muted)", opacity: 0.7 }}>
        جرّب تغيير الفترة الزمنية أو تحديد فرع مختلف
      </span>
    </div>
  );
}

// ─── Tooltip ───────────────────────────────────────────────────────────────────

type TooltipParam = {
  axisValueLabel?: string;
  marker?: string;
  seriesName?: string;
  value?: number | string;
};

function formatAxisTooltip(params: TooltipParam | TooltipParam[]) {
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

// ─── Main Component ────────────────────────────────────────────────────────────

const SalesVolumeAndProfitsByProduct = () => {
  // ── Theme ───────────────────────────────────────────────────────────────────
  const mode   = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  const spineColor     = isDark ? "#64748b" : "#94a3b8";
  const splitLineColor = isDark ? "rgba(148,163,184,0.22)" : "rgba(100,116,139,0.3)";

  // ── Global filters ──────────────────────────────────────────────────────────
  const year            = useFilterStore((s) => s.year);
  const quarter         = useFilterStore((s) => s.quarter);
  const month           = useFilterStore((s) => s.month);
  const region          = useFilterStore((s) => s.region);
  const activeBranches  = useFilterStore((s) => s.activeBranches);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory     = useFilterStore((s) => s.subcategory);
  const product         = useFilterStore((s) => s.product);

  // ── Query ───────────────────────────────────────────────────────────────────
  const { data, isLoading, error, refetch } = useSalesProfitContribution({
    year:      Number(year) || new Date().getFullYear(),
    quarter:   quarter ? [Number(quarter)] : undefined,
    month:     month   ? [Number(month)]   : undefined,
    regionIds: region.length         ? region          : undefined,
    branchIds: activeBranches.length ? activeBranches  : undefined,
    group1Ids: productCategory.length ? productCategory : undefined,
    group2Ids: subcategory.length     ? subcategory     : undefined,
    group3Ids: product.length         ? product         : undefined,
  });

  // ── Processed data — sorted ascending by profit_pct for horizontal bars ─────
  const sorted = useMemo(() => {
    if (!data?.data?.products) return [];
    return [...data.data.products].sort((a, b) => a.profit_pct - b.profit_pct);
  }, [data]);

  // ── Dynamic inner chart height — grows with row count, never too short ───────
  const innerHeightPx = useMemo(
    () => Math.max(MIN_INNER_HEIGHT_PX, CHART_HEADER_PX + sorted.length * ROW_HEIGHT_PX),
    [sorted.length],
  );

  // ── Chart option ────────────────────────────────────────────────────────────
  const contribOption = useMemo(() => ({
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: TooltipParam | TooltipParam[]) => formatAxisTooltip(params),
    },
    legend: {
      data: ["% حجم المبيعات", "% مساهمة الربح"],
      bottom: 0,
      textStyle: { fontSize: 9 },
      itemGap: 20,
    },
    grid: {
      left: "3%",
      right: "6%",
      top: "2%",
      bottom: "8%",
      containLabel: true,
    },
    xAxis: {
      type: "value" as const,
      axisLabel: { formatter: "{value}%", fontSize: 9 },
      axisTick: { show: false },
      axisLine: { show: true, lineStyle: { width: 2, color: spineColor } },
      splitLine: {
        show: true,
        lineStyle: { type: "dashed" as const, color: splitLineColor, width: 1 },
      },
    },
    yAxis: {
      type: "category" as const,
      data: sorted.map((p) => p.name),
      axisLabel: { fontSize: 10 },
      axisLine: { show: true, lineStyle: { width: 2, color: spineColor } },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        name: "% حجم المبيعات",
        type: "bar" as const,
        stack: "total",
        barWidth: 12,
        barCategoryGap: "40%",
        data: sorted.map((p) => ({
          value: p.sales_volume_pct,
          itemStyle: { color: "#0891b2" },
        })),
        label: {
          show: true,
          position: "inside" as const,
          fontSize: 8,
          fontWeight: "bold",
          color: "#fff",
          formatter: (p: { value: number }) =>
            p.value >= 1 ? `${p.value.toFixed(1)}%` : "",
        },
      },
      {
        name: "% مساهمة الربح",
        type: "bar" as const,
        stack: "total",
        barWidth: 12,
        data: sorted.map((p) => ({
          value: p.profit_pct,
          itemStyle: { color: "#047857", borderRadius: [0, 4, 4, 0] },
        })),
        label: {
          show: true,
          position: "right" as const,
          fontSize: 9,
          fontWeight: "bold",
          color: "#047857",
          formatter: (params: { dataIndex: number }) =>
            `${sorted[params.dataIndex].profit_pct.toFixed(1)}%`,
        },
      },
    ],
  }), [sorted, spineColor, splitLineColor]);

  // ── Early returns for loading / empty ───────────────────────────────────────
  if (isLoading) return <SkeletonChart />;
  if (!isLoading && !error && sorted.length === 0) return <EmptyState />;

  return (
    <ChartErrorBoundary
      title="حجم المبيعات و الأرباح حسب المنتج"
      subtitle="Sales Volume Contribution & Profit Contribution by Product %"
      isLoading={false}
      onRetry={() => refetch()}
      height={`${CHART_OUTER_HEIGHT_PX}px`}
      titleFlag="green"
      delay={1}
    >
      <ChartCard
        title="حجم المبيعات و الأرباح حسب المنتج"
        titleFlag="green"
        subtitle="Sales Volume Contribution & Profit Contribution by Product %"
        option={contribOption}
        plotOverflowY="auto"
        innerChartHeight={`${innerHeightPx}px`}
        height={`${CHART_OUTER_HEIGHT_PX}px`}
        delay={1}
      />
    </ChartErrorBoundary>
  );
};

export default SalesVolumeAndProfitsByProduct;