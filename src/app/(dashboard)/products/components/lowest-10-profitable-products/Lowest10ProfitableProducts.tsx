import dynamic from "next/dynamic";
import { productsStandardGrid } from "../../utils/data";
import { useThemeStore } from "@/store/themeStore";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const months = Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`);
const redTones = [
  "#dc2626",
  "#ef4444",
  "#f97316",
  "#d97706",
  "#b91c1c",
  "#9a3412",
  "#c2410c",
  "#ea580c",
  "#e11d48",
  "#be123c",
];

type AxisTooltipParam = {
  axisValueLabel?: string;
  marker?: string;
  seriesName?: string;
  value?: number | string;
};

function formatAxisTooltip(params: AxisTooltipParam | AxisTooltipParam[]) {
  const items = Array.isArray(params) ? params : [params];
  const title = items[0]?.axisValueLabel ?? "";
  const rows = items
    .map(
      (item) => `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:14px;">
          <div style="display:flex; align-items:center;">
            <span style="display:inline-flex; margin-inline-end:8px;">${item.marker ?? ""}</span>
            <span>${item.seriesName ?? ""}</span>
          </div>
          <strong>${Number(item.value ?? 0).toLocaleString("en-US")}</strong>
        </div>`,
    )
    .join("");

  return `
    <div style="display:flex; flex-direction:column; gap:8px; min-width:160px;">
      <div style="font-weight:700;">${title}</div>
      ${rows}
    </div>`;
}

const bottom10 = [
  {
    name: "سبانخ معلبة هيلو 28 غم",
    profit: 18,
    trend: [5, 4, 3, 2, 3, 2, 1, 2, 1, 1, 1, 1],
  },
  {
    name: "أوكال كوباية لبن كيس 15",
    profit: 22,
    trend: [6, 5, 5, 4, 3, 3, 2, 2, 2, 1, 1, 2],
  },
  {
    name: "معمول بودرة نقاطة 43 غم",
    profit: 24,
    trend: [8, 7, 6, 5, 5, 4, 3, 3, 2, 2, 2, 2],
  },
  {
    name: "طحينة طعم بخل الأصل 1000ملل",
    profit: 31,
    trend: [10, 9, 8, 7, 6, 5, 4, 4, 3, 3, 2, 3],
  },
  {
    name: "شوكولاته توبي ربيع بلاستيك 30",
    profit: 38,
    trend: [14, 12, 11, 9, 8, 7, 6, 5, 5, 4, 3, 4],
  },
  {
    name: "ندى خضراء تحت الشرقي كار باكت",
    profit: 42,
    trend: [18, 16, 14, 12, 10, 9, 8, 7, 6, 5, 5, 4],
  },
  {
    name: "قرص ويفر 250ملل كيمر",
    profit: 47,
    trend: [22, 20, 18, 15, 13, 11, 10, 9, 8, 7, 6, 5],
  },
  {
    name: "مامون كبير 550ملل بلاستيك",
    profit: 51,
    trend: [28, 25, 22, 19, 16, 14, 12, 11, 10, 8, 7, 6],
  },
  {
    name: "فول مطبوخ كامل القمر 500 ملل",
    profit: 56,
    trend: [35, 32, 28, 24, 20, 18, 15, 13, 12, 10, 9, 8],
  },
  {
    name: "محدون اكسل مساسكا 300 مل ستاكس",
    profit: 61,
    trend: [42, 38, 34, 30, 26, 22, 19, 16, 14, 12, 10, 9],
  },
];

const Lowest10ProfitableProducts = () => {
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  /** Same as ChartCard `hasBarSeries` cartesian enhancement (bar charts only get this automatically). */
  const barChartSpineColor = isDark ? "#64748b" : "#94a3b8";
  const barChartSplitLineColor = isDark
    ? "rgba(148,163,184,0.22)"
    : "rgba(100,116,139,0.3)";
  const bottom10Option = {
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: AxisTooltipParam | AxisTooltipParam[]) =>
        formatAxisTooltip(params),
    },
    legend: {
      type: "scroll" as const,
      bottom: 0,
      textStyle: {
        fontSize: 10,
        lineHeight: 14, // 👈 fixes text clipping
      },
      pageIconSize: 10,
      itemGap: 20,
    },
    grid: { ...productsStandardGrid },
    xAxis: {
      type: "category" as const,
      data: months,
      boundaryGap: false,
      axisLabel: {
        fontSize: 9,
        lineHeight: 12,
        formatter: (v: string) => `{m|${v}}\n{y|2026}`,
        rich: {
          m: { lineHeight: 12 },
          y: { lineHeight: 12, padding: [24, 0, 0, 0] },
        },
      },
      splitLine: { show: false },
      axisLine: {
        show: true,
        lineStyle: { width: 2, color: barChartSpineColor },
      },
      axisTick: {
        show: true,
        length: 5,
        lineStyle: { width: 1, color: barChartSpineColor },
      },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { fontSize: 9 },
      axisTick: { show: false },
      axisLine: {
        show: true,
        lineStyle: { width: 2, color: barChartSpineColor },
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed" as const,
          color: barChartSplitLineColor,
          width: 1,
        },
      },
    },
    series: bottom10.map((p, i) => ({
      name: p.name,
      type: "line" as const,
      data: p.trend,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: redTones[i] },
      itemStyle: { color: redTones[i] },
    })),
  };
  return (
    <ChartCard
      title="أدنى 10 منتجات من حيث الربح"
      titleFlag="green"
      subtitle="Bottom 10 Products — Monthly Profit Trend"
      option={bottom10Option}
      height="380px"
      delay={2}
    />
  );
};

export default Lowest10ProfitableProducts;
