import { BRANCH_PRODUCT_ANALYSIS } from "@/lib/branchProductAnalysis";
import dynamic from "next/dynamic";
import { productsStandardGrid } from "../../utils/data";
import { useMemo } from "react";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";

const categories = [
  { name: "منتجات غذائية", netSales: 248170, volume: 150240, margin: 38.2 },
  { name: "العناية الشخصية", netSales: 55880, volume: 64300, margin: 42.1 },
  { name: "غير مصنف", netSales: 46000, volume: 38000, margin: 30.5 },
  { name: "فرفاشية", netSales: 240, volume: 480, margin: 25.0 },
  { name: "مستلزمات الأطفال", netSales: 35010, volume: 22800, margin: 44.8 },
  { name: "مستلزمات منزلية", netSales: 10080, volume: 8900, margin: 35.6 },
  { name: "منتجات ورقية", netSales: 22220, volume: 18400, margin: 26.3 },
  { name: "مسطحات", netSales: 8340, volume: 5980, margin: 48.5 },
];

// ── مخطط صافي المبيعات حسب الفئة ──

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const branchNamesForLegend = BRANCH_PRODUCT_ANALYSIS.map((b) => b.branch).join(
  "، ",
);

const NetSalesByCategory = () => {
  const palette = useResolvedAnalyticsPalette();

  const catColors = useMemo(
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
  const salesByCatOption = {
    tooltip: { trigger: "axis" as const },
    grid: { ...productsStandardGrid, bottom: "0" },
    xAxis: {
      type: "category" as const,
      data: categories.map((c) => c.name),
      axisLabel: {
        rotate: 28,
        fontSize: 9,
        interval: 0, // 🔥 force show all labels
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
        type: "bar",
        barMaxWidth: 44,
        data: categories.map((c, i) => ({
          value: c.netSales,
          itemStyle: {
            color: catColors[i],
            borderRadius: [6, 6, 0, 0],
          },
          label: {
            show: true,
            position: "top" as const,
            fontSize: 9,
            fontWeight: "bold",
            color: catColors[i],
            formatter: (p: { value: number }) =>
              `${(p.value / 1000).toFixed(1)}K`,
          },
        })),
      },
    ],
  };
  return (
    <ChartCard
      title="صافي المبيعات حسب الفئة"
      titleFlag="green"
      subtitle={`Net Sales by Category • الفروع: ${branchNamesForLegend}`}
      option={salesByCatOption}
      height="320px"
      delay={1}
    />
  );
};

export default NetSalesByCategory;
