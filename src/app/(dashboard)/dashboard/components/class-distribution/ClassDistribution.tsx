import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { getCategoryDistribution } from "@/lib/mockData";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const categories = getCategoryDistribution();

const ClassDistribution = () => {
  const palette = useResolvedAnalyticsPalette();

  const categoryOption = useMemo(
    () => ({
      legend: {
        bottom: 0,
        left: "center" as const,
        data: categories.map((c) => c.nameAr),
      },
      series: [
        {
          type: "pie",
          radius: ["46%", "68%"],
          center: ["50%", "42%"],
          data: categories.map((c) => ({
            name: c.nameAr,
            value: c.value,
            itemStyle: { color: c.color },
          })),
          label: {
            show: true,
            position: "outside" as const,
            color: "#64748b",
            fontSize: 11,
            formatter: "{b}: {d}%",
          },
          labelLine: { lineStyle: { color: palette.labelColor } },
          emphasis: {
            itemStyle: { shadowBlur: 20, shadowColor: "rgba(0,0,0,0.3)" },
          },
        },
      ],
    }),
    [palette],
  );
  return (
    <div className="xl:col-span-1">
      <ChartCard
        title="توزيع الفئات"
        subtitle="توزيع المبيعات حسب فئة المنتج"
        option={categoryOption}
        height="320px"
        delay={2}
      />
    </div>
  );
};

export default ClassDistribution;
