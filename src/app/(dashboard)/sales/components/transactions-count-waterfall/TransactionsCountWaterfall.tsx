"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
const YEAR_FROM = 2010;

const BAR_WIDTH = 36;
const BAR_GAP = 12;
const PX_PER_BAR = BAR_WIDTH + BAR_GAP + 24;
const MIN_CHART_WIDTH = 1000;
const CHART_HEIGHT = 520;

const QUARTER_AR: Record<number, string> = {
  1: "ر1",
  2: "ر2",
  3: "ر3",
  4: "ر4",
};

// ─── formatters ───────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(n);

const fmtShort = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000)
    return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
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

interface BarDataItem {
  value: number | null;
  itemStyle?: { color: string; borderRadius?: number[] };
  label?: {
    show: boolean;
    position: string;
    formatter: string;
    color: string;
    fontSize: number;
    fontWeight: number;
  };
}

// ─── series builders ──────────────────────────────────────────────────────────
// (unchanged — same as original)

function buildYearSeries(
  entries: WaterfallYearEntry[],
  palette: { primaryBlue: string; primaryGreen: string; primaryRed: string },
) {
  const xLabels: string[] = [];
  const helperData: (number | null)[] = [];
  const incData: (BarDataItem | null)[] = [];
  const decData: (BarDataItem | null)[] = [];
  const totalData: (BarDataItem | null)[] = [];
  const connectorPoints: { index: number; value: number }[] = [];

  if (entries.length === 1) {
    const entry = entries[0]!;
    const markets = (entry.markets as MarketEntry[] | undefined) ?? [];

    xLabels.push(`إجمالي ${entry.year}`);
    helperData.push(null);
    incData.push(null);
    decData.push(null);
    totalData.push({
      value: entry.total,
      itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] },
      label: {
        show: true,
        position: "top",
        formatter: fmtShort(entry.total),
        color: palette.primaryBlue,
        fontSize: 10,
        fontWeight: 600,
      },
    });

    const sorted = [...markets].sort(
      (a, b) => Math.abs(b.value) - Math.abs(a.value),
    );
    let runningValue = entry.total;

    sorted.forEach((m) => {
      xLabels.push(m.name);
      const isIncrease = m.value > 0;
      const barBase = isIncrease ? runningValue : runningValue + m.value;

      helperData.push(barBase);
      incData.push(
        isIncrease
          ? {
              value: m.value,
              itemStyle: {
                color: palette.primaryGreen,
                borderRadius: [4, 4, 0, 0],
              },
            }
          : null,
      );
      decData.push(
        !isIncrease
          ? {
              value: Math.abs(m.value),
              itemStyle: {
                color: palette.primaryRed,
                borderRadius: [4, 4, 0, 0],
              },
            }
          : null,
      );
      totalData.push(null);
      runningValue += m.value;
    });

    return {
      xLabels,
      helperData,
      incData,
      decData,
      totalData,
      connectorPoints,
    };
  }

  let globalRunningValue = 0;

  entries.forEach((entry, entryIdx) => {
    const markets = (entry.markets as MarketEntry[] | undefined) ?? [];

    if (entryIdx === 0) {
      xLabels.push(`إجمالي ${entry.year}`);
      helperData.push(null);
      incData.push(null);
      decData.push(null);
      totalData.push({
        value: entry.total,
        itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: "top",
          formatter: fmtShort(entry.total),
          color: palette.primaryBlue,
          fontSize: 10,
          fontWeight: 600,
        },
      });
      globalRunningValue = entry.total;
      connectorPoints.push({ index: 0, value: entry.total });
      return;
    }

    const prevEntry = entries[entryIdx - 1]!;
    let runningValue = prevEntry.total;

    if (markets.length === 0) {
      const delta = entry.total - prevEntry.total;
      const isIncrease = delta >= 0;
      const barBase = isIncrease ? runningValue : runningValue + delta;

      xLabels.push(String(entry.year));
      helperData.push(barBase);
      incData.push(
        isIncrease
          ? {
              value: delta,
              itemStyle: {
                color: palette.primaryGreen,
                borderRadius: [4, 4, 0, 0],
              },
            }
          : null,
      );
      decData.push(
        !isIncrease
          ? {
              value: Math.abs(delta),
              itemStyle: {
                color: palette.primaryRed,
                borderRadius: [4, 4, 0, 0],
              },
            }
          : null,
      );
      totalData.push(null);
      runningValue = entry.total;
    } else {
      const sorted = [...markets].sort(
        (a, b) => Math.abs(b.value) - Math.abs(a.value),
      );

      sorted.forEach((m) => {
        const delta = m.value;
        const isIncrease = delta >= 0;
        const barBase = isIncrease ? runningValue : runningValue + delta;

        xLabels.push(m.name);
        helperData.push(barBase);
        incData.push(
          isIncrease
            ? {
                value: delta,
                itemStyle: {
                  color: palette.primaryGreen,
                  borderRadius: [4, 4, 0, 0],
                },
              }
            : null,
        );
        decData.push(
          !isIncrease
            ? {
                value: Math.abs(delta),
                itemStyle: {
                  color: palette.primaryRed,
                  borderRadius: [4, 4, 0, 0],
                },
              }
            : null,
        );
        totalData.push(null);

        connectorPoints.push({
          index: xLabels.length - 1,
          value: runningValue + (isIncrease ? delta : 0),
        });

        runningValue += delta;
      });
    }

    xLabels.push(`إجمالي ${entry.year}`);
    helperData.push(null);
    incData.push(null);
    decData.push(null);
    totalData.push({
      value: entry.total,
      itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] },
      label: {
        show: true,
        position: "top",
        formatter: fmtShort(entry.total),
        color: palette.primaryBlue,
        fontSize: 10,
        fontWeight: 600,
      },
    });
    connectorPoints.push({ index: xLabels.length - 1, value: entry.total });
    globalRunningValue = entry.total;
  });

  return { xLabels, helperData, incData, decData, totalData, connectorPoints };
}

function buildQuarterSeries(
  periods: WaterfallPeriod[],
  palette: { primaryBlue: string; primaryGreen: string; primaryRed: string },
) {
  if (periods.length === 0)
    return {
      xLabels: [],
      helperData: [],
      incData: [],
      decData: [],
      totalData: [],
      connectorPoints: [],
    };

  const xLabels: string[] = [];
  const helperData: (number | null)[] = [];
  const incData: (BarDataItem | null)[] = [];
  const decData: (BarDataItem | null)[] = [];
  const totalData: (BarDataItem | null)[] = [];
  const connectorPoints: { index: number; value: number }[] = [];

  periods.forEach((p, i) => {
    const qLabel = `${p.year} ${QUARTER_AR[p.quarter] ?? `Q${p.quarter}`}`;

    if (p.previous_transaction_count === null) {
      xLabels.push(qLabel);
      helperData.push(null);
      incData.push(null);
      decData.push(null);
      totalData.push({
        value: p.transaction_count,
        itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: "top",
          formatter: fmtShort(p.transaction_count),
          color: palette.primaryBlue,
          fontSize: 10,
          fontWeight: 600,
        },
      });
      connectorPoints.push({ index: 0, value: p.transaction_count });
      return;
    }

    const delta = p.delta ?? 0;
    const isIncrease = p.change_type === "increase";
    const bridgeLow =
      p.bridge_low ??
      Math.min(p.previous_transaction_count, p.transaction_count);

    xLabels.push(qLabel);
    helperData.push(bridgeLow);
    incData.push(
      isIncrease
        ? {
            value: Math.abs(delta),
            itemStyle: {
              color: palette.primaryGreen,
              borderRadius: [4, 4, 0, 0],
            },
          }
        : null,
    );
    decData.push(
      !isIncrease
        ? {
            value: Math.abs(delta),
            itemStyle: {
              color: palette.primaryRed,
              borderRadius: [4, 4, 0, 0],
            },
          }
        : null,
    );
    totalData.push(null);
    connectorPoints.push({
      index: xLabels.length - 1,
      value: p.transaction_count,
    });

    if (i === periods.length - 1) {
      xLabels.push("إجمالي");
      helperData.push(null);
      incData.push(null);
      decData.push(null);
      totalData.push({
        value: p.transaction_count,
        itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: "top",
          formatter: fmtShort(p.transaction_count),
          color: palette.primaryBlue,
          fontSize: 10,
          fontWeight: 600,
        },
      });
      connectorPoints.push({
        index: xLabels.length - 1,
        value: p.transaction_count,
      });
    }
  });

  return { xLabels, helperData, incData, decData, totalData, connectorPoints };
}

interface MarkLineItem {
  xAxis: number;
  yAxis: number;
}

function buildConnectorMarkLines(
  xLabels: string[],
  helperData: (number | null)[],
  incData: (BarDataItem | null)[],
  decData: (BarDataItem | null)[],
  totalData: (BarDataItem | null)[],
): Array<[MarkLineItem, MarkLineItem]> {
  const lines: Array<[MarkLineItem, MarkLineItem]> = [];

  /** Get the top-of-bar value at index i */
  function getBarTop(i: number): number | null {
    const total = totalData[i];
    if (total && typeof total === "object" && total.value !== null) {
      return total.value;
    }
    const helper = helperData[i];
    if (helper === null) return null;
    const inc = incData[i];
    const dec = decData[i];
    const incVal =
      inc && typeof inc === "object" && inc.value !== null ? inc.value : 0;
    const decVal =
      dec && typeof dec === "object" && dec.value !== null ? dec.value : 0;
    return helper + incVal + decVal;
  }

  for (let i = 0; i < xLabels.length - 1; i++) {
    const currTop = getBarTop(i);
    const nextTop = getBarTop(i + 1);

    // Skip if either is a null/total→total transition with same value
    if (currTop === null || nextTop === null) continue;

    // Skip total→total (they don't need connectors)
    const currIsTotal =
      totalData[i] &&
      typeof totalData[i] === "object" &&
      (totalData[i] as BarDataItem).value !== null;
    const nextIsTotal =
      totalData[i + 1] &&
      typeof totalData[i + 1] === "object" &&
      (totalData[i + 1] as BarDataItem).value !== null;
    if (currIsTotal && nextIsTotal) continue;

    // L-shape: 3 segments
    // 1. Horizontal: from right edge of bar i  →  midpoint between i and i+1
    // 2. Vertical: drop/rise from currTop → nextTop  at midpoint x
    // 3. Horizontal: midpoint → left edge of bar i+1 (at nextTop)
    //
    // ECharts markLine with xAxis as category index uses integer indices.
    // We approximate midpoint using 0.5 offset between indices.
    const midX = i + 0.5;

    // Segment 1: horizontal at currTop from i to midpoint
    lines.push([
      { xAxis: i, yAxis: currTop },
      { xAxis: midX as unknown as number, yAxis: currTop },
    ]);

    // Segment 2: vertical at midpoint from currTop to nextTop
    lines.push([
      { xAxis: midX as unknown as number, yAxis: currTop },
      { xAxis: midX as unknown as number, yAxis: nextTop },
    ]);

    // Segment 3: horizontal at nextTop from midpoint to i+1
    lines.push([
      { xAxis: midX as unknown as number, yAxis: nextTop },
      { xAxis: i + 1, yAxis: nextTop },
    ]);
  }

  return lines;
}

// ─── year range utils ─────────────────────────────────────────────────────────

/** Derive yearFrom / yearTo from the global filter store */
function deriveGlobalYears(
  year: string,
  dateRangeFrom: string | null,
  dateRangeTo: string | null,
): { yearFrom: number; yearTo: number } {
  if (dateRangeFrom && dateRangeTo) {
    return {
      yearFrom: new Date(dateRangeFrom).getFullYear(),
      yearTo: new Date(dateRangeTo).getFullYear(),
    };
  }
  const parsed = parseInt(year, 10);
  if (!isNaN(parsed)) return { yearFrom: parsed, yearTo: parsed };
  return { yearFrom: YEAR_FROM, yearTo: CURRENT_YEAR };
}

/** All years the local dropdowns can offer */
const ALL_YEARS = Array.from(
  { length: CURRENT_YEAR - YEAR_FROM + 1 },
  (_, i) => YEAR_FROM + i,
);

// ─── component ────────────────────────────────────────────────────────────────

export default function TransactionsCountWaterfall() {
  const palette = useResolvedAnalyticsPalette();

  const { activeBranches, region, year, dateRangeFrom, dateRangeTo } =
    useFilterStore();

  const branchIds = activeBranches.length > 0 ? activeBranches : undefined;
  const regionIds = region.length > 0 ? region : undefined;

  // ── global-derived years ─────────────────────────────────────────────────
  const globalYears = useMemo(
    () => deriveGlobalYears(year, dateRangeFrom, dateRangeTo),
    [year, dateRangeFrom, dateRangeTo],
  );

  // ── local year range state ───────────────────────────────────────────────
  // null = "not locally overridden" → follows global
  const [localYearFrom, setLocalYearFrom] = useState<number | null>(null);
  const [localYearTo, setLocalYearTo] = useState<number | null>(null);

  // Track previous global values so we can detect when global changes
  const prevGlobalRef = useRef(globalYears);

  // When global filter changes → silently override local
  useEffect(() => {
    const prev = prevGlobalRef.current;
    const rangeCleared =
      prev.yearFrom !== globalYears.yearFrom ||
      prev.yearTo !== globalYears.yearTo;

    if (rangeCleared) {
      setLocalYearFrom(null);
      setLocalYearTo(null);
      prevGlobalRef.current = globalYears;
    }

    if (!dateRangeFrom || !dateRangeTo) {
      setLocalYearFrom(null);
      setLocalYearTo(null);
    }
  }, [globalYears, dateRangeFrom, dateRangeTo]);

  // ── effective year range (last-applied-wins) ──────────────────────────────
  const effectiveYearFrom = localYearFrom ?? globalYears.yearFrom;
  const effectiveYearTo = localYearTo ?? globalYears.yearTo;

  // Clamp: yearTo can't be less than yearFrom
  const safeYearTo = Math.max(effectiveYearTo, effectiveYearFrom);

  const isSinglePeriod = effectiveYearFrom === safeYearTo;

  // ── local handlers ────────────────────────────────────────────────────────
  const handleLocalYearFrom = (v: string) => {
    const val = Number(v);
    setLocalYearFrom(val);
    // If new "from" > current "to", push "to" forward
    if (val > (localYearTo ?? globalYears.yearTo)) {
      setLocalYearTo(val);
    }
  };

  const handleLocalYearTo = (v: string) => {
    const val = Number(v);
    setLocalYearTo(val);
    // If new "to" < current "from", pull "from" back
    if (val < (localYearFrom ?? globalYears.yearFrom)) {
      setLocalYearFrom(val);
    }
  };

  // ── other local state ─────────────────────────────────────────────────────
  const [period, setPeriod] = useState<"سنوي" | "ربعي">("سنوي");
  const [yearPick, setYearPick] = useState<number>(CURRENT_YEAR);

  // ── queries ───────────────────────────────────────────────────────────────
  const yearQuery = useTransactionsWaterfall(
    {
      granularity: "year",
      yearFrom: effectiveYearFrom,
      yearTo: safeYearTo,
      branchIds,
      regionIds,
    },
    { staleTime: 5 * 60_000 },
  );

  const quarterQuery = useTransactionsWaterfall(
    { granularity: "quarter", years: [yearPick], branchIds, regionIds },
    { enabled: period === "ربعي", staleTime: 5 * 60_000 },
  );

  const availableYears = useMemo<number[]>(() => {
    if (!yearQuery.data || !isWaterfallYearResponse(yearQuery.data)) return [];
    return yearQuery.data.data.map((d) => d.year);
  }, [yearQuery.data]);

  const activeQuery = period === "سنوي" ? yearQuery : quarterQuery;
  const isLoading = activeQuery.isLoading || activeQuery.isFetching;
  const isError = activeQuery.isError;

  // ── series data ───────────────────────────────────────────────────────────
  const {
    xLabels,
    helperData,
    incData,
    decData,
    totalData,
    maxValue,
    chartWidth,
    connectorMarkLines,
  } = useMemo(() => {
    let xLabels: string[] = [];
    let helperData: (number | null)[] = [];
    let incData: (BarDataItem | null)[] = [];
    let decData: (BarDataItem | null)[] = [];
    let totalData: (BarDataItem | null)[] = [];
    let maxValue: number | undefined = undefined;
    let connectorPoints: { index: number; value: number }[] = [];

    if (period === "سنوي") {
      if (yearQuery.data && isWaterfallYearResponse(yearQuery.data)) {
        const built = buildYearSeries(yearQuery.data.data, palette);
        xLabels = built.xLabels;
        helperData = built.helperData;
        incData = built.incData;
        decData = built.decData;
        totalData = built.totalData;
        connectorPoints = built.connectorPoints;
      }
    } else {
      if (quarterQuery.data && isWaterfallQuarterResponse(quarterQuery.data)) {
        maxValue = quarterQuery.data.max_value || undefined;
        const built = buildQuarterSeries(quarterQuery.data.periods, palette);
        xLabels = built.xLabels;
        helperData = built.helperData;
        incData = built.incData;
        decData = built.decData;
        totalData = built.totalData;
        connectorPoints = built.connectorPoints;
      }
    }

    const connectorMarkLines = buildConnectorMarkLines(
      xLabels,
      helperData,
      incData,
      decData,
      totalData,
    );

    const chartWidth =
      xLabels.length <= 1
        ? 0
        : Math.max(MIN_CHART_WIDTH, xLabels.length * PX_PER_BAR);

    return {
      xLabels,
      helperData,
      incData,
      decData,
      totalData,
      maxValue,
      chartWidth,
      connectorMarkLines,
    };
  }, [period, yearQuery.data, quarterQuery.data, palette]);

  // ── ECharts option ────────────────────────────────────────────────────────
  const option = useMemo(() => {
    const hasData = xLabels.length > 0;

    return {
      tooltip: {
        trigger: "axis" as const,
        axisPointer: {
          type: "shadow", 
          shadowStyle: {
            color: "rgba(239, 68, 68, 0.08)", 
          },
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        textStyle: { color: "#1f2937", fontSize: 11, fontFamily: "inherit" },
        formatter: (
          params: Array<{
            seriesName: string;
            data: number | BarDataItem | null;
            axisValueLabel?: string;
          }>,
        ) => {
          const label = params[0]?.axisValueLabel ?? "";
          const totalParam = params.find((p) => p.seriesName === "إجمالي");
          const totalVal =
            totalParam?.data && typeof totalParam.data === "object"
              ? totalParam.data.value
              : typeof totalParam?.data === "number"
                ? totalParam.data
                : null;

          const incParam = params.find((p) => p.seriesName === "ارتفاع");
          const incVal =
            incParam?.data && typeof incParam.data === "object"
              ? (incParam.data.value ?? 0)
              : 0;

          const decParam = params.find((p) => p.seriesName === "انخفاض");
          const decVal =
            decParam?.data && typeof decParam.data === "object"
              ? (decParam.data.value ?? 0)
              : 0;

          if (typeof totalVal === "number") {
            return [
              `<div style="font-size:10px;color:#6b7280;margin-bottom:4px">${label}</div>`,
              `<div style="display:flex;align-items:center;gap:6px">`,
              `<span style="display:inline-block;width:8px;height:8px;background:${palette.primaryBlue};border-radius:2px"></span>`,
              `<span style="font-weight:600">إجمالي المعاملات</span>`,
              `</div>`,
              `<div style="font-size:14px;font-weight:700;color:${palette.primaryBlue};margin-top:2px">${fmt(totalVal)}</div>`,
            ].join("");
          }

          const delta = (Number(incVal) || 0) - (Number(decVal) || 0);
          const color = delta >= 0 ? palette.primaryGreen : palette.primaryRed;
          const sign = delta >= 0 ? "+" : "";
          return [
            `<div style="font-size:10px;color:#6b7280;margin-bottom:4px">${label}</div>`,
            `<div style="display:flex;align-items:center;gap:6px">`,
            `<span style="display:inline-block;width:8px;height:8px;background:${color};border-radius:2px"></span>`,
            `<span style="font-weight:600">التغيير</span>`,
            `</div>`,
            `<div style="font-size:14px;font-weight:700;color:${color};margin-top:2px">${sign}${fmt(delta)}</div>`,
          ].join("");
        },
      },

      legend: {
        data: ["ارتفاع", "انخفاض", "إجمالي"],
        bottom: 8,
        left: "center",
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 24,
        textStyle: { color: "#6b7280", fontSize: 11 },
      },

      grid: { top: 50, bottom: 90, left: 90, right: 50, containLabel: false },

      xAxis: {
        type: "category" as const,
        data: xLabels,
        axisLabel: {
          fontSize: 10,
          color: "#6b7280",
          interval: 0,
          rotate: 45,
          overflow: "truncate" as const,
          width: 90,
          margin: 14,
        },
        axisLine: { lineStyle: { color: "#e5e7eb" } },
        axisTick: { show: false },
      },

      yAxis: {
        type: "value" as const,
        max: maxValue,
        name: "المعاملات",
        nameLocation: "middle" as const,
        nameGap: 60,
        nameTextStyle: { color: "#6b7280", fontSize: 11, fontWeight: 500 },
        axisLabel: {
          fontSize: 10,
          color: "#6b7280",
          formatter: (val: number) => fmtShort(val),
        },
        splitLine: { lineStyle: { color: "#f3f4f6", type: "dashed" as const } },
        axisLine: { show: false },
        axisTick: { show: false },
      },

      series: hasData
        ? [
            {
              name: "helper",
              type: "bar",
              stack: "waterfall",
              data: helperData,
              itemStyle: { color: "transparent", borderColor: "transparent" },
              emphasis: { itemStyle: { color: "transparent" } },
              silent: true,
              tooltip: { show: false },
              barWidth: BAR_WIDTH,
              barGap: "-100%",
            },
            {
              name: "ارتفاع",
              type: "bar",
              stack: "waterfall",
              data: incData,
              itemStyle: {
                color: palette.primaryGreen,
                borderRadius: [3, 3, 0, 0],
              },
              emphasis: { itemStyle: { opacity: 0.9 } },
              barWidth: BAR_WIDTH,
              barGap: "-100%",
              z: 8,
            },
            {
              name: "انخفاض",
              type: "bar",
              stack: "waterfall",
              data: decData,
              itemStyle: {
                color: palette.primaryRed,
                borderRadius: [3, 3, 0, 0],
              },
              emphasis: { itemStyle: { opacity: 0.9 } },
              barWidth: BAR_WIDTH,
              barGap: "-100%",
              z: 8,
            },
            {
              name: "إجمالي",
              type: "bar",
              data: totalData,
              itemStyle: {
                color: palette.primaryBlue,
                borderRadius: [3, 3, 0, 0],
              },
              emphasis: { itemStyle: { opacity: 0.9 } },
              barWidth: BAR_WIDTH,
              barGap: "-100%",
              z: 10,
              label: {
                show: true,
                position: "top" as const,
                color: palette.primaryBlue,
                fontSize: 11,
                fontWeight: 600,
                formatter: (params: { value: BarDataItem | null }) => {
                  if (
                    params.value &&
                    typeof params.value === "object" &&
                    params.value.value !== null
                  ) {
                    return fmtShort(params.value.value);
                  }
                  return "";
                },
              },
            },
            {
              name: "connectors",
              type: "line",
              data: [],
              symbol: "none",
              silent: true,
              tooltip: { show: false },
              z: 3,
              markLine: {
                symbol: "none",
                silent: true,
                animation: false,
                label: { show: false },
                lineStyle: { color: "#C9CED6", width: 1, type: "solid" as const },
                data: connectorMarkLines,
              },
            },
          ]
        : [],
    };
  }, [
    xLabels,
    helperData,
    incData,
    decData,
    totalData,
    maxValue,
    palette,
    connectorMarkLines,
  ]);

  const infoText = useMemo(() => {
    if (xLabels.length === 0) return "";
    if (isSinglePeriod)
      return `عمود الإجمالي (أزرق) = إجمالي الفترة، الجسر يوضح التغييرات (+/-)`;
    return `${xLabels.length} عمود: مرر أفقياً لعرض كل الأعمدة • عمود الإجمالي (أزرق) = إجمالي الفترة`;
  }, [xLabels.length, isSinglePeriod]);

  // ── year dropdown options ─────────────────────────────────────────────────
  const yearFromOptions = ALL_YEARS.map((y) => ({
    value: String(y),
    label: String(y),
  }));
  const yearToOptions = ALL_YEARS.filter((y) => y >= effectiveYearFrom).map(
    (y) => ({
      value: String(y),
      label: String(y),
    }),
  );
  const isDateRangeActive = Boolean(dateRangeFrom && dateRangeTo);

  return (
    <div className="relative">
      <ChartCard
        title="عدد المعاملات حسب السنة/الربع والفرع"
        titleFlag="blue"
        subtitle={infoText}
        height={CHART_HEIGHT}
        width={chartWidth === 0 ? "100%" : chartWidth}
        titleFlagNumber={6}
        delay={2}
        option={option}
        scrollViewportDir="ltr"
        scrollable={!isSinglePeriod && xLabels.length > 15}
        headerExtra={
          <div className="flex flex-wrap items-center justify-start gap-2">
            {/* ── Local year-range pickers: ONLY when global date range is active ── */}
            {isDateRangeActive && (
              <div className="flex items-center gap-1.5">
                <Dropdown
                  icon={Calendar}
                  label="من"
                  value={String(effectiveYearFrom)}
                  options={yearFromOptions}
                  onChange={handleLocalYearFrom}
                  accent="#2563eb"
                  left0={true}
                />
                <span className="text-gray-400 text-xs select-none">—</span>
                <Dropdown
                  icon={Calendar}
                  label="إلى"
                  value={String(safeYearTo)}
                  options={yearToOptions}
                  onChange={handleLocalYearTo}
                  accent="#2563eb"
                  left0={false}
                />
              </div>
            )}

            {/* ── Granularity toggle (only for multi-year) ── */}
            {!isSinglePeriod && (
              <div className="flex items-center gap-1">
                {(["سنوي"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className="px-3 py-1 rounded text-xs font-medium transition-colors"
                    style={{
                      background: period === p ? "#dbeafe" : "#f9fafb",
                      color: period === p ? "#2563eb" : "#6b7280",
                      border: `1px solid ${period === p ? "#93c5fd" : "#e5e7eb"}`,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* ── Quarter year picker ── */}
            {period === "ربعي" && !isSinglePeriod && (
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
                accent="#2563eb"
                left0={true}
              />
            )}
          </div>
        }
      />

      {isLoading && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(4px)",
          }}
        >
          <AnalyticsLoader variant="compact" title="جاري تحميل البيانات" />
        </div>
      )}

      {!isLoading && isError && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(4px)",
          }}
        >
          <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 600 }}>
            تعذر تحميل البيانات
          </p>
        </div>
      )}
    </div>
  );
}
