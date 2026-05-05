import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

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

const SalesAnalysisByDiscountPercentage = () => {
  const palette = useResolvedAnalyticsPalette();

  const salesByDiscountOption = {
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: AxisTooltipParam | AxisTooltipParam[]) =>
        formatAxisTooltip(params),
    },
    xAxis: {
      type: "category" as const,
      data: ["بدون خصم", "5%", "10%", "15%", "20%", "25%+"],
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
    },
    series: [
      {
        name: "المبيعات",
        type: "bar" as const,
        data: [8200000, 5100000, 4300000, 3600000, 2100000, 1300000],
        itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
        barWidth: 28,
      },
      {
        name: "الأرباح",
        type: "bar" as const,
        data: [2050000, 1120000, 730000, 468000, 189000, 52000],
        itemStyle: { color: palette.primaryCyan, borderRadius: [4, 4, 0, 0] },
        barWidth: 28,
      },
    ],
    legend: { data: ["المبيعات", "الأرباح"], bottom: 0, left: "center" },
  };
  return (
    <ChartCard
      title="تحليل المبيعات حسب نسبة الخصم"
      titleLeading={<ChartTitleFlagBadge flag="green" size="sm" />}
      titleFlag="red"
      titleFlagNumber={1}
      subtitle="تأثير الخصومات على المبيعات والأرباح"
      option={salesByDiscountOption}
      height="300px"
      delay={1}
    />
  );
};

export default SalesAnalysisByDiscountPercentage;
