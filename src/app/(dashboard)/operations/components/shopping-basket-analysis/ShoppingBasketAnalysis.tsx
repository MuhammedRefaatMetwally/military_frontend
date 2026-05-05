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

const ShoppingBasketAnalysis = () => {
  const palette = useResolvedAnalyticsPalette();

  // ── تحليل السلة الشرائية: عدد المواد وقيمتها ──
  const basketAnalysisOption = useMemo(
    () => ({
      xAxis: {
        type: "category" as const,
        data: [
          "1-3 مواد",
          "4-6 مواد",
          "7-10 مواد",
          "11-15 مواد",
          "16-20 مواد",
          "20+ مواد",
        ],
      },
      yAxis: [
        {
          type: "value" as const,
          name: "الفواتير",
          axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
        },
        {
          type: "value" as const,
          name: "متوسط القيمة",
          axisLabel: { formatter: (v: number) => `${v} د.أ` },
        },
      ],
      series: [
        {
          name: "عدد الفواتير",
          type: "bar",
          data: [45000, 52000, 38000, 24000, 15000, 10500].map((v) => ({
            value: v,
            itemStyle: {
              color: palette.primaryBlue,
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barWidth: 28,
        },
        {
          name: "متوسط القيمة",
          type: "line",
          yAxisIndex: 1,
          data: [28, 65, 115, 178, 245, 380],
          lineStyle: { color: palette.primaryGreen, width: 2 },
          itemStyle: { color: palette.primaryGreen },
        },
      ],
      legend: {
        data: ["عدد الفواتير", "متوسط القيمة"],
        bottom: 0,
        left: "center",
      },
    }),
    [palette],
  );

  return (
    <ChartCard
      title="تحليل السلة الشرائية"
      subtitle="عدد المواد وقيمتها داخل السلة"
      option={basketAnalysisOption}
      height="320px"
      delay={3}
    />
  );
};

export default ShoppingBasketAnalysis;
