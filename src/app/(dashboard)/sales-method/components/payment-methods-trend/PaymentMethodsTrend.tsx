import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const PaymentMethodsTrend = () => {
  const [methodTrendPeriod, setMethodTrendPeriod] = useState<
    "شهري" | "ربعي" | "سنوي"
  >("شهري");
  const palette = useResolvedAnalyticsPalette();

  const methodTrendOption = useMemo(() => {
    const monthLabels = Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`);
    const quarterLabels = ["ربع 1", "ربع 2", "ربع 3", "ربع 4"];
    const yearLabels = ["سنوي"];

    const groupSum = (arr: number[], size: number) => {
      const out: number[] = [];
      for (let i = 0; i < arr.length; i += size) {
        out.push(arr.slice(i, i + size).reduce((s, n) => s + n, 0));
      }
      return out;
    };

    const seriesMonthly = [
      {
        name: "نقدي",
        color: palette.primaryGreen,
        data: [
          850000, 820000, 900000, 880000, 870000, 950000, 920000, 910000,
          980000, 940000, 1000000, 1100000,
        ],
      },
      {
        name: "فيزا/ماستركارد",
        color: palette.primaryCyan,
        data: [
          560000, 580000, 620000, 600000, 630000, 700000, 680000, 690000,
          730000, 720000, 780000, 850000,
        ],
      },
      {
        name: "كوبون / قسيمة",
        color: palette.primaryAmber,
        data: [
          80000, 90000, 100000, 110000, 95000, 120000, 115000, 108000, 125000,
          118000, 130000, 145000,
        ],
      },
      {
        name: "دفع لاحق",
        color: "#6366f1",
        data: [
          200000, 190000, 210000, 220000, 200000, 230000, 220000, 210000,
          240000, 230000, 250000, 280000,
        ],
      },
    ] as const;

    const labels =
      methodTrendPeriod === "شهري"
        ? monthLabels
        : methodTrendPeriod === "ربعي"
          ? quarterLabels
          : yearLabels;

    const toPeriod = (arr: number[]) => {
      if (methodTrendPeriod === "شهري") return arr;
      if (methodTrendPeriod === "ربعي") return groupSum(arr, 3);
      return [arr.reduce((s, n) => s + n, 0)];
    };

    return {
      xAxis: { type: "category" as const, data: labels },
      yAxis: {
        type: "value" as const,
        axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
      },
      grid: {
        top: "12%",
        bottom: "18%",
        left: "6%",
        right: "3%",
        containLabel: true,
      },
      series: seriesMonthly.map((s) => ({
        name: s.name,
        type: "line" as const,
        stack: "total",
        data: toPeriod([...s.data]),
        areaStyle: { opacity: 0.22 },
        lineStyle: { color: s.color, width: 2 },
        itemStyle: { color: s.color },
        showSymbol: false,
      })),
      legend: {
        data: seriesMonthly.map((s) => s.name),
        bottom: 0,
        left: "center",
      },
    };
  }, [
    methodTrendPeriod,
    palette.primaryAmber,
    palette.primaryCyan,
    palette.primaryGreen,
  ]);
  return (
    <ChartCard
      title="اتجاه طرق الدفع"
      subtitle="تطور استخدام كل طريقة خلال العام"
      option={methodTrendOption}
      height="340px"
      delay={3}
      headerExtra={
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {(["شهري", "ربعي", "سنوي"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setMethodTrendPeriod(p)}
              className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
              style={{
                background:
                  methodTrendPeriod === p
                    ? "var(--accent-green-dim)"
                    : "var(--bg-elevated)",
                color:
                  methodTrendPeriod === p
                    ? "var(--accent-green)"
                    : "var(--text-muted)",
                border: `1px solid ${
                  methodTrendPeriod === p
                    ? "var(--accent-green)"
                    : "var(--border-subtle)"
                }`,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      }
    />
  );
};

export default PaymentMethodsTrend;
