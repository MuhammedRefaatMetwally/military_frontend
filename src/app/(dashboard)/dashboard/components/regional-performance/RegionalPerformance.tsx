import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { getRegionalData } from "@/lib/mockData";
import { useThemeStore } from "@/store/themeStore";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const regions = getRegionalData();

const RegionalPerformance = () => {
  const palette = useResolvedAnalyticsPalette();
  const isDark = useThemeStore((s) => s.mode === "dark");

  const regionOption = useMemo(() => {
    const axisLine = {
      show: true as const,
      lineStyle: { color: palette.primarySlate, width: 1.5 },
    };
    const splitLine = {
      show: true as const,
      lineStyle: {
        color: isDark ? "#1e293b" : "rgba(100, 116, 139, 0.35)",
      },
    };
    return {
      grid: {
        left: "3%",
        right: "4%",
        top: "14%",
        bottom: "14%",
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: regions.map((r) => r.regionAr),
        axisLabel: { fontSize: 9, color: "#64748b" },
        axisLine,
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: "value" as const,
          name: "الإيرادات",
          axisLabel: {
            formatter: (v: number) => `${(v / 1000000).toFixed(0)}M`,
            fontSize: 9,
            color: "#64748b",
          },
          axisLine,
          splitLine,
        },
        {
          type: "value" as const,
          name: "النمو %",
          position: "right" as const,
          axisLabel: {
            formatter: (v: number) => `${v}%`,
            fontSize: 9,
            color: "#64748b",
          },
          axisLine,
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "الإيرادات",
          type: "bar",
          data: regions.map((r) => r.revenue),
          itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] },
          barWidth: 30,
        },
        {
          name: "النمو",
          type: "line",
          yAxisIndex: 1,
          data: regions.map((r) => r.growth),
          lineStyle: { color: palette.primaryGreen, width: 2 },
          itemStyle: { color: palette.primaryGreen },
        },
      ],
      legend: { data: ["الإيرادات", "النمو"], bottom: 0, left: "center" },
    };
  }, [palette, isDark]);
  return (
    <ChartCard
      title="الأداء الإقليمي"
      subtitle="الإيرادات والنمو حسب المنطقة"
      option={regionOption}
      height="300px"
      delay={4}
    />
  );
};

export default RegionalPerformance;
