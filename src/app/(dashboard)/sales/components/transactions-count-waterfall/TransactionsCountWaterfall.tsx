"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { Calendar } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { useFilterStore } from "@/store/filterStore";
import {
  isWaterfallYearResponse,
  isWaterfallQuarterResponse,
  type WaterfallPeriod,
  type WaterfallYearEntry,
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

// ─── constants ────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_FROM    = 2010;

const QUARTER_AR: Record<number, string> = {
  1: "ر1", 2: "ر2", 3: "ر3", 4: "ر4",
};

// ─── formatters ───────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(n);

// Y-axis formatter — raw numbers from API, no K suffix from ECharts
const fmtShort = (n: number): string => {
  const abs  = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}م`;
  if (abs >= 1_000_000)     return `${sign}${(abs / 1_000_000).toFixed(1)}م`;
  if (abs >= 1_000)         return `${sign}${(abs / 1_000).toFixed(1)}ك`;
  return `${sign}${abs}`;
};

// ─── types ────────────────────────────────────────────────────────────────────

interface MarketEntry {
  name: string;
  value: number;
  transactionsPrev: number;
  transactionsCurr: number;
  changePct: number;
}

// ─── year-mode waterfall builder ──────────────────────────────────────────────
//
// Layout:
//   [anchor: total of first year]
//   [for each subsequent year: branch delta bars for that year's markets]
//   [anchor: total of last year]
//
// When yearFrom === yearTo (single year), we show the branch breakdown
// for that single year using its markets array directly (sorted desc).
//
function buildYearSeries(
  entries: WaterfallYearEntry[],
  palette: { primaryBlue: string; primaryGreen: string; primaryRed: string },
) {
  const xLabels:    string[]           = [];
  const helperData: (number | null)[]  = [];
  const incData:    (number | null)[]  = [];
  const decData:    (number | null)[]  = [];
  const totalData:  (number | null)[]  = [];

  // ── single-year: show branch contributions as a ranked bar chart ──────────
  if (entries.length === 1) {
    const entry   = entries[0]!;
    const markets = (entry.markets as MarketEntry[] | undefined) ?? [];

    // Opening anchor — full total
    xLabels.push(`إجمالي ${entry.year}`);
    helperData.push(null);
    incData.push(null);
    decData.push(null);
    totalData.push(entry.total);

    // Each branch as a positive bar (sorted descending by |value|)
    const sorted = [...markets].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    sorted.forEach((m) => {
      xLabels.push(m.name);
      helperData.push(null);
      incData.push(m.value > 0 ? m.value : null);
      decData.push(m.value < 0 ? Math.abs(m.value) : null);
      totalData.push(null);
    });

    return { xLabels, helperData, incData, decData, totalData };
  }

  // ── multi-year: anchor → branch deltas per year → anchor ─────────────────
  entries.forEach((entry, i) => {
    if (i === 0) {
      // Opening anchor bar for first year
      xLabels.push(`إجمالي ${entry.year}`);
      helperData.push(null);
      incData.push(null);
      decData.push(null);
      totalData.push(entry.total);
      return;
    }

    const markets = (entry.markets as MarketEntry[] | undefined) ?? [];

    if (markets.length === 0) {
      // No branch breakdown — show single year-to-year delta bar
      const prev  = entries[i - 1]!;
      const delta = entry.total - prev.total;
      const base  = Math.min(prev.total, entry.total);

      xLabels.push(String(entry.year));
      helperData.push(base);
      incData.push(delta > 0 ? delta : null);
      decData.push(delta < 0 ? Math.abs(delta) : null);
      totalData.push(null);
    } else {
      // Show each branch's delta as a floating waterfall bar
      // Sorted descending by absolute value so the biggest movers come first
      const sorted = [...markets].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
      const prev   = entries[i - 1]!;
      let   runningBase = prev.total;

      sorted.forEach((m) => {
        const delta    = m.value;
        const barBase  = delta >= 0
          ? runningBase
          : runningBase + delta; // bottom of the floating bar

        xLabels.push(m.name);
        helperData.push(barBase);
        incData.push(delta > 0 ? delta : null);
        decData.push(delta < 0 ? Math.abs(delta) : null);
        totalData.push(null);

        runningBase += delta;
      });
    }
  });

  // Closing anchor bar — total of the last year
  const last = entries[entries.length - 1]!;
  xLabels.push(`إجمالي ${last.year}`);
  helperData.push(null);
  incData.push(null);
  decData.push(null);
  totalData.push(last.total);

  return { xLabels, helperData, incData, decData, totalData };
}

// ─── quarter-mode waterfall builder ──────────────────────────────────────────

function buildQuarterSeries(periods: WaterfallPeriod[]) {
  if (periods.length === 0)
    return { xLabels: [], helperData: [], incData: [], decData: [], totalData: [] };

  const xLabels:    string[]           = [];
  const helperData: (number | null)[]  = [];
  const incData:    (number | null)[]  = [];
  const decData:    (number | null)[]  = [];
  const totalData:  (number | null)[]  = [];

  periods.forEach((p, i) => {
    const qLabel = `${p.year} ${QUARTER_AR[p.quarter] ?? `Q${p.quarter}`}`;

    if (p.previous_transaction_count === null) {
      // Opening anchor bar
      xLabels.push(qLabel);
      helperData.push(null);
      incData.push(null);
      decData.push(null);
      totalData.push(p.transaction_count);
      return;
    }

    const delta     = p.delta ?? 0;
    const bridgeLow = p.bridge_low ?? Math.min(
      p.previous_transaction_count,
      p.transaction_count,
    );

    xLabels.push(qLabel);
    helperData.push(bridgeLow);
    incData.push(p.change_type === "increase" ? Math.abs(delta) : null);
    decData.push(p.change_type === "decrease" ? Math.abs(delta) : null);
    totalData.push(null);

    // Closing anchor after last period
    if (i === periods.length - 1) {
      xLabels.push("إجمالي");
      helperData.push(null);
      incData.push(null);
      decData.push(null);
      totalData.push(p.transaction_count);
    }
  });

  return { xLabels, helperData, incData, decData, totalData };
}

// ─── component ────────────────────────────────────────────────────────────────

export default function TransactionsCountWaterfall() {
  const palette = useResolvedAnalyticsPalette();

  // ── global filters ──────────────────────────────────────────────────────────
  const {
    activeBranches,
    region,
    year,
    dateRangeFrom,
    dateRangeTo,
  } = useFilterStore();

  const branchIds = activeBranches.length > 0 ? activeBranches : undefined;
  const regionIds = region.length > 0 ? region : undefined;

  // ── derive year range from active filters ───────────────────────────────────
  const { derivedYearFrom, derivedYearTo } = useMemo(() => {
    // 1. Explicit date-range selected
    if (dateRangeFrom && dateRangeTo) {
      return {
        derivedYearFrom: new Date(dateRangeFrom).getFullYear(),
        derivedYearTo:   new Date(dateRangeTo).getFullYear(),
      };
    }

    // 2. Single year from filter bar
    const parsedYear = parseInt(year, 10);
    if (!isNaN(parsedYear)) {
      return {
        derivedYearFrom: parsedYear,
        derivedYearTo:   parsedYear,
      };
    }

    // 3. No filter — full historical range
    return {
      derivedYearFrom: YEAR_FROM,
      derivedYearTo:   CURRENT_YEAR,
    };
  }, [year, dateRangeFrom, dateRangeTo]);

  const [period,   setPeriod]   = useState<"سنوي" | "ربعي">("سنوي");
  const [yearPick, setYearPick] = useState<number>(CURRENT_YEAR);

  // ── year-granularity query ──────────────────────────────────────────────────
  const yearQuery = useTransactionsWaterfall(
    {
      granularity: "year",
      yearFrom: derivedYearFrom,
      yearTo:   derivedYearTo,
      branchIds,
      regionIds,
    },
    { staleTime: 5 * 60_000 },
  );

  // ── quarter-granularity query ───────────────────────────────────────────────
  const quarterQuery = useTransactionsWaterfall(
    {
      granularity: "quarter",
      years: [yearPick],
      branchIds,
      regionIds,
    },
    {
      enabled:   period === "ربعي",
      staleTime: 5 * 60_000,
    },
  );

  // ── year picker options ─────────────────────────────────────────────────────
  const availableYears = useMemo<number[]>(() => {
    if (!yearQuery.data || !isWaterfallYearResponse(yearQuery.data)) return [];
    return yearQuery.data.data.map((d) => d.year);
  }, [yearQuery.data]);

  // ── loading / error state ───────────────────────────────────────────────────
  const activeQuery = period === "سنوي" ? yearQuery : quarterQuery;
  const isLoading   = activeQuery.isLoading || activeQuery.isFetching;
  const isError     = activeQuery.isError;

  // ── build ECharts option ────────────────────────────────────────────────────
  const option = useMemo(() => {
    let xLabels:    string[]           = [];
    let helperData: (number | null)[]  = [];
    let incData:    (number | null)[]  = [];
    let decData:    (number | null)[]  = [];
    let totalData:  (number | null)[]  = [];
    let maxValue:   number | undefined = undefined;

    if (period === "سنوي") {
      if (yearQuery.data && isWaterfallYearResponse(yearQuery.data)) {
        const built = buildYearSeries(yearQuery.data.data, palette);
        xLabels    = built.xLabels;
        helperData = built.helperData;
        incData    = built.incData;
        decData    = built.decData;
        totalData  = built.totalData;
      }
    } else {
      if (quarterQuery.data && isWaterfallQuarterResponse(quarterQuery.data)) {
        maxValue   = quarterQuery.data.max_value || undefined;
        const built = buildQuarterSeries(quarterQuery.data.periods);
        xLabels    = built.xLabels;
        helperData = built.helperData;
        incData    = built.incData;
        decData    = built.decData;
        totalData  = built.totalData;
      }
    }

    const hasData     = xLabels.length > 0;
    const manyBars    = xLabels.length > 12;
    // Enable horizontal scrolling when there are many bars
    const dataZoom    = xLabels.length > 16
      ? [
          {
            type: "inside" as const,
            xAxisIndex: 0,
            start: 0,
            end: Math.min(100, Math.round((16 / xLabels.length) * 100)),
          },
          {
            type: "slider" as const,
            xAxisIndex: 0,
            start: 0,
            end: Math.min(100, Math.round((16 / xLabels.length) * 100)),
            height: 16,
            bottom: 36,
            fillerColor: "rgba(99,102,241,0.15)",
            borderColor: "var(--border-subtle)",
            handleStyle: { color: "var(--accent-blue)" },
            textStyle: { color: "var(--text-muted)", fontSize: 9 },
          },
        ]
      : undefined;

    return {
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        backgroundColor: "var(--bg-panel)",
        borderColor: "var(--border-subtle)",
        textStyle: {
          color: "var(--text-primary)",
          fontSize: 11,
          fontFamily: "inherit",
        },
        formatter: (
          params: Array<{
            seriesName: string;
            data: number | null;
            axisValueLabel?: string;
          }>,
        ) => {
          const label  = params[0]?.axisValueLabel ?? "";
          const total  = params.find((p) => p.seriesName === "إجمالي")?.data;
          const incVal = params.find((p) => p.seriesName === "ارتفاع")?.data ?? 0;
          const decVal = params.find((p) => p.seriesName === "انخفاض")?.data ?? 0;

          if (typeof total === "number" && total !== null) {
            return [
              `<span style="color:var(--text-muted);font-size:10px">${label}</span>`,
              `<span style="color:${palette.primaryBlue};font-weight:700">إجمالي المعاملات</span>`,
              `<span style="color:var(--text-primary)">${fmt(total)}</span>`,
            ].join("<br/>");
          }

          const delta = (Number(incVal) || 0) - (Number(decVal) || 0);
          const color = delta >= 0 ? palette.primaryGreen : palette.primaryRed;
          const sign  = delta >= 0 ? "+" : "";
          return [
            `<span style="color:var(--text-muted);font-size:10px">${label}</span>`,
            `<span style="color:${color};font-weight:700">التغيير في المبيعات</span>`,
            `<span style="color:${color}">${sign}${fmt(delta)}</span>`,
          ].join("<br/>");
        },
      },

      legend: {
        data: ["ارتفاع", "انخفاض", "إجمالي"],
        bottom: dataZoom ? 56 : 0,
        left: "center",
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: "var(--text-muted)", fontSize: 10 },
      },

      grid: {
        top: "8%",
        bottom: dataZoom ? "22%" : "15%",
        left: "6%",
        right: "2%",
        containLabel: true,
      },

      ...(dataZoom ? { dataZoom } : {}),

      xAxis: {
        type: "category" as const,
        data: xLabels,
        axisLabel: {
          fontSize: 9,
          color: "var(--text-muted)",
          interval: 0,
          rotate: manyBars ? 45 : 0,
        },
        axisLine: { lineStyle: { color: "var(--border-subtle)" } },
        axisTick: { show: false },
      },

      yAxis: {
        type: "value" as const,
        max: maxValue,
        axisLabel: {
          fontSize: 9,
          color: "var(--text-muted)",
          // fmtShort handles all abbreviation — no ECharts built-in suffix
          formatter: (val: number) => fmtShort(val),
        },
        splitLine: {
          lineStyle: { color: "var(--border-subtle)", type: "dashed" },
        },
      },

      series: hasData
        ? [
            // invisible helper bar — lifts floating bars to correct position
            {
              name: "helper",
              type: "bar",
              stack: "wf",
              data: helperData,
              itemStyle: { color: "transparent", borderColor: "transparent" },
              emphasis: { itemStyle: { color: "transparent" } },
              silent: true,
              tooltip: { show: false },
            },
            // green increase bars
            {
              name: "ارتفاع",
              type: "bar",
              stack: "wf",
              data: incData,
              itemStyle: {
                color: palette.primaryGreen,
                borderRadius: [3, 3, 0, 0],
              },
              emphasis: { itemStyle: { opacity: 0.85 } },
              barMaxWidth: 40,
            },
            // red decrease bars
            {
              name: "انخفاض",
              type: "bar",
              stack: "wf",
              data: decData,
              itemStyle: {
                color: palette.primaryRed,
                borderRadius: [3, 3, 0, 0],
              },
              emphasis: { itemStyle: { opacity: 0.85 } },
              barMaxWidth: 40,
            },
            // blue anchor bars (totals — NOT stacked)
            {
              name: "إجمالي",
              type: "bar",
              data: totalData,
              itemStyle: {
                color: palette.primaryBlue,
                borderRadius: [3, 3, 0, 0],
              },
              emphasis: { itemStyle: { opacity: 0.85 } },
              barMaxWidth: 40,
            },
          ]
        : [],
    };
  }, [
    period,
    yearQuery.data,
    quarterQuery.data,
    palette,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <ChartCard
        title="عدد المعاملات حسب السنة/الربع والفرع"
        titleFlag="blue"
        subtitle="إجمالي المعاملات · نموذج الجسر يوضح التغييرات (±٪)"
        option={option}
        height="360px"
        titleFlagNumber={6}
        delay={2}
        headerExtra={
          <div className="flex flex-wrap items-center justify-end gap-2">

            {/* ── granularity toggle ──────────────────────────────────── */}
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

            {/* ── year picker (ربعي mode only) ─────────────────────────── */}
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

      {/* loading overlay */}
      {isLoading && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          style={{
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
          }}
        >
          <AnalyticsLoader variant="compact" title="جاري تحميل البيانات" />
        </div>
      )}

      {/* error overlay */}
      {!isLoading && isError && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <p
            style={{
              color: "var(--accent-red)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            تعذّر تحميل البيانات
          </p>
        </div>
      )}
    </div>
  );
}