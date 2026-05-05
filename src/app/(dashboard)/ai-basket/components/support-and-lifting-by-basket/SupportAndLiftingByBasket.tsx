import { useMemo } from "react";
import ChartCard from "@/components/ui/chart-card/ChartCard";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { rules } from "../../utils/rules";

const SupportAndLiftingByBasket = () => {
  const palette = useResolvedAnalyticsPalette();

  // ── الدعم والرفع حسب السلة (Scatter) ──
  const scatterOption = useMemo(() => {
    const series = palette.seriesPalette;
    return {
      tooltip: {
        trigger: "item" as const,
        formatter: (p: { seriesName: string; value: [number, number] }) =>
          `<b>${p.seriesName}</b><br/>الدعم: ${p.value[0].toFixed(2)}%<br/>الرفع: ${p.value[1].toFixed(2)}`,
      },
      legend: {
        data: rules.slice(0, 8).map((r) => r.basket),
        top: 4,
        left: "center",
        textStyle: { fontSize: 7 },
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 4,
      },
      grid: { left: "12%", right: "6%", top: "22%", bottom: "14%" },
      xAxis: {
        type: "value" as const,
        name: "الدعم (Support)",
        nameLocation: "middle" as const,
        nameGap: 28,
        nameTextStyle: { fontSize: 10, fontWeight: "bold" as const },
        axisLabel: { fontSize: 9 },
        splitLine: {
          lineStyle: { type: "dashed" as const, color: "var(--border-subtle)" },
        },
      },
      yAxis: {
        type: "value" as const,
        name: "الرفع (Lift)",
        nameLocation: "middle" as const,
        nameGap: 34,
        nameTextStyle: { fontSize: 10, fontWeight: "bold" as const },
        axisLabel: { fontSize: 9 },
        splitLine: {
          lineStyle: { type: "dashed" as const, color: "var(--border-subtle)" },
        },
      },
      series: rules.slice(0, 8).map((r, i) => ({
        name: r.basket,
        type: "scatter" as const,
        data: [[r.support * 100, r.lift]],
        symbolSize: 16 + r.lift * 3,
        itemStyle: {
          color: series[i % series.length],
          opacity: 0.85,
        },
      })),
    };
  }, [palette]);
  return (
    <ChartCard
      title="الدعم والرفع حسب السلة"
      subtitle="Support Basket and Lift by Basket"
      option={scatterOption}
      height="420px"
      aiPowered
      delay={2}
    />
  );
};

export default SupportAndLiftingByBasket;
