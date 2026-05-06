import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { Calendar } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { useFilterStore } from "@/store/filterStore";
import {
  isWaterfallYearResponse,
  isWaterfallQuarterResponse,
} from "@/api/sales-analyses/types";
import { useTransactionsWaterfall } from "@/hooks/useSalesAnalyses";
import AnalyticsLoader from "@/components/ui/analytics-loader";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 340 }}>Loading chart...</div>,
  },
);

// ─── helpers ──────────────────────────────────────────────────────────────────

function toWaterfallSteps(labels: string[], totals: number[]) {
  const x: string[] = [];
  const stepKind: ("total" | "delta")[] = [];
  const values: number[] = [];

  for (let i = 0; i < totals.length; i++) {
    x.push(labels[i] ?? `${i + 1}`);
    stepKind.push("total");
    values.push(totals[i] ?? 0);
    if (i < totals.length - 1) {
      x.push((labels[i + 1] ?? "").trim());
      stepKind.push("delta");
      values.push((totals[i + 1] ?? 0) - (totals[i] ?? 0));
    }
  }

  return { x, stepKind, values };
}

function buildWaterfallSeries(
  values: number[],
  stepKind: ("total" | "delta")[],
) {
  const helper: number[] = [];
  const inc: number[] = [];
  const dec: number[] = [];
  const totalBars: (number | null)[] = [];
  let running = 0;

  for (let i = 0; i < values.length; i++) {
    if (stepKind[i] === "total") {
      helper.push(0);
      inc.push(0);
      dec.push(0);
      totalBars.push(values[i]);
      running = values[i] ?? 0;
    } else {
      const d = values[i] ?? 0;
      helper.push(Math.min(running, running + d));
      inc.push(d > 0 ? d : 0);
      dec.push(d < 0 ? -d : 0);
      totalBars.push(null);
      running += d;
    }
  }

  return { helper, inc, dec, totalBars };
}

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

const QUARTER_LABELS = ["ربع 1", "ربع 2", "ربع 3", "ربع 4"] as const;
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_FROM = 2010;

// ─── component ────────────────────────────────────────────────────────────────

export default function TransactionsCountWaterfall() {
  const palette = useResolvedAnalyticsPalette();

  // ── global filters ─────────────────────────────────────────────────────────
  // activeBranches → written by GlobalFilterBar on every page
  // region         → written by GlobalFilterBar only when on /sales
  const { activeBranches, region } = useFilterStore();

  const branchIds = activeBranches.length > 0 ? activeBranches : undefined;
  const regionIds = region.length > 0 ? region : undefined;

  // ── local chart-level controls ─────────────────────────────────────────────
  const [period, setPeriod] = useState<"سنوي" | "ربعي">("سنوي");
  const [yearPick, setYearPick] = useState<number>(CURRENT_YEAR);

  // ── year-granularity query (always active) ─────────────────────────────────
  const yearQuery = useTransactionsWaterfall(
    {
      granularity: "year",
      yearFrom: YEAR_FROM,
      yearTo: CURRENT_YEAR,
      branchIds,
      regionIds,
    },
    { staleTime: 5 * 60_000 },
  );

  // ── quarter-granularity query (only active in ربعي mode) ──────────────────
  const quarterQuery = useTransactionsWaterfall(
    {
      granularity: "quarter",
      years: [yearPick],
      branchIds,
      regionIds,
    },
    {
      enabled: period === "ربعي",
      staleTime: 5 * 60_000,
    },
  );

  // ── year picker options from API ───────────────────────────────────────────
  const availableYears = useMemo<number[]>(() => {
    if (!yearQuery.data || !isWaterfallYearResponse(yearQuery.data)) return [];
    return yearQuery.data.data.map((d) => d.year);
  }, [yearQuery.data]);

  // ── loading / error tied to whichever query is active ─────────────────────
  const activeQuery = period === "سنوي" ? yearQuery : quarterQuery;
  const isLoading = activeQuery.isLoading || activeQuery.isFetching;
  const isError = activeQuery.isError;

  // ── chart option ───────────────────────────────────────────────────────────
  const option = useMemo(() => {
    let viewLabels: string[] = [];
    let viewTotals: number[] = [];

    if (period === "سنوي") {
      if (yearQuery.data && isWaterfallYearResponse(yearQuery.data)) {
        viewLabels = yearQuery.data.data.map((d) => String(d.year));
        viewTotals = yearQuery.data.data.map((d) => d.total);
      }
    } else {
      if (quarterQuery.data && isWaterfallQuarterResponse(quarterQuery.data)) {
        const count = Math.max(quarterQuery.data.periods.length, 4);
        viewLabels = Array.from(
          { length: count },
          (_, i) => QUARTER_LABELS[i] ?? `Q${i + 1}`,
        );
        viewTotals = Array.from({ length: count }, () => 0);
      }
    }

    const { x, stepKind, values } = toWaterfallSteps(viewLabels, viewTotals);
    const { helper, inc, dec, totalBars } = buildWaterfallSeries(
      values,
      stepKind,
    );

    return {
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        backgroundColor: "#1a2035",
        borderColor: "#1e293b",
        textStyle: { color: "#e2e8f0", fontSize: 10 },
        formatter: (
          params: Array<{
            seriesName: string;
            data: number | null;
            axisValueLabel?: string;
          }>,
        ) => {
          const total = params.find((p) => p.seriesName === "إجمالي")?.data;
          const incV = params.find((p) => p.seriesName === "إرتفاع")?.data ?? 0;
          const decV = params.find((p) => p.seriesName === "إنخفاض")?.data ?? 0;
          const delta = (incV ?? 0) - (decV ?? 0);
          const title = params[0]?.axisValueLabel ?? "";

          if (typeof total === "number") {
            return `<b style="color:${palette.primaryBlue}">${title}</b><br/>عدد المعاملات: ${fmt(total)}`;
          }
          const color =
            delta >= 0 ? palette.primaryGreen : palette.primaryRed;
          return `<b style="color:${color}">${title}</b><br/>التغير: ${delta >= 0 ? "+" : ""}${fmt(delta)}`;
        },
      },
      legend: {
        data: ["إرتفاع", "إنخفاض", "إجمالي"],
        bottom: 0,
        left: "center",
        textStyle: { color: "var(--text-muted)", fontSize: 10 },
      },
      grid: {
        top: "12%",
        bottom: "18%",
        left: "8%",
        right: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: x,
        axisLabel: { fontSize: 9, color: "#94a3b8", interval: 0, rotate: 0 },
        axisLine: { lineStyle: { color: "#334155" } },
      },
      yAxis: {
        type: "value" as const,
        name: "عدد المعاملات",
        nameLocation: "end" as const,
        nameGap: 10,
        nameTextStyle: { color: "#64748b", fontSize: 10 },
        axisLabel: { fontSize: 9, color: "#64748b" },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      series: [
        {
          name: "helper",
          type: "bar",
          stack: "wf",
          data: helper,
          itemStyle: { color: "transparent" },
          emphasis: { itemStyle: { color: "transparent" } },
          silent: true,
        },
        {
          name: "إرتفاع",
          type: "bar",
          stack: "wf",
          data: inc,
          itemStyle: { color: palette.primaryGreen },
          barWidth: 45,
        },
        {
          name: "إنخفاض",
          type: "bar",
          stack: "wf",
          data: dec,
          itemStyle: { color: palette.primaryRed },
          barWidth: 45,
        },
        {
          name: "إجمالي",
          type: "bar",
          data: totalBars,
          itemStyle: { color: palette.primaryBlue },
          barWidth: 45,
        },
      ],
    };
  }, [
    period,
    yearQuery.data,
    quarterQuery.data,
    palette.primaryBlue,
    palette.primaryGreen,
    palette.primaryRed,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // The overlay is a sibling to ChartCard inside a relative wrapper —
  // ChartCard has no overlay prop so we can't pass it in directly.
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <ChartCard
        title="عدد المعاملات حسب السنة/الربع والفرع"
        titleFlag="blue"
        subtitle="عدد المعاملات حسب السنة / الربع وموقع الفرع"
        option={option}
        height="360px"
        titleFlagNumber={6}
        delay={2}
        headerExtra={
          <div className="flex flex-wrap items-center justify-end gap-2">

            {/* ── سنوي / ربعي toggle ──────────────────────────────────── */}
            <div className="flex items-center gap-1">
              {(["سنوي", "ربعي"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
                  style={{
                    background:
                      period === p
                        ? "var(--accent-blue-dim)"
                        : "var(--bg-elevated)",
                    color:
                      period === p
                        ? "var(--accent-blue)"
                        : "var(--text-muted)",
                    border: `1px solid ${
                      period === p
                        ? "var(--accent-blue)"
                        : "var(--border-subtle)"
                    }`,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* ── year picker (ربعي mode only, options from API) ────────── */}
            {period === "ربعي" && (
              <Dropdown
                icon={Calendar}
                label="السنة"
                value={String(yearPick)}
                options={
                  availableYears.length > 0
                    ? availableYears.map((y) => ({
                        value: String(y),
                        label: String(y),
                      }))
                    : [{ value: String(yearPick), label: String(yearPick) }]
                }
                onChange={(v) => setYearPick(Number(v))}
                accent="var(--accent-blue)"
                left0={true}
              />
            )}
          </div>
        }
      />

      {/* ── loading overlay ──────────────────────────────────────────────── */}
      {isLoading && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
          }}
        >
          <AnalyticsLoader variant="compact" title="جاري تحميل البيانات" />
        </div>
      )}

      {/* ── error overlay ────────────────────────────────────────────────── */}
      {!isLoading && isError && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <p style={{ color: "var(--accent-red)", fontSize: 13, fontWeight: 600 }}>
            تعذّر تحميل البيانات
          </p>
        </div>
      )}
    </div>
  );
}