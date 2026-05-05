import dynamic from "next/dynamic";
import { salesTypeRows } from "../../utils/data";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";

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
const SalesByTypeOfSale = () => {
  const palette = useResolvedAnalyticsPalette();

  const salesTypeOption = {
    tooltip: {
      trigger: "item" as const,
      formatter: (param: ItemTooltipParam) => formatItemTooltip(param),
    },
    xAxis: {
      type: "category" as const,
      data: salesTypeRows.map((r) => r.type),
    },
    yAxis: {
      type: "value" as const,
      name: "المبيعات",
      axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
    },
    series: [
      {
        type: "bar",
        data: salesTypeRows.map((r, i) => ({
          value: r.sales,
          itemStyle: {
            color: [
              palette.primaryGreen,
              palette.primaryRed,
              palette.primaryBlue,
            ][i % 3],
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: "top",
            formatter: `${(r.sales / 1000).toFixed(1)}K`,
            color: "#94a3b8",
            fontSize: 10,
          },
        })),
        barWidth: 44,
      },
    ],
  };
  return (
    <ChartCard
      title="المبيعات حسب نوع البيع"
      titleFlag="green"
      subtitle="Net Sales and Product Sales Volume by SalesType"
      option={salesTypeOption}
      height="320px"
      delay={2}
    />
  );
};

export default SalesByTypeOfSale;
