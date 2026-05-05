import { useMemo } from "react";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

type ItemTooltipParam = {
  marker?: string;
  name?: string;
  value?: number | string;
};

function formatItemTooltip(param: ItemTooltipParam) {
  return `
    <div style="display:flex; align-items:center; justify-content:space-between; gap:14px; min-width:140px;">
      <div style="display:flex; align-items:center;">
        <span style="display:inline-flex; margin-inline-end:8px;">${param.marker ?? ""}</span>
        <span>${param.name ?? ""}</span>
      </div>
      <strong>${Number(param.value ?? 0).toLocaleString("en-US")}</strong>
    </div>`;
}
const ValueByType = () => {
  const palette = useResolvedAnalyticsPalette();

  // ── القيمة حسب النوع ──
  const valueByTypeOption = useMemo(
    () => ({
      tooltip: {
        trigger: "item" as const,
        formatter: (param: ItemTooltipParam) => formatItemTooltip(param),
      },
      xAxis: {
        type: "category" as const,
        data: ["مشتريات", "توزيع", "خدمات", "تسويق"],
      },
      yAxis: {
        type: "value" as const,
        axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
      },
      series: [
        {
          type: "bar",
          data: [
            {
              value: 2160000,
              itemStyle: {
                color: palette.primaryGreen,
                borderRadius: [4, 4, 0, 0],
              },
            },
            {
              value: 850000,
              itemStyle: {
                color: palette.primaryCyan,
                borderRadius: [4, 4, 0, 0],
              },
            },
            {
              value: 180000,
              itemStyle: {
                color: palette.primaryIndigo,
                borderRadius: [4, 4, 0, 0],
              },
            },
            {
              value: 450000,
              itemStyle: {
                color: palette.primaryAmber,
                borderRadius: [4, 4, 0, 0],
              },
            },
          ],
          barWidth: 40,
        },
      ],
    }),
    [palette],
  );
  return (
    <ChartCard
      title="القيمة حسب النوع"
      subtitle="إجمالي قيمة العقود"
      option={valueByTypeOption}
      height="340px"
      delay={2}
    />
  );
};

export default ValueByType;
