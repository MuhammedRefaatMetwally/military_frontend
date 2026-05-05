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

const selectedYear = "2025";
const monthsAr = Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`);
const salesData = getMonthlySalesData();
const currentYearData = salesData.map((d) => d.revenue);
const previousYearData = currentYearData.map((v) => Math.round(v * 0.88));
const SalesComparison = () => {
  const palette = useResolvedAnalyticsPalette();

  const yoyComparisonOption = {
    xAxis: { type: "category" as const, data: monthsAr },
    yAxis: {
      type: "value" as const,
      axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
    },
    series: [
      {
        name: `${selectedYear}`,
        type: "bar" as const,
        data: currentYearData,
        barWidth: 16,
        barGap: "20%",
        itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: `${Number(selectedYear) - 1}`,
        type: "bar" as const,
        data: previousYearData,
        barWidth: 16,
        itemStyle: { color: palette.primarySlate, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "الفرق %",
        type: "line" as const,
        yAxisIndex: 0,
        data: currentYearData.map(
          (v, i) =>
            Math.round(
              ((v - previousYearData[i]) / previousYearData[i]) * 100 * 100,
            ) / 100,
        ),
        lineStyle: {
          color: palette.primaryCyan,
          width: 2,
          type: "dashed" as const,
        },
        itemStyle: { color: palette.primaryCyan },
        tooltip: { valueFormatter: (v: number) => `${v}%` },
      },
    ],
    legend: {
      data: [`${selectedYear}`, `${Number(selectedYear) - 1}`, "الفرق %"],
      bottom: 0,
      left: "center",
      textStyle: { color: "var(--text-muted)" },
    },
  };

  return (
    <ChartCard
      title="مقارنة المبيعات — العام الحالي مقابل السابق"
      titleFlag="blue"
      subtitle="مقارنة شهرية مع نسبة التغيير"
      option={yoyComparisonOption}
      height="340px"
      delay={1}
    />
  );
};

export default SalesComparison;
