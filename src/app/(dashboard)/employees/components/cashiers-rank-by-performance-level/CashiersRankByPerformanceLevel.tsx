import dynamic from "next/dynamic";
import { useMemo } from "react";
import { cashiersBase } from "../../utils/cashiersBase";
import { useFilterStore } from "@/store/filterStore";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useThemeStore } from "@/store/themeStore";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

function rankGradientRgb(
  index: number,
  total: number,
): [number, number, number] {
  if (total <= 1) return [34, 197, 94];
  const t = index / (total - 1);
  const from = [34, 197, 94] as const;
  const to = [239, 68, 68] as const;
  return from.map((c, j) => Math.round(c + (to[j] - c) * t)) as [
    number,
    number,
    number,
  ];
}

const CashiersRankByPerformanceLevel = () => {
  const selectedEmployees = useFilterStore((s) => s.employee);
  const workShift = useFilterStore((s) => s.workShift);
  const returnRateRange = useFilterStore((s) => s.returnRateRange);
  const palette = useResolvedAnalyticsPalette();
  const isDark = useThemeStore((s) => s.mode === "dark");

  const cashiers = cashiersBase.map((c, idx) => ({
    ...c,
    workShift: (idx % 2 === 0 ? "morning" : "evening") as "morning" | "evening",
    /** عدد الأصناف المباعة (تقديري للعرض) */
    soldItemsCount: Math.max(0, Math.round(c.transactions * (6 + c.atv / 6))),
    /** الالتزام بالدوام (٪) تقديري للعرض */
    attendancePct: Math.max(0, Math.min(100, Math.round(72 + c.score * 0.35))),
    /** تقدير تجميعي من معدل الإلغاء والمعاملات (عرض توضيحي) */
    voidedItemsCount: Math.max(
      0,
      Math.round(c.transactions * (c.voidRate / 100) * 22),
    ),
    /** قيمة تقديرية للمواد الملغاة من المبيعات ومعدل الإلغاء */
    voidedValue: Math.max(0, Math.round(c.sales * (c.voidRate / 100) * 3.2)),
  }));

  const filteredCashiers = useMemo(
    () =>
      cashiers.filter((c) => {
        const okName =
          selectedEmployees.length === 0 || selectedEmployees.includes(c.name);
        const okShift = workShift === "all" || c.workShift === workShift;
        const okReturn =
          c.voidRate >= returnRateRange[0] && c.voidRate <= returnRateRange[1];
        return okName && okShift && okReturn;
      }),
    [selectedEmployees, workShift, returnRateRange, cashiers],
  );

  const ranked = [...filteredCashiers].sort((a, b) => b.score - a.score);
  const perfBarCount = ranked.length;
  const perfRowPx = 40;
  const perfChartHeightPx = Math.max(240, 24 + perfBarCount * perfRowPx);
  const perfOption = useMemo(() => {
    const rnk = [...filteredCashiers].sort((a, b) => b.score - a.score);
    const n = rnk.length;
    return {
      tooltip: {
        trigger: "item" as const,
        formatter: (p: { name: string; value: number }) =>
          `${p.name}: <b style="color:${palette.primaryGreen}">${p.value}%</b>`,
      },
      grid: {
        left: "4%",
        right: "4%",
        top: "2%",
        bottom: 24,
        containLabel: true,
      },
      xAxis: {
        type: "value" as const,
        max: 80,
        axisLabel: { formatter: "{value}%", fontSize: 9, color: "#64748b" },
        axisLine: {
          show: true,
          lineStyle: { color: palette.primarySlate, width: 1.5 },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: isDark ? "#1e293b" : "rgba(100, 116, 139, 0.35)",
          },
        },
      },
      yAxis: {
        type: "category" as const,
        data: rnk.map((c) => c.short),
        inverse: true,
        axisLabel: { fontSize: 10, color: "#94a3b8" },
        axisLine: {
          show: true,
          lineStyle: { color: palette.primarySlate, width: 1.5 },
        },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          barMaxWidth: 20,
          data: rnk.map((c, i) => {
            const [r, g, b] = rankGradientRgb(i, n);
            const solid = `rgb(${r},${g},${b})`;
            return {
              name: c.short,
              value: +c.score.toFixed(2),
              itemStyle: {
                color: solid,
                borderRadius: [0, 6, 6, 0],
              },
              label: {
                show: true,
                position: "right" as const,
                formatter: `${c.score.toFixed(2)}%`,
                fontSize: 10,
                fontWeight: "bold",
                color: solid,
              },
            };
          }),
        },
      ],
    };
  }, [palette, isDark, filteredCashiers]);
  return (
    <div className="min-w-0">
      <ChartCard
        title="ترتيب الكاشيرات حسب درجة الأداء"
        subtitle="Overall Performance Score Ranking — الأعلى أداءً (أخضر) إلى الأسفل (أحمر)"
        option={perfOption}
        titleFlag="green"
        plotOverflowY="auto"
        innerChartHeight={`${perfChartHeightPx}px`}
        height="420px"
        delay={2}
      />
    </div>
  );
};

export default CashiersRankByPerformanceLevel;
