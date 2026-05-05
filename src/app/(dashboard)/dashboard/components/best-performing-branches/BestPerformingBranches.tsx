import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { getBranchData } from "@/lib/mockData";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const branches = getBranchData();

const topBranches = [...branches]
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5);

const BestPerformingBranches = () => {
  const palette = useResolvedAnalyticsPalette();

  const branchChartOption = useMemo(
    () => ({
      xAxis: {
        type: "value" as const,
        axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
      },
      yAxis: {
        type: "category" as const,
        data: topBranches.map((b) => b.nameAr),
        inverse: true,
      },
      series: [
        {
          type: "bar",
          data: topBranches.map((b, i) => ({
            value: b.revenue,
            itemStyle: {
              color: [
                palette.primaryGreen,
                palette.primaryCyan,
                palette.primaryBlue,
                palette.primaryPurple,
                palette.primaryAmber,
              ][i],
              borderRadius: [0, 4, 4, 0],
            },
          })),
          barWidth: 20,
        },
      ],
      grid: { left: "4%", right: "4%", top: "5%", bottom: "8%" },
    }),
    [palette],
  );
  return (
    <ChartCard
      title="أفضل الفروع أداءً"
      subtitle="الإيرادات حسب الفرع — أعلى 5"
      option={branchChartOption}
      height="300px"
      delay={3}
    />
  );
};

export default BestPerformingBranches;
