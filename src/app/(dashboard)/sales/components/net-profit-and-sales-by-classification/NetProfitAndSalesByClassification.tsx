"use client";

import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useSalesProfitByCategory } from "@/hooks/useSalesAnalyses";
import type { CategoryRow, SalesProfitByCategoryResponse } from "@/api/sales-analyses";
import { useFilterStore } from "@/store/filterStore";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/SkeletonLoader";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  { ssr: false, loading: () => <Skeleton variant="chart" /> },
);


const normalizeSelections = (values: string[]) =>
  values.filter((v) => v && v !== "all");

const toInt = (s: string): number | undefined => {
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) || s === "" ? undefined : n;
};


const GROUP_OPTIONS = [
  { value: 1, label: "المجموعة الأولى" },
  { value: 2, label: "المجموعة الثانية" },
  { value: 3, label: "المجموعة الثالثة" },
] as const;

type GroupLevel = (typeof GROUP_OPTIONS)[number]["value"];

const EMPTY_OPTION = {
  xAxis: { type: "category" as const, data: [] },
  yAxis: [
    { type: "value" as const, name: "الكمية" },
    { type: "value" as const, name: "د.أ" },
  ],
  series: [],
};

const CHART_LEGEND = {
  data: ["الكمية المباعة", "قيمة البيع", "الأرباح"],
  bottom: 18,
  left: "center" as const,
  textStyle: { color: "#94a3b8", fontSize: 11 },
};

const CHART_GRID = {
  left: "4%",
  right: "5%",
  top: "14%",
  bottom: "22%",
  containLabel: true,
};

const CHART_Y_AXIS = [
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
    axisLabel: { formatter: (v: number) => `${(v / 1_000_000).toFixed(1)}M` },
    nameLocation: "end" as const,
    nameGap: 12,
  },
];

const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];


interface GroupSelectorProps {
  value: GroupLevel;
  onChange: (v: GroupLevel) => void;
  disabled: boolean;
}

function GroupSelector({ value, onChange, disabled }: GroupSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      <span
        className="text-[10px] shrink-0 select-none"
        style={{ color: "var(--text-muted)" }}
        id="group-label"
      >
        التصنيف:
      </span>

      <div
        role="radiogroup"
        aria-labelledby="group-label"
        className="flex items-center gap-1 flex-wrap"
        onKeyDown={(e) => {
          const idx = GROUP_OPTIONS.findIndex((o) => o.value === value);
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(GROUP_OPTIONS[(idx + 1) % GROUP_OPTIONS.length].value);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(
              GROUP_OPTIONS[(idx - 1 + GROUP_OPTIONS.length) % GROUP_OPTIONS.length].value,
            );
          }
        }}
      >
        {GROUP_OPTIONS.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              tabIndex={isActive ? 0 : -1}
              className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
              style={{
                background: isActive
                  ? "var(--accent-green-dim)"
                  : "var(--bg-elevated)",
                color: isActive ? "var(--accent-green)" : "var(--text-muted)",
                border: `1px solid ${isActive ? "var(--accent-green)" : "var(--border-subtle)"}`,
                outlineColor: "var(--accent-green)",
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {disabled && (
        <span
          aria-hidden
          className="text-[9px] animate-pulse ml-1"
          style={{ color: "var(--accent-green)" }}
        >
          ● ● ●
        </span>
      )}
    </div>
  );
}


const NetProfitAndSalesByClassification = () => {
  const palette = useResolvedAnalyticsPalette();
  const [groupLevel, setGroupLevel] = useState<GroupLevel>(2);

  const storeYear       = useFilterStore((s) => s.year);
  const storeQuarter    = useFilterStore((s) => s.quarter);
  const storeMonth      = useFilterStore((s) => s.month);
  const region          = useFilterStore((s) => s.region);
  const activeBranches  = useFilterStore((s) => s.activeBranches);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory     = useFilterStore((s) => s.subcategory);
  const product         = useFilterStore((s) => s.product);
  const agreement       = useFilterStore((s) => s.agreement);

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
    () => normalizeSelections(agreement)[0] ?? undefined,
    [agreement],
  );

  const enabled = years.length > 0 && (level === "year" || period !== undefined);

  const queryParams = useMemo(
    () => ({
      groupLevel,
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

  const chartData: CategoryRow[] = (data as SalesProfitByCategoryResponse | undefined)?.data ?? [];

  const { labels, quantities, revenues, profits } = useMemo(() => {
    const slice = chartData.slice(0, 10);
    return {
      labels:     slice.map((r) => r.name.split(" ").slice(0, 2).join(" ")),
      quantities: slice.map((r) => r.quantity_sold),
      revenues:   slice.map((r) => r.sales),
      profits:    slice.map((r) => r.profit),
    };
  }, [chartData]);

  // ── series ────────────────────────────────────────────────────────────────
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
          borderRadius: BAR_RADIUS,
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
          borderRadius: BAR_RADIUS,
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
      yAxis: CHART_Y_AXIS,
      series,
      legend: CHART_LEGEND,
      grid: CHART_GRID,
    }),
    [labels, series],
  );

  // ── status helpers ────────────────────────────────────────────────────────
  const isBusy  = isLoading || isFetching;
  const isEmpty = !isBusy && !isError && chartData.length === 0;
  const showChart = enabled && !isBusy && !isError && !isEmpty;

  const subtitle = !enabled
    ? "يرجى تحديد سنة صالحة من الفلتر"
    : isBusy
      ? "جاري تحميل البيانات…"
      : isError
        ? "تعذر تحميل بيانات التصنيف"
        : isEmpty
          ? "لا توجد بيانات للفترة المحددة"
          : "مقارنة حسب التصنيف المختار";

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <ChartCard
      title="صافي الأرباح والمبيعات حسب التصنيف"
      subtitle={subtitle}
      titleFlag="green"
      titleFlagNumber={2}
      headerExtra={
        <GroupSelector
          value={groupLevel}
          onChange={setGroupLevel}
          disabled={isBusy}
        />
      }
      option={showChart ? option : EMPTY_OPTION}
      height="340px"
      delay={2}
    />
  );
};

export default NetProfitAndSalesByClassification;