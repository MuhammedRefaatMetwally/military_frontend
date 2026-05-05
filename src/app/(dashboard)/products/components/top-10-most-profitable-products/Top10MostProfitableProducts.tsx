import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
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

const top10 = [
  {
    name: "أرز مطبوخ ممتاز سطح الطرمة 4.5 كجم",
    profit: 8420,
    trend: [520, 580, 610, 640, 700, 750, 680, 720, 810, 850, 880, 920],
  },
  {
    name: "الفراولة تايم تشكيلة ألبو سيرياكس كبير",
    profit: 7680,
    trend: [480, 520, 540, 600, 640, 690, 620, 660, 740, 780, 810, 840],
  },
  {
    name: "معجون بودي ناعم بطاقة 45 غم",
    profit: 6540,
    trend: [400, 430, 470, 510, 530, 580, 560, 600, 640, 670, 690, 720],
  },
  {
    name: "طحينة طعم الأصل 1000 ملل",
    profit: 5890,
    trend: [350, 380, 420, 460, 480, 530, 500, 540, 580, 610, 630, 660],
  },
  {
    name: "شوكولاته توبي مولد كلشيء بلاستيك 30",
    profit: 5240,
    trend: [310, 340, 360, 400, 430, 470, 440, 480, 520, 550, 570, 600],
  },
  {
    name: "شوكولاته ندى تحت الجرب خضراء كار 30",
    profit: 4780,
    trend: [280, 300, 330, 370, 390, 420, 400, 440, 470, 500, 510, 540],
  },
  {
    name: "قرص ويفر 250ملل كيمر بلاستيك",
    profit: 4320,
    trend: [240, 260, 290, 320, 350, 380, 360, 390, 420, 440, 460, 490],
  },
  {
    name: "جبن هروة جاج 18 غم غامق 100 غم",
    profit: 3960,
    trend: [200, 220, 250, 280, 310, 340, 320, 350, 380, 400, 420, 450],
  },
  {
    name: "جبل طيبي 1 كيل طيبي 250 غم",
    profit: 3580,
    trend: [180, 200, 220, 250, 270, 300, 280, 310, 340, 360, 380, 400],
  },
  {
    name: "مكارونة كلاسيك ألبين 15 كجم",
    profit: 3240,
    trend: [150, 170, 190, 220, 240, 270, 250, 280, 310, 330, 340, 360],
  },
];

const Top10MostProfitableProducts = () => {
  const palette = useResolvedAnalyticsPalette();
  const mode = useThemeStore((s) => s.mode);

  const isDark = mode === "dark";
  const barChartSplitLineColor = isDark
    ? "rgba(148,163,184,0.22)"
    : "rgba(100,116,139,0.3)";
  /** Same as ChartCard `hasBarSeries` cartesian enhancement (bar charts only get this automatically). */
  const barChartSpineColor = isDark ? "#64748b" : "#94a3b8";
  const greenTones = palette.greenScale;

  const top10Option = {
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
      pageIconColor: palette.primaryGreen,
      pageIconSize: 10,
      // add space between legend and chart
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
    series: top10.map((p, i) => ({
      name: p.name,
      type: "line" as const,
      data: p.trend,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: greenTones[i % greenTones.length] },
      itemStyle: { color: greenTones[i % greenTones.length] },
    })),
  };

  return (
    <ChartCard
      title="أفضل 10 منتجات من حيث الربح"
      titleFlag="green"
      subtitle="Top 10 Products — Monthly Profit Trend"
      option={top10Option}
      height="380px"
      delay={1}
    />
  );
};

export default Top10MostProfitableProducts;
