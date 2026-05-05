import { useMemo } from "react";
import dynamic from "next/dynamic";
import { agreements } from "../../utils/agreements";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
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
const MaterialsProfitsAndDiscounts = () => {
  const palette = useResolvedAnalyticsPalette();

  // ── المواد والأرباح والخصومات ──
  const materialsAnalysisOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis" as const,
        formatter: (params: AxisTooltipParam | AxisTooltipParam[]) =>
          formatAxisTooltip(params),
      },
      xAxis: {
        type: "category" as const,
        data: agreements
          .filter((a) => a.materials > 0)
          .map((a) => a.partner.split(" ").slice(0, 2).join(" ")),
        axisLabel: { fontSize: 10 },
      },
      yAxis: [
        {
          type: "value" as const,
          name: "عدد المواد",
          nameLocation: "middle" as const,
          nameGap: 30,
        },
        {
          type: "value" as const,
          name: "الربح",
          nameLocation: "middle" as const,
          nameGap: 50,
          axisLabel: {
            formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
            fontSize: 9,
          },
        },
      ],
      series: [
        {
          name: "عدد المواد",
          type: "bar",
          barGap: "25%",
          data: agreements
            .filter((a) => a.materials > 0)
            .map((a) => ({
              value: a.materials,
              itemStyle: {
                color: palette.primaryBlue,
                borderRadius: [4, 4, 0, 0],
              },
            })),
          barWidth: 18,
        },
        {
          name: "الربح",
          type: "bar",
          yAxisIndex: 1,
          barGap: "25%",
          data: agreements
            .filter((a) => a.materials > 0)
            .map((a) => ({
              value: Math.round(a.value * (a.profitMargin / 100)),
              itemStyle: {
                color: palette.primaryGreen,
                borderRadius: [4, 4, 0, 0],
              },
            })),
          barWidth: 18,
        },
      ],
      legend: {
        data: ["عدد المواد", "الربح"],
        bottom: 0,
        left: "center",
      },
      grid: {
        left: "12%",
        right: "12%",
        top: "12%",
        bottom: "22%",
        containLabel: true,
      },
    }),
    [palette],
  );
  return (
    <ChartCard
      title="المواد والأرباح والخصومات"
      subtitle="تحليل لكل شريك تجاري"
      option={materialsAnalysisOption}
      height="340px"
      delay={1}
    />
  );
};

export default MaterialsProfitsAndDiscounts;
