const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { cashiersBase } from "../../utils/cashiersBase";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useFilterStore } from "@/store/filterStore";

const cashiers = cashiersBase.map((c, idx) => ({
  ...c,
  id: `${c.name}-${idx}`,
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

const avgScore = cashiers.reduce((a, c) => a + c.score, 0) / cashiers.length;

const AverageOverallPerformance = () => {
  const palette = useResolvedAnalyticsPalette();
  const selectedEmployees = useFilterStore((s) => s.employee);
  const workShift = useFilterStore((s) => s.workShift);
  const returnRateRange = useFilterStore((s) => s.returnRateRange);

  const scoreColor = (s: number) => {
    if (s >= 63) return palette.primaryGreen;
    if (s >= 55) return palette.primaryAmber;
    if (s >= 45) return "#f97316";
    return palette.primaryRed;
  };

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
    [selectedEmployees, workShift, returnRateRange],
  );
  const ranked = [...filteredCashiers].sort((a, b) => b.score - a.score);

  const gaugeOption = useMemo(() => {
    const gaugeDetailColor =
      avgScore >= 63
        ? palette.primaryGreen
        : avgScore >= 55
          ? palette.primaryAmber
          : avgScore >= 45
            ? "#f97316"
            : palette.primaryRed;
    return {
      xAxis: {
        show: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        show: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      series: [
        {
          type: "gauge",
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          center: ["50%", "59%"],
          radius: "88%",
          pointer: { show: false },
          progress: {
            show: true,
            roundCap: true,
            width: 16,
            itemStyle: {
              color: {
                type: "linear" as const,
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: palette.primaryRed },
                  { offset: 0.5, color: palette.primaryAmber },
                  { offset: 1, color: palette.primaryGreen },
                ],
              },
            },
          },
          axisLine: { lineStyle: { width: 16, color: [[1, "#1e293b"]] } },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          title: { show: false },
          detail: {
            valueAnimation: true,
            fontSize: 22,
            fontWeight: "bold",
            offsetCenter: [0, "12%"],
            color: gaugeDetailColor,
            formatter: "{value}%",
          },
          data: [{ value: +avgScore.toFixed(1) }],
        },
      ],
    };
  }, [palette]);
  return (
    <div className="glass-panel overflow-hidden flex h-full flex-col">
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <ChartTitleFlagBadge flag="green" size="sm" />
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            متوسط الأداء الكلي
          </h3>
        </div>
        <p
          className="text-[10px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          Overall Cashier Performance Score
        </p>
      </div>
      {/* ChartCard = toolbar row + plot; fixed 170px wrapper was shorter than total → overlap below */}
      <div className="shrink-0 w-full">
        <ChartCard
          title=""
          className="hidden"
          option={gaugeOption}
          height="122px"
        />
      </div>
      <div
        className="flex items-center justify-center gap-2 text-[9px] py-3"
        style={{ color: "var(--text-muted)" }}
      >
        {[
          { l: "ضعيف", c: palette.primaryRed },
          { l: "متوسط", c: "#f97316" },
          { l: "جيد", c: palette.primaryAmber },
          { l: "ممتاز", c: palette.primaryGreen },
        ].map((x) => (
          <div key={x.l} className="flex items-center gap-0.5">
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: x.c,
              }}
            />
            <span>{x.l}</span>
          </div>
        ))}
      </div>
      <div
        className="px-4 py-3 space-y-4 flex-1 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <p
          className="text-[10px] font-semibold"
          style={{ color: "var(--text-muted)" }}
        >
          🏆 أفضل 3 كاشيرات
        </p>
        {ranked.slice(0, 3).map((c, i) => (
          <div key={c.id} className="flex items-center gap-2">
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                width: 16,
                color: ["#f59e0b", "#94a3b8", "#cd7c2f"][i],
              }}
            >
              {i + 1}
            </span>
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--bg-elevated)" }}
            >
              <div
                style={{
                  width: `${(c.score / 70) * 100}%`,
                  height: "100%",
                  background: scoreColor(c.score),
                  borderRadius: 9999,
                }}
              />
            </div>
            <span
              className="text-[10px]"
              style={{ color: "var(--text-secondary)" }}
            >
              {c.short}
            </span>
            <span
              className="text-[10px] font-bold"
              style={{ color: scoreColor(c.score) }}
              dir="ltr"
            >
              {c.score}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AverageOverallPerformance;
