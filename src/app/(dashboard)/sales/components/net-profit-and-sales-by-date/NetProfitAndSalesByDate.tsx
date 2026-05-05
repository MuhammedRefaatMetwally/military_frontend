"use client";

import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useNetSalesProfitChart } from "@/hooks/useSalesAnalyses";
import { useFilterStore } from "@/store/filterStore";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/SkeletonLoader";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  { ssr: false, loading: () => <Skeleton variant="chart" /> },
);

// ─── helpers ────────────────────────────────────────────────────────────────

const normalizeSelections = (values: string[]) =>
  values.filter((v) => v && v !== "all");

/** Parse a numeric string; returns undefined when invalid / empty */
const toInt = (s: string): number | undefined => {
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) || s === "" ? undefined : n;
};

// ─── y-axis definitions (stable references) ─────────────────────────────────

const salesYAxis = {
  type: "value" as const,
  name: "المبيعات",
  position: "left" as const,
  min: 0,
  axisLine: { show: true, onZero: false },
  axisTick: { show: true },
  splitLine: { show: true },
  axisLabel: { formatter: (v: number) => `${(v / 1_000_000).toFixed(1)}M` },
  nameLocation: "end" as const,
  nameGap: 12,
  gridIndex: 0,
};

const profitYAxis = {
  type: "value" as const,
  name: "الأرباح",
  position: "right" as const,
  min: 0,
  axisLine: { show: true, onZero: false },
  axisTick: { show: true },
  splitLine: { show: false },
  axisLabel: { formatter: (v: number) => `${(v / 1_000_000).toFixed(1)}M` },
  nameLocation: "end" as const,
  nameGap: 12,
  gridIndex: 0,
};

const drillGrid = {
  left: "5%" as const,
  right: "6%" as const,
  top: "14%",
  bottom: "18%",
  containLabel: true,
};

// ─── component ───────────────────────────────────────────────────────────────

const NetProfitAndSalesByDate = () => {
  const [seriesMode, setSeriesMode] = useState<"both" | "sales" | "profit">(
    "both",
  );
  const palette = useResolvedAnalyticsPalette();

  // ── read filter store ──────────────────────────────────────────────────────
  const storeYear = useFilterStore((s) => s.year);
  const storeQuarter = useFilterStore((s) => s.quarter);
  const storeMonth = useFilterStore((s) => s.month);
  const region = useFilterStore((s) => s.region);
  const activeBranches = useFilterStore((s) => s.activeBranches);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory = useFilterStore((s) => s.subcategory);
  const product = useFilterStore((s) => s.product);
  const agreement = useFilterStore((s) => s.agreement);

  // ── derive API-level params from the date filter ───────────────────────────
  //
  //  The GlobalFilterBar writes to filterStore:
  //    year    → "2024"  (always present when a date is selected)
  //    quarter → "1".."4" | ""
  //    month   → "01".."12" | ""
  //    day     → "01".."31" | ""   (API doesn't support day → treat as month)
  //
  //  Priority: month (or day) → quarter → year
  //
  const yearNum = toInt(storeYear);
  const monthNum = toInt(storeMonth);
  const quarterNum = toInt(storeQuarter);

  /**
   * level:  "month"   when a month (or day) is selected
   *         "quarter" when only a quarter is selected
   *         "year"    otherwise
   */
  const level: "year" | "quarter" | "month" = useMemo(() => {
    if (monthNum !== undefined) return "month";
    if (quarterNum !== undefined) return "quarter";
    return "year";
  }, [monthNum, quarterNum]);

  /**
   * years: always an array of the selected year (or empty → skip query)
   */
  const years = useMemo(
    () => (yearNum !== undefined ? [yearNum] : []),
    [yearNum],
  );

  /**
   * period:
   *   level=month   → [monthNum]         (required)
   *   level=quarter → [quarterNum]        (optional but sent when available)
   *   level=year    → undefined           (not applicable)
   */
  const period = useMemo<number[] | undefined>(() => {
    if (level === "month" && monthNum !== undefined) return [monthNum];
    if (level === "quarter" && quarterNum !== undefined) return [quarterNum];
    return undefined;
  }, [level, monthNum, quarterNum]);

  /**
   * agreementId: first real value from the agreement array (no hardcoded fallback)
   */
  const agreementId = useMemo(
    () => normalizeSelections(agreement)[0],
    [agreement],
  );

  // ── query enabled guard ────────────────────────────────────────────────────
  // Must have at least a valid year; month level also requires period.
  const enabled =
    years.length > 0 &&
    (level !== "month" || period !== undefined);

  // ── build params (stable object for react-query key) ──────────────────────
  const chartParams = useMemo(
    () => ({
      level,
      years,
      period,
      regionIds: normalizeSelections(region),
      branchIds: normalizeSelections(activeBranches),
      group1Ids: normalizeSelections(productCategory),
      group2Ids: normalizeSelections(subcategory),
      group3Ids: normalizeSelections(product),
      agreementId,
      indicator: seriesMode, // "both" | "sales" | "profit"
    }),
    [
      level,
      years,
      period,
      region,
      activeBranches,
      productCategory,
      subcategory,
      product,
      agreementId,
      seriesMode,
    ],
  );

  // ── fetch ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, isError } = useNetSalesProfitChart(
    chartParams,
    {
      enabled,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  );

  // ── derive chart data ──────────────────────────────────────────────────────
  const chartData = data?.data ?? [];

  /**
   * x-axis labels depend on the level:
   *   year    → "2022", "2023" …
   *   quarter → "Q1", "Q2" …
   *   month   → "يناير", "فبراير" …
   */
  const ARABIC_MONTHS = [
    "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ];

  const getLabel = (point: (typeof chartData)[0]): string => {
    if (level === "month" && "month" in point)
      return ARABIC_MONTHS[((point as { month: number }).month ?? 1) - 1] ?? String((point as { month: number }).month);
    if (level === "quarter" && "quarter" in point)
      return `Q${(point as { quarter: number }).quarter}`;
    return String(point.year);
  };

  const { labels, salesValues, profitValues } = useMemo(() => {
    const sorted = [...chartData].sort((a, b) => {
      // sort by year first, then by quarter/month if present
      if (a.year !== b.year) return a.year - b.year;
      const aQ = "quarter" in a ? (a as { quarter: number }).quarter : 0;
      const bQ = "quarter" in b ? (b as { quarter: number }).quarter : 0;
      if (aQ !== bQ) return aQ - bQ;
      const aM = "month" in a ? (a as { month: number }).month : 0;
      const bM = "month" in b ? (b as { month: number }).month : 0;
      return aM - bM;
    });
    return {
      labels: sorted.map(getLabel),
      salesValues: sorted.map((p) => p.sales),
      profitValues: sorted.map((p) => p.profit),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, level]);

  // ── series definitions ─────────────────────────────────────────────────────
  const xAxis = { type: "category" as const, data: labels };

  const salesBarSeries = {
    name: "المبيعات",
    type: "bar" as const,
    data: salesValues.map((v, i) => [i, v]),
    barWidth: 40,
    itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] as [number, number, number, number] },
    yAxisIndex: 0,
  };

  const profitLineSeries = {
    name: "الأرباح",
    type: "line" as const,
    data: profitValues.map((v, i) => [i, v]),
    yAxisIndex: seriesMode === "both" ? 1 : 0,
    lineStyle: { color: palette.primaryCyan, width: 2.5 },
    itemStyle: { color: palette.primaryCyan, borderWidth: 2 },
    symbol: "circle" as const,
    symbolSize: 8,
    smooth: true,
    areaStyle: { color: "rgba(8,145,178,0.08)" },
  };

  const legend = (names: string[]) => ({
    data: names,
    bottom: 0,
    left: "center" as const,
    itemGap: 12,
    textStyle: { color: "#94a3b8", fontSize: 11 },
  });

  const option = useMemo(() => {
    if (seriesMode === "sales")
      return {
        xAxis,
        yAxis: salesYAxis,
        series: [salesBarSeries],
        legend: legend(["المبيعات"]),
        grid: drillGrid,
      };
    if (seriesMode === "profit")
      return {
        xAxis,
        yAxis: { ...profitYAxis, position: "left" as const },
        series: [{ ...profitLineSeries, yAxisIndex: 0 }],
        legend: legend(["الأرباح"]),
        grid: drillGrid,
      };
    return {
      xAxis,
      yAxis: [salesYAxis, profitYAxis],
      series: [salesBarSeries, profitLineSeries],
      legend: legend(["المبيعات", "الأرباح"]),
      grid: drillGrid,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels, salesValues, profitValues, seriesMode, palette]);

  // ── subtitle ───────────────────────────────────────────────────────────────
  const subtitle = !enabled
    ? "يرجى تحديد سنة صالحة من الفلتر"
    : isLoading || isFetching
      ? "جاري تحميل البيانات..."
      : isError
        ? "تعذر تحميل بيانات المبيعات والأرباح"
        : "البيانات مرتبطة بالفلاتر العامة (السنة، الإقليم، الفروع، المجموعات، الاتفاقية)";

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <ChartCard
      title="صافي الأرباح والمبيعات حسب التاريخ"
      subtitle={subtitle}
      titleFlag="green"
      titleFlagNumber={1}
      headerExtra={
        <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
          <div className="flex items-center gap-0.5 flex-wrap justify-end">
            <span
              className="text-[9px] shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              المؤشر:
            </span>
            {(
              [
                ["sales", "المبيعات"],
                ["profit", "الأرباح"],
                ["both", "كلاهما"],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSeriesMode(mode)}
                className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
                style={{
                  background:
                    seriesMode === mode
                      ? "rgba(14,165,233,0.15)"
                      : "var(--bg-elevated)",
                  color:
                    seriesMode === mode
                      ? palette.primaryCyan
                      : "var(--text-muted)",
                  border: `1px solid ${seriesMode === mode ? palette.primaryCyan : "var(--border-subtle)"}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      }
      option={option}
      height="300px"
    />
  );
};

export default NetProfitAndSalesByDate;