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
const SellingTypeTrend = () => {
  const palette = useResolvedAnalyticsPalette();

  const salesTypeTrendOption = {
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: AxisTooltipParam | AxisTooltipParam[]) =>
        formatAxisTooltip(params),
    },
    xAxis: {
      type: "category" as const,
      data: Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`),
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
    },
    series: [
      {
        name: "ذمم (كتب رسمية)",
        type: "bar",
        data: [
          1680000, 1650000, 1720000, 1700000, 1750000, 1820000, 1780000,
          1760000, 1850000, 1800000, 1880000, 1950000,
        ].map((v) => ({
          value: v,
          itemStyle: {
            color: palette.primaryGreen,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barWidth: 10,
        barGap: "18%",
      },
      {
        name: "بيع الكتروني",
        type: "bar",
        data: [
          1320000, 1380000, 1450000, 1420000, 1500000, 1580000, 1550000,
          1620000, 1680000, 1720000, 1780000, 1850000,
        ].map((v) => ({
          value: v,
          itemStyle: { color: palette.primaryCyan, borderRadius: [4, 4, 0, 0] },
        })),
        barWidth: 10,
      },
      {
        name: "دفع فوري",
        type: "bar",
        data: [
          620000, 640000, 680000, 700000, 710000, 730000, 720000, 735000,
          760000, 780000, 800000, 820000,
        ].map((v) => ({
          value: v,
          itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] },
        })),
        barWidth: 10,
      },
    ],
    legend: {
      data: ["ذمم (كتب رسمية)", "بيع الكتروني", "دفع فوري"],
      bottom: 0,
      left: "center",
    },
  };

  return (
    <ChartCard
      title="اتجاه نوع البيع"
      subtitle="ذمم — بيع إلكتروني — دفع فوري"
      option={salesTypeTrendOption}
      height="340px"
      delay={4}
    />
  );
};

export default SellingTypeTrend;
