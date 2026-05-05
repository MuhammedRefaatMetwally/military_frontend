import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { getMonthlySalesData } from "@/lib/mockData";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const salesData = getMonthlySalesData();

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const RevenueTrend = () => {
  const palette = useResolvedAnalyticsPalette();

  const revenueTrendOption = useMemo(
    () => ({
      xAxis: {
        type: "category" as const,
        data: salesData.map((_, i) => `شهر ${i + 1}`),
      },
      yAxis: {
        type: "value" as const,
        axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
      },
      series: [
        {
          name: "الإيرادات",
          type: "line",
          data: salesData.map((d) => d.revenue),
          smooth: true,
          lineStyle: { color: palette.primaryGreen, width: 2 },
          itemStyle: { color: palette.primaryGreen },
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: palette.primaryGreen },
                { offset: 1, color: hexToRgba(palette.primaryGreen, 0) },
              ],
            },
          },
        },
        {
          name: "صافي الإيرادات",
          type: "line",
          data: salesData.map((d) => d.netRevenue),
          smooth: true,
          lineStyle: {
            color: palette.primaryCyan,
            width: 2,
            type: "dashed" as const,
          },
          itemStyle: { color: palette.primaryCyan },
        },
      ],
      legend: {
        data: ["الإيرادات", "صافي الإيرادات"],
        bottom: 0,
        left: "center",
      },
    }),
    [palette],
  );
  return (
    <div className="xl:col-span-2">
      <ChartCard
        title="اتجاه الإيرادات"
        subtitle="أداء الإيرادات الشهرية وصافي الإيرادات"
        option={revenueTrendOption}
        height="320px"
        delay={1}
      />
    </div>
  );
};

export default RevenueTrend;
