import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const NumberOfSalesAndMonetaryValue = () => {
  const palette = useResolvedAnalyticsPalette();

  const productPerformanceOption = useMemo(
    () => ({
      xAxis: {
        type: "category" as const,
        data: [
          "أرز",
          "زيت زيتون",
          "دجاج",
          "سكر",
          "حليب",
          "منظفات",
          "تونة",
          "حفاضات",
        ],
        axisLabel: { fontSize: 10 },
      },
      yAxis: [
        {
          type: "value" as const,
          name: "الوحدات",
          axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
        },
        {
          type: "value" as const,
          name: "القيمة",
          axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
        },
      ],
      series: [
        {
          name: "عدد الوحدات",
          type: "bar",
          data: [72000, 45000, 38000, 55000, 62000, 28000, 32000, 18000],
          itemStyle: {
            color: palette.primaryBlue,
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: 16,
        },
        {
          name: "القيمة المادية",
          type: "bar",
          data: [360000, 315000, 285000, 110000, 93000, 196000, 128000, 234000],
          itemStyle: {
            color: palette.primaryGreen,
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: 16,
        },
      ],
      legend: {
        data: ["عدد الوحدات", "القيمة المادية"],
        bottom: 0,
        left: "center",
      },
    }),
    [palette],
  );

  return (
    <ChartCard
      title="عدد المبيعات والقيمة المادية"
      subtitle="لكل منتج — الوحدات المباعة مقابل القيمة"
      option={productPerformanceOption}
      height="320px"
      delay={4}
    />
  );
};

export default NumberOfSalesAndMonetaryValue;
