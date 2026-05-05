import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { getMonthlySalesData } from "@/lib/mockData";
import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const salesData = getMonthlySalesData();
const totalRevenue = salesData.reduce((a, b) => a + b.revenue, 0);
const totalReturns = salesData.reduce((a, b) => a + b.returns, 0);
const totalDiscount = Math.round(totalRevenue * 0.073);
const totalCost = Math.round(totalRevenue * 0.65);

const xAxis = {
  type: "category" as const,
  data: ["إجمالي المبيعات", "التكاليف", "الخصومات", "المرتجعات", "صافي الربح"],
};

const yAxis = {
  type: "value" as const,
  axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
};

const getSalesVsProfitSeries = (
  palette: ReturnType<typeof useResolvedAnalyticsPalette>,
) => [
  {
    type: "bar",
    data: [
      {
        value: totalRevenue,
        itemStyle: {
          color: palette.primarySlate,
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        value: totalCost,
        itemStyle: {
          color: palette.primaryBlue,
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        value: totalDiscount,
        itemStyle: {
          color: palette.primaryAmber,
        },
      },
      {
        value: totalReturns * 50,
        itemStyle: {
          color: palette.primaryRed,
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        value: totalRevenue - totalCost - totalDiscount - totalReturns * 50,
        itemStyle: {
          color: palette.primaryGreen,
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
    barWidth: 36,
  },
];

const RevenueWaterfall = () => {
  const palette = useResolvedAnalyticsPalette();

  // ── شلال الإيرادات ──
  const waterfallOption = {
    xAxis: xAxis,
    yAxis: yAxis,
    series: getSalesVsProfitSeries(palette),
    grid: { bottom: 24 },
  };
  return (
    <ChartCard
      title="شلال الإيرادات"
      titleFlag="blue"
      subtitle="من إجمالي المبيعات إلى صافي الربح"
      option={waterfallOption}
      height="340px"
      delay={3}
    />
  );
};

export default RevenueWaterfall;
