"use client";

import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useNetSalesProfitChart } from "@/hooks/useSalesAnalyses";
import { useFilterStore } from "@/store/filterStore";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/SkeletonLoader";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  { ssr: false, loading: () => <Skeleton variant="chart" /> }
);

// ─── helpers ────────────────────────────────────────────────────────────────

const normalizeSelections = (values: string[]) =>
  values.filter((v) => v && v !== "all");

const toInt = (s: string): number | undefined => {
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) || s === "" ? undefined : n;
};

// ─── y-axis definitions ──────────────────────────────────────────────────────

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

// Empty chart option — stable reference, prevents stale data flash
const EMPTY_OPTION = {
  xAxis: { type: "category" as const, data: [] },
  yAxis: { type: "value" as const },
  series: [],
};


type LevelType = "year" | "quarter" | "month";
type IndicatorType = "both" | "sales" | "profit";
type QuarterType = 1 | 2 | 3 | 4;


const ARABIC_MONTHS_SHORT = [
  "يناير","فبراير","مارس","إبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
];

const QUARTER_LABELS: Record<QuarterType, string> = {
  1: "الربع الأول",
  2: "الربع الثاني",
  3: "الربع الثالث",
  4: "الربع الرابع",
};

const indicatorButtons: { value: IndicatorType; label: string }[] = [
  { value: "sales",  label: "المبيعات" },
  { value: "profit", label: "الأرباح"  },
  { value: "both",   label: "كلاهما"   },
];

const levelButtons: { value: LevelType; label: string }[] = [
  { value: "year",    label: "سنوي"       },
  { value: "quarter", label: "ربع سنوي"   },
  { value: "month",   label: "شهري"       },
];


interface SubPeriodRowProps {
  level: LevelType;
  selectedQuarters: QuarterType[];
  toggleQuarter: (q: QuarterType) => void;
  selectedMonths: number[];
  toggleMonth: (m: number) => void;
  accentColor: string;
  disabled: boolean;
}

function SubPeriodRow({
  level,
  selectedQuarters,
  toggleQuarter,
  selectedMonths,
  toggleMonth,
  accentColor,
  disabled,
}: SubPeriodRowProps) {
  if (level === "year") return null;

  const getStyle = (active: boolean) => ({
    background: active ? `${accentColor}25` : "var(--bg-elevated)",
    color: active ? accentColor : "var(--text-muted)",
    border: `1px solid ${active ? accentColor : "var(--border-subtle)"}`,
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap" as const,
    transition: "all .15s",
    opacity: disabled ? 0.5 : 1,
  });

  if (level === "quarter") {
    return (
      <div className="flex items-center gap-1 flex-wrap justify-end">
        <span style={{ fontSize: 9, color: "var(--text-muted)" }}>الفترة:</span>
        {([1, 2, 3, 4] as QuarterType[]).map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => toggleQuarter(q)}
            style={getStyle(selectedQuarters.includes(q))}
          >
            {QUARTER_LABELS[q]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap justify-end">
      <span style={{ fontSize: 9, color: "var(--text-muted)" }}>الشهر:</span>
      {ARABIC_MONTHS_SHORT.map((label, idx) => {
        const m = idx + 1;
        return (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => toggleMonth(m)}
            style={getStyle(selectedMonths.includes(m))}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}


function FetchingDots({ color }: { color: string }) {
  return (
    <span
      className="text-[9px] animate-pulse tracking-widest"
      style={{ color, marginInlineStart: 6 }}
      aria-label="جاري التحديث"
    >
      ●●●
    </span>
  );
}


const NetProfitAndSalesByDate = () => {
  const [seriesMode, setSeriesMode]         = useState<IndicatorType>("both");
  const [level, setLevel]                   = useState<LevelType>("year");
  const [selectedQuarters, setSelectedQuarters] = useState<QuarterType[]>([1]);
  const [selectedMonths, setSelectedMonths]     = useState<number[]>([1]);

  const toggleQuarter = (quarter: QuarterType) =>
    setSelectedQuarters((prev) => {
      if (prev.includes(quarter)) return prev.length === 1 ? prev : prev.filter((q) => q !== quarter);
      return [...prev, quarter].sort((a, b) => a - b);
    });

  const toggleMonth = (month: number) =>
    setSelectedMonths((prev) => {
      if (prev.includes(month)) return prev.length === 1 ? prev : prev.filter((m) => m !== month);
      return [...prev, month].sort((a, b) => a - b);
    });

  const handleLevelChange = (newLevel: LevelType) => {
    setLevel(newLevel);
    if (newLevel === "quarter") setSelectedQuarters([1]);
    if (newLevel === "month")   setSelectedMonths([1]);
  };

  const palette = useResolvedAnalyticsPalette();

  const storeYear      = useFilterStore((s) => s.year);
  const storeMonth     = useFilterStore((s) => s.month);
  const region         = useFilterStore((s) => s.region);
  const activeBranches = useFilterStore((s) => s.activeBranches);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory    = useFilterStore((s) => s.subcategory);
  const product        = useFilterStore((s) => s.product);
  const agreement      = useFilterStore((s) => s.agreement);

  const yearNum  = toInt(storeYear);
  const monthNum = toInt(storeMonth);

  const years = useMemo(() => (yearNum !== undefined ? [yearNum] : []), [yearNum]);

  const period = useMemo<number[] | undefined>(() => {
    if (level === "quarter") return selectedQuarters;
    if (level === "month") {
      if (selectedMonths.length === 1 && selectedMonths[0] === 1 && monthNum !== undefined)
        return [monthNum];
      return selectedMonths;
    }
    return undefined;
  }, [level, selectedQuarters, selectedMonths, monthNum]);

  const agreementId = useMemo(
    () => normalizeSelections(agreement)[0] ?? undefined,
    [agreement],
  );

  const enabled =
    years.length > 0 &&
    (level === "year" || (period ?? []).length > 0);

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
      indicator: seriesMode,
    }),
    [level, years, period, region, activeBranches, productCategory, subcategory, product, agreementId, seriesMode],
  );

  const { data, isLoading, isFetching, isError, refetch } = useNetSalesProfitChart(
    chartParams,
    {
      enabled,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  );

  const chartData = data?.data ?? [];

  const getLabel = (point: (typeof chartData)[0]): string => {
    if (level === "month"   && point.month   != null) return ARABIC_MONTHS_SHORT[point.month - 1]   ?? String(point.month);
    if (level === "quarter" && point.quarter != null) return `Q${point.quarter}`;
    return String(point.year);
  };

  const { labels, salesValues, profitValues } = useMemo(() => {
    const sorted = [...chartData].sort((a, b) =>
      (a.period_start ?? "").localeCompare(b.period_start ?? ""),
    );
    return {
      labels:       sorted.map(getLabel),
      salesValues:  sorted.map((p) => p.sales),
      profitValues: sorted.map((p) => p.profit),
    };
  }, [chartData, level]);

  const xAxis = { type: "category" as const, data: labels };

  const salesBarSeries = {
    name: "المبيعات",
    type: "bar" as const,
    data: salesValues.map((v, i) => [i, v]),
    barWidth: 40,
    itemStyle: {
      color: palette.primaryGreen,
      borderRadius: [4, 4, 0, 0] as [number, number, number, number],
    },
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

  const isLoadingOrFetching = isLoading || isFetching;
  const isEmpty = !isLoadingOrFetching && !isError && enabled && chartData.length === 0;

  const option = useMemo(() => {
    // Always clear chart when not ready — no stale data flash
    if (isLoadingOrFetching || isError || isEmpty || !enabled) return EMPTY_OPTION;

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
  }, [labels, salesValues, profitValues, seriesMode, palette, isLoadingOrFetching, isError, isEmpty, enabled]);

  const subtitle = !enabled
  ? "يرجى تحديد سنة صالحة من الفلتر"
  : isError
    ? "تعذر تحميل البيانات"       
    : isEmpty
      ? "لا توجد بيانات للفترة المحددة"
      : "البيانات مرتبطة بالفلاتر العامة";

  // ── button style factory ───────────────────────────────────────────────────
  const btnStyle = (isActive: boolean, accent: string, loading: boolean) => ({
    background: isActive ? `${accent}25` : "var(--bg-elevated)",
    color:      isActive ? accent : "var(--text-muted)",
    border:     `1px solid ${isActive ? accent : "var(--border-subtle)"}`,
    opacity:    loading ? 0.55 : 1,
    cursor:     loading ? "not-allowed" : "pointer",
    transition: "opacity 0.2s, background 0.15s",
  });

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <ChartCard
      title="صافي الأرباح والمبيعات حسب التاريخ"
      subtitle={subtitle}
      titleFlag="green"
      titleFlagNumber={1}
      headerExtra={
        <div className="flex flex-col items-end gap-2" dir="rtl">
          {/* Row 1: indicator | level toggles */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* المؤشر */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] shrink-0" style={{ color: "var(--text-muted)" }}>
                المؤشر:
              </span>
              {indicatorButtons.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  disabled={isLoadingOrFetching}
                  onClick={() => setSeriesMode(value)}
                  className="px-2 py-1 rounded-md text-[10px] font-medium"
                  style={btnStyle(seriesMode === value, palette.primaryCyan, isLoadingOrFetching)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Separator */}
            <span style={{ width: 1, height: 18, background: "var(--border-subtle)", display: "inline-block", flexShrink: 0 }} />

            {/* المستوى */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] shrink-0" style={{ color: "var(--text-muted)" }}>
                المستوى:
              </span>
              {levelButtons.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  disabled={isLoadingOrFetching}
                  onClick={() => handleLevelChange(value)}
                  className="px-2 py-1 rounded-md text-[10px] font-medium"
                  style={btnStyle(level === value, palette.primaryGreen, isLoadingOrFetching)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Live fetching indicator — inline, doesn't shift layout */}
            {isLoadingOrFetching && (
              <FetchingDots color={palette.primaryGreen} />
            )}

            {/* Error retry button — inline with controls */}
            {isError && !isLoadingOrFetching && (
              <button
                type="button"
                onClick={() => refetch()}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-opacity hover:opacity-80"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "var(--accent-red)",
                }}
              >
                ↻ إعادة المحاولة
              </button>
            )}
          </div>

          {/* Row 2: sub-period buttons */}
          <SubPeriodRow
            level={level}
            selectedQuarters={selectedQuarters}
            toggleQuarter={toggleQuarter}
            selectedMonths={selectedMonths}
            toggleMonth={toggleMonth}
            accentColor={palette.primaryGreen}
            disabled={isLoadingOrFetching}
          />
        </div>
      }
      option={option}
      height="300px"
    />
  );
};

export default NetProfitAndSalesByDate;