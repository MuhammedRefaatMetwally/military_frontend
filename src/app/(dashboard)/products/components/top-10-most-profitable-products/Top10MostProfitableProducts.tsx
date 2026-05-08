import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
import { productsStandardGrid } from "../../utils/data";
import { useThemeStore } from "@/store/themeStore";
import { useMemo } from "react";
import { useTop10Products } from "@/hooks/useProductAnalysis";
import { useFilterStore } from "@/store/filterStore";
import { ChartErrorBoundary } from "../chartErrorBoundary";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  { ssr: false, loading: () => <div style={{ height: 320 }}>Loading chart...</div> },
);

const months = Array.from({ length: 12 }, (_, i) => `${i + 1}`);

type AxisTooltipParam = {
  axisValueLabel?: string; marker?: string; seriesName?: string; value?: number | string;
};

function formatAxisTooltip(params: AxisTooltipParam | AxisTooltipParam[]) {
  const items = Array.isArray(params) ? params : [params];
  const title = items[0]?.axisValueLabel ?? "";
  const rows  = items.map((item) => `
    <div style="display:flex; align-items:center; justify-content:space-between; gap:14px;">
      <div style="display:flex; align-items:center;">
        <span style="display:inline-flex; margin-inline-end:8px;">${item.marker ?? ""}</span>
        <span>${item.seriesName ?? ""}</span>
      </div>
      <strong>${Number(item.value ?? 0).toLocaleString("en-US")}</strong>
    </div>`).join("");
  return `
    <div style="display:flex; flex-direction:column; gap:8px; min-width:160px;">
      <div style="font-weight:700;">${title}</div>${rows}
    </div>`;
}

const Top10MostProfitableProducts = () => {
  const palette = useResolvedAnalyticsPalette();
  const mode    = useThemeStore((s) => s.mode);

  const year            = useFilterStore((s) => s.year);
  const region          = useFilterStore((s) => s.region);
  const activeBranches  = useFilterStore((s) => s.activeBranches);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory     = useFilterStore((s) => s.subcategory);

  const { data, isLoading, error, refetch } = useTop10Products({
    year:      Number(year) || new Date().getFullYear(),
    regionIds: region.length        ? region          : undefined,
    branchIds: activeBranches.length ? activeBranches : undefined,
    // API takes a single id — pass first selection if any
    group1Id:  productCategory[0] ?? undefined,
    group2Id:  subcategory[0]     ?? undefined,
  });

  const isDark = mode === "dark";
  const barChartSplitLineColor = isDark ? "rgba(148,163,184,0.22)" : "rgba(100,116,139,0.3)";
  const barChartSpineColor     = isDark ? "#64748b" : "#94a3b8";
  const greenTones             = palette.greenScale;

  const series = useMemo(() => {
    if (!data?.products) return [];
    return data.products.map((p, i) => ({
      name: p.name,
      type: "line" as const,
      data: Object.values(p.monthly || {}).map((v) => v || 0),
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: greenTones[i % greenTones.length] },
      itemStyle: { color: greenTones[i % greenTones.length] },
    }));
  }, [data, greenTones]);

  const top10Option = {
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: AxisTooltipParam | AxisTooltipParam[]) => formatAxisTooltip(params),
    },
    legend: {
      type: "scroll" as const, bottom: 0,
      textStyle: { fontSize: 10, lineHeight: 14 },
      pageIconColor: palette.primaryGreen, pageIconSize: 10, itemGap: 20,
    },
    grid: { ...productsStandardGrid },
    xAxis: {
      type: "category" as const, data: months, boundaryGap: false,
      axisLabel: { fontSize: 9, lineHeight: 12 }, splitLine: { show: false },
      axisLine: { show: true, lineStyle: { width: 2, color: barChartSpineColor } },
      axisTick: { show: true, length: 5, lineStyle: { width: 1, color: barChartSpineColor } },
    },
    yAxis: {
      type: "value" as const, axisLabel: { fontSize: 9 }, axisTick: { show: false },
      axisLine: { show: true, lineStyle: { width: 2, color: barChartSpineColor } },
      splitLine: { show: true, lineStyle: { type: "dashed" as const, color: barChartSplitLineColor, width: 1 } },
    },
    series,
  };

  return (
    <ChartErrorBoundary
      title="أفضل 10 منتجات من حيث الربح" subtitle="Top 10 Products — Monthly Profit Trend"
      isLoading={isLoading} error={error} onRetry={() => refetch()}
      height="380px" titleFlag="green" delay={1}
    >
      <ChartCard
        title="أفضل 10 منتجات من حيث الربح" titleFlag="green"
        subtitle="Top 10 Products — Monthly Profit Trend"
        option={top10Option} height="380px" delay={1}
      />
    </ChartErrorBoundary>
  );
};

export default Top10MostProfitableProducts;