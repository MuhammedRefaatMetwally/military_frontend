"use client";

import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useSalesProfitByCategory } from "@/hooks/useSalesAnalyses";
import { useFilterStore } from "@/store/filterStore";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/SkeletonLoader";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <Skeleton variant="chart" />,
  },
);

// ─── helpers ─────────────────────────────────────────────────────────────────

const normalizeSelections = (values: string[]) =>
  values.filter((v) => v && v !== "all");

const toInt = (s: string): number | undefined => {
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) || s === "" ? undefined : n;
};

// ─── constants ────────────────────────────────────────────────────────────────

const classificationOptions = [
  { value: 1, label: "المجموعة الأولى" },
  { value: 2, label: "المجموعة الثانية" },
  { value: 3, label: "المجموعة الثالثة" },
] as const;

type GroupLevel = (typeof classificationOptions)[number]["value"];

// ─── API response row type ────────────────────────────────────────────────────

interface CategoryRow {
  id: number;
  code: string;
  name: string;
  quantity_sold: number;
  sales: number;
  profit: number;
}

// ─── chart constants (stable references outside component) ────────────────────

const EMPTY_OPTION = {
  xAxis: { type: "category" as const, data: [] },
  yAxis: [
    { type: "value" as const, name: "الكمية" },
    { type: "value" as const, name: "د.أ" },
  ],
  series: [],
};

const legend = {
  data: ["الكمية المباعة", "قيمة البيع", "الأرباح"],
  bottom: 18,
  left: "center" as const,
  textStyle: { color: "#94a3b8", fontSize: 11 },
};

const grid = {
  left: "4%",
  right: "5%",
  top: "14%",
  bottom: "22%",
  containLabel: true,
};

const yAxis = [
  {
    type: "value" as const,
    name: "الكمية",
    position: "left" as const,
    axisLine: { show: true, onZero: false },
    axisTick: { show: true },
    splitLine: { show: true },
    axisLabel: { formatter: (v: number) => `${(v / 1_000).toFixed(0)}K` },
    nameLocation: "end" as const,
    nameGap: 12,
  },
  {
    type: "value" as const,
    name: "د.أ",
    position: "right" as const,
    axisLine: { show: true, onZero: false },
    axisTick: { show: true },
    splitLine: { show: false },
    // Sales values are in millions — format accordingly
    axisLabel: { formatter: (v: number) => `${(v / 1_000_000).toFixed(1)}M` },
    nameLocation: "end" as const,
    nameGap: 12,
  },
];

// ─── component ────────────────────────────────────────────────────────────────

const NetProfitAndSalesByClassification = () => {
  const palette = useResolvedAnalyticsPalette();
  const [groupLevel, setGroupLevel] = useState<GroupLevel>(2);

  // ── filter store ───────────────────────────────────────────────────────────
  const storeYear       = useFilterStore((s) => s.year);
  const storeQuarter    = useFilterStore((s) => s.quarter);
  const storeMonth      = useFilterStore((s) => s.month);
  const region          = useFilterStore((s) => s.region);
  const activeBranches  = useFilterStore((s) => s.activeBranches);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory     = useFilterStore((s) => s.subcategory);
  const product         = useFilterStore((s) => s.product);
  const agreement       = useFilterStore((s) => s.agreement);

  // ── derive level / years / period ─────────────────────────────────────────
  const yearNum    = toInt(storeYear);
  const monthNum   = toInt(storeMonth);
  const quarterNum = toInt(storeQuarter);

  const level = useMemo<"year" | "quarter" | "month">(() => {
    if (monthNum   !== undefined) return "month";
    if (quarterNum !== undefined) return "quarter";
    return "year";
  }, [monthNum, quarterNum]);

  const years = useMemo(
    () => (yearNum !== undefined ? [yearNum] : []),
    [yearNum],
  );

  const period = useMemo<number[] | undefined>(() => {
    if (level === "month"   && monthNum   !== undefined) return [monthNum];
    if (level === "quarter" && quarterNum !== undefined) return [quarterNum];
    return undefined;
  }, [level, monthNum, quarterNum]);

  const agreementId = useMemo(
    () => normalizeSelections(agreement)[0],
    [agreement],
  );

  const enabled =
    years.length > 0 && (level !== "month" || period !== undefined);

  // ── query params ───────────────────────────────────────────────────────────
  const queryParams = useMemo(
    () => ({
      groupLevel,   // number: 1 | 2 | 3  →  API param: group_level=1
      level,
      years,
      period,
      regionIds:  normalizeSelections(region),
      branchIds:  normalizeSelections(activeBranches),
      group1Ids:  normalizeSelections(productCategory),
      group2Ids:  normalizeSelections(subcategory),
      group3Ids:  normalizeSelections(product),
      agreementId,
    }),
    [
      groupLevel, level, years, period,
      region, activeBranches, productCategory,
      subcategory, product, agreementId,
    ],
  );

  const { data, isLoading, isFetching, isError } = useSalesProfitByCategory(
    queryParams,
    {
      enabled,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  );

  // ── process response ───────────────────────────────────────────────────────
  // Real API fields confirmed: name | quantity_sold | sales | profit
  const chartData = (data?.data ?? []) as CategoryRow[];

  const { labels, quantities, revenues, profits } = useMemo(() => {
    const slice = chartData.slice(0, 10);
    return {
      labels:     slice.map((r) => r.name.split(" ").slice(0, 2).join(" ")),
      quantities: slice.map((r) => r.quantity_sold),
      revenues:   slice.map((r) => r.sales),
      profits:    slice.map((r) => r.profit),
    };
  }, [chartData]);

  // ── series ─────────────────────────────────────────────────────────────────
  const series = useMemo(
    () => [
      {
        name: "الكمية المباعة",
        type: "bar" as const,
        data: quantities,
        yAxisIndex: 0,
        barWidth: 14,
        barGap: "12%",
        itemStyle: {
          color: palette.primaryBlue,
          borderRadius: [4, 4, 0, 0] as [number, number, number, number],
        },
      },
      {
        name: "قيمة البيع",
        type: "bar" as const,
        data: revenues,
        yAxisIndex: 1,
        barWidth: 14,
        barGap: "12%",
        itemStyle: {
          color: palette.primaryGreen,
          borderRadius: [4, 4, 0, 0] as [number, number, number, number],
        },
      },
      {
        name: "الأرباح",
        type: "line" as const,
        data: profits,
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { color: palette.primaryCyan, width: 2.5 },
        itemStyle: { color: palette.primaryCyan, borderWidth: 2 },
        symbol: "circle" as const,
        symbolSize: 7,
        areaStyle: { color: "rgba(8,145,178,0.07)" },
      },
    ],
    [quantities, revenues, profits, palette],
  );

  const option = useMemo(
    () => ({
      xAxis: {
        type: "category" as const,
        data: labels,
        axisLabel: { rotate: 35, fontSize: 10 },
      },
      yAxis,
      series,
      legend,
      grid,
    }),
    [labels, series],
  );

  // ── states ─────────────────────────────────────────────────────────────────
  const isLoadingOrFetching = isLoading || isFetching;
  const isEmpty = !isLoadingOrFetching && !isError && chartData.length === 0;

  const subtitle = !enabled
    ? "يرجى تحديد سنة صالحة من الفلتر"
    : isLoadingOrFetching
      ? "جاري تحميل البيانات..."
      : isError
        ? "تعذر تحميل بيانات التصنيف"
        : isEmpty
          ? "لا توجد بيانات للفترة المحددة"
          : "مقارنة حسب التصنيف المختار";

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <ChartCard
      title="صافي الأرباح والمبيعات حسب التصنيف"
      subtitle={subtitle}
      titleFlag="green"
      titleFlagNumber={2}
      headerExtra={
        <div className="flex items-center gap-0.5 flex-wrap justify-end">
          <span
            className="text-[9px] shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            التصنيف:
          </span>

          <div
            className="flex items-center gap-0.5 flex-wrap"
            role="radiogroup"
            aria-label="التصنيف"
          >
            {classificationOptions.map((opt) => {
              const isActive = groupLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  disabled={isLoadingOrFetching}
                  onClick={() => setGroupLevel(opt.value)}
                  className="px-2 py-1 rounded-md text-[10px] font-medium transition-all"
                  style={{
                    background: isActive
                      ? "var(--accent-green-dim)"
                      : "var(--bg-elevated)",
                    color: isActive
                      ? "var(--accent-green)"
                      : "var(--text-muted)",
                    border: `1px solid ${isActive ? "var(--accent-green)" : "var(--border-subtle)"}`,
                    opacity: isLoadingOrFetching ? 0.55 : 1,
                    cursor: isLoadingOrFetching ? "not-allowed" : "pointer",
                    transition: "opacity 0.2s, background 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Subtle inline fetch indicator */}
          {isLoadingOrFetching && (
            <span
              className="text-[9px] animate-pulse"
              style={{ color: "var(--accent-green)", marginInlineStart: 4 }}
            >
              ●●●
            </span>
          )}
        </div>
      }
      // Clear chart while loading / errored / empty — no stale data flash
      option={isLoadingOrFetching || isError || isEmpty ? EMPTY_OPTION : option}
      height="340px"
      delay={2}
    />
  );
};

export default NetProfitAndSalesByClassification;