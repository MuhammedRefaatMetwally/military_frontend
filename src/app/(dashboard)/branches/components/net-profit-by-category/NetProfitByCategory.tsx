import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { BRANCH_PRODUCT_ANALYSIS } from "@/lib/branchProductAnalysis";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const NetProfitByCategory = () => {
  const palette = useResolvedAnalyticsPalette();

  const profitByCategory = useMemo(() => {
    const map = new Map<string, number>();
    BRANCH_PRODUCT_ANALYSIS.forEach((b) => {
      b.cats.forEach((c) => {
        // تقدير ربح تقريبي للفئة بناءً على حجم السلة و ATv
        const estProfit = c.atv * c.basket * c.vol * 0.12;
        map.set(c.name, (map.get(c.name) ?? 0) + estProfit);
      });
    });
    const entries = Array.from(map.entries());
    return {
      labels: entries.map(([name]) => name),
      values: entries.map(([, v]) => Math.round(v)),
    };
  }, []);

  const categoryColors = useMemo(
    () => [
      palette.primaryGreen,
      palette.primaryCyan,
      palette.primaryBlue,
      palette.primaryIndigo,
      palette.primaryAmber,
      palette.primaryRed,
      "#0d9488",
      "#059669",
    ],
    [palette],
  );

  const profitByCategoryOption = useMemo(
    () => ({
      tooltip: { trigger: "axis" as const },
      grid: {
        bottom: "0%",
        top: "12%",
        left: "3%",
        right: "2%",
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: profitByCategory.labels,
        axisLabel: {
          rotate: 28,
          fontSize: 9,
          interval: 0,
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value" as const,
        axisLabel: {
          formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
          fontSize: 9,
        },
      },
      series: [
        {
          type: "bar" as const,
          barMaxWidth: 44,
          data: profitByCategory.values.map((v, i) => ({
            value: v,
            itemStyle: {
              color: categoryColors[i % categoryColors.length],
              borderRadius: [6, 6, 0, 0],
            },
            label: {
              show: true,
              position: "top" as const,
              fontSize: 9,
              fontWeight: "bold" as const,
              color: categoryColors[i % categoryColors.length],
              formatter: (p: { value: number }) =>
                `${(p.value / 1000).toFixed(1)}K`,
            },
          })),
        },
      ],
    }),
    [categoryColors, profitByCategory],
  );
  return (
    <ChartCard
      title="صافي الأرباح حسب الفئة"
      titleFlag="green"
      subtitle="صافي الأرباح حسب الفئة"
      option={profitByCategoryOption}
      height="500px"
      delay={1}
    />
  );
};

export default NetProfitByCategory;
