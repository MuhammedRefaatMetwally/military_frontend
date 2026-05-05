import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { netSalesData } from "./utils/data";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const NetSalesOverTimeForEachBranch = () => {
  const palette = useResolvedAnalyticsPalette();
  const branchChartColors = useMemo(
    () =>
      [
        palette.primaryGreen,
        palette.primaryCyan,
        palette.primaryBlue,
        palette.primaryPurple,
        palette.primaryAmber,
        palette.primaryRed,
        "#0891b2",
        "#d97706",
      ] as const,
    [palette],
  );
  const netSalesByBranchOption = useMemo(() => {
    // ── صافي المبيعات عبر الزمن لكل فرع ──
    const months = Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`);

    return {
      tooltip: { trigger: "axis" as const },
      legend: {
        data: Object.keys(netSalesData),
        bottom: 0,
        textStyle: { fontSize: 9 },
        type: "scroll" as const,
      },
      grid: {
        top: "8%",
        bottom: "20%",
        left: "3%",
        right: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: months,
        axisLabel: { fontSize: 9 },
        boundaryGap: false,
      },
      yAxis: {
        type: "value" as const,
        axisLabel: {
          fontSize: 9,
          formatter: (v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`,
        },
      },
      series: Object.entries(netSalesData).map(([name, data], i) => ({
        name,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: { width: 2 },
        itemStyle: { color: branchChartColors[i] },
        data,
        endLabel: {
          show: true,
          formatter: (p: { value: number }) =>
            `${(p.value / 1000).toFixed(1)}K`,
          fontSize: 9,
          color: branchChartColors[i],
        },
      })),
    };
  }, [branchChartColors]);
  return (
    <ChartCard
      title="صافي المبيعات عبر الزمن لكل فرع"
      titleFlag="green"
      subtitle="صافي المبيعات عبر الزمن لكل فرع"
      option={netSalesByBranchOption}
      height="420px"
      delay={2}
    />
  );
};

export default NetSalesOverTimeForEachBranch;
