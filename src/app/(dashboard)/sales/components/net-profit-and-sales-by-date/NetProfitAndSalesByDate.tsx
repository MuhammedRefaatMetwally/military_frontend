"use client";

import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useNetSalesProfitChart } from "@/hooks/useSalesAnalyses";
import { useFilterStore } from "@/store/filterStore";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { AnalyticsLoader } from "@/components/ui/analytics-loader";

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

// ─── Quarter → months mapping ────────────────────────────────────────────────

const QUARTER_MONTHS: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
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

// ─── types ───────────────────────────────────────────────────────────────────

type LevelType = "year" | "quarter" | "month";
type IndicatorType = "both" | "sales" | "profit";
type QuarterType = 1 | 2 | 3 | 4;

// ─── constants ───────────────────────────────────────────────────────────────

const ARABIC_MONTHS_SHORT = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const QUARTER_LABELS: Record<QuarterType, string> = {
  1: "الربع الأول",
  2: "الربع الثاني",
  3: "الربع الثالث",
  4: "الربع الرابع",
};

const QUARTER_SHORT: Record<QuarterType, string> = {
  1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4",
};

const indicatorButtons: { value: IndicatorType; label: string }[] = [
  { value: "sales",  label: "المبيعات" },
  { value: "profit", label: "الأرباح" },
  { value: "both",   label: "كلاهما" },
];

const levelButtons: { value: LevelType; label: string }[] = [
  { value: "year",    label: "سنوي" },
  { value: "quarter", label: "ربع سنوي" },
  { value: "month",   label: "شهري" },
];

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

interface BreadcrumbProps {
  level: LevelType;
  drillYear: number | null;
  drillQuarter: QuarterType | null;
  onNavigate: (level: LevelType) => void;
  accentColor: string;
}

function Breadcrumb({ level, drillYear, drillQuarter, onNavigate, accentColor }: BreadcrumbProps) {
  // Only show when drilled down
  if (level === "year") return null;

  const crumbs: { label: string; level: LevelType }[] = [
    { label: "سنوي", level: "year" },
  ];

  if (drillYear !== null) {
    crumbs.push({ label: String(drillYear), level: "quarter" });
  }

  if (level === "month" && drillQuarter !== null) {
    crumbs.push({ label: QUARTER_SHORT[drillQuarter], level: "month" });
  }

  return (
    <div
      className="flex items-center gap-1"
      dir="ltr"
      style={{
        padding: "3px 8px",
        borderRadius: 6,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        fontSize: 10,
      }}
    >
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={crumb.level} className="flex items-center gap-1">
            {idx > 0 && (
              <span style={{ color: "var(--text-muted)", fontSize: 9, opacity: 0.6 }}>›</span>
            )}
            <button
              type="button"
              onClick={() => !isLast && onNavigate(crumb.level)}
              style={{
                color: isLast ? accentColor : "var(--text-muted)",
                fontWeight: isLast ? 600 : 400,
                cursor: isLast ? "default" : "pointer",
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 10,
                transition: "color .15s",
              }}
              className={!isLast ? "hover:opacity-80" : ""}
            >
              {crumb.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}

// ─── SubPeriodRow ─────────────────────────────────────────────────────────────

interface SubPeriodRowProps {
  level: LevelType;
  selectedQuarters: QuarterType[];
  toggleQuarter: (q: QuarterType) => void;
  selectedMonths: number[];
  toggleMonth: (m: number) => void;
  accentColor: string;
  disabled: boolean;
  drillYear: number | null;   // hide sub-period row when drill is active (drill manages period)
  drillQuarter: QuarterType | null;
}

function SubPeriodRow({
  level,
  selectedQuarters,
  toggleQuarter,
  selectedMonths,
  toggleMonth,
  accentColor,
  disabled,
  drillYear,
  drillQuarter,
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

// ─── FetchingDots ─────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const NetProfitAndSalesByDate = () => {
  const [seriesMode, setSeriesMode] = useState<IndicatorType>("both");
  const [level, setLevel] = useState<LevelType>("year");

  // Manual filter-button selections (used when NOT in drill mode)
  const [selectedQuarters, setSelectedQuarters] = useState<QuarterType[]>([1]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([1]);

  // Drill state — null means no active drill at that depth
  const [drillYear, setDrillYear] = useState<number | null>(null);
  const [drillQuarter, setDrillQuarter] = useState<QuarterType | null>(null);

  // ── toggle helpers (manual filter buttons) ────────────────────────────────

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

  // ── level button handler — resets drill state ─────────────────────────────

  const handleLevelChange = (newLevel: LevelType) => {
    setLevel(newLevel);
    setDrillYear(null);
    setDrillQuarter(null);
    if (newLevel === "quarter") setSelectedQuarters([1, 2, 3, 4]); // show all quarters by default
    if (newLevel === "month")   setSelectedMonths([1]);
  };

  // ── breadcrumb navigation ─────────────────────────────────────────────────

  const handleBreadcrumbNavigate = useCallback((targetLevel: LevelType) => {
    if (targetLevel === "year") {
      setLevel("year");
      setDrillYear(null);
      setDrillQuarter(null);
    } else if (targetLevel === "quarter") {
      setLevel("quarter");
      setDrillQuarter(null);
      // drillYear stays — we're still scoped to that year
    }
  }, []);

  // ── chart click handler ───────────────────────────────────────────────────

  const handleChartClick = useCallback(
    (params: { dataIndex: number; name: string }) => {
      if (level === "year") {
        const clickedYear = toInt(params.name);
        if (clickedYear === undefined) return;
        setDrillYear(clickedYear);
        setDrillQuarter(null);
        setSelectedQuarters([1, 2, 3, 4]); // ← show all 4 quarters selected
        setLevel("quarter");
      } else if (level === "quarter") {
        const match = params.name.match(/^Q(\d)$/);
        if (!match) return;
        const q = Number.parseInt(match[1], 10) as QuarterType;
        setDrillQuarter(q);
        const monthsForQuarter = QUARTER_MONTHS[q]; // ← pre-select that quarter's months
        setSelectedMonths(monthsForQuarter);
        setLevel("month");
      }
    },
    [level],
  );

  // ── palette & global filters ──────────────────────────────────────────────

  const palette = useResolvedAnalyticsPalette();

  const storeYear      = useFilterStore((s) => s.year);
  const storeMonth     = useFilterStore((s) => s.month);
  const region         = useFilterStore((s) => s.region);
  const activeBranches = useFilterStore((s) => s.activeBranches);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory    = useFilterStore((s) => s.subcategory);
  const product        = useFilterStore((s) => s.product);
  const agreement      = useFilterStore((s) => s.agreement);

  const storeYearNum = toInt(storeYear);
  const monthNum     = toInt(storeMonth);

  // ── years array: if drilled, lock to drillYear ────────────────────────────

  const years = useMemo(() => {
    if (drillYear !== null) return [drillYear];
    return storeYearNum !== undefined ? [storeYearNum] : [];
  }, [drillYear, storeYearNum]);

  // ── period array ──────────────────────────────────────────────────────────

  const period = useMemo<number[] | undefined>(() => {
    if (level === "year") return undefined;

    if (level === "quarter") {
      // If drill is active, show all 4 quarters; otherwise use manual selection
      return drillYear !== null ? [1, 2, 3, 4] : selectedQuarters;
    }

    if (level === "month") {
      // If drilled from a quarter, show only that quarter's 3 months
      if (drillQuarter !== null) return QUARTER_MONTHS[drillQuarter];
      // Manual month selection fallback
      if (selectedMonths.length === 1 && selectedMonths[0] === 1 && monthNum !== undefined)
        return [monthNum];
      return selectedMonths;
    }

    return undefined;
  }, [level, drillYear, drillQuarter, selectedQuarters, selectedMonths, monthNum]);

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

  // ── label builder ─────────────────────────────────────────────────────────

  const getLabel = (point: (typeof chartData)[0]): string => {
    if (level === "month"   && point.month   != null) return ARABIC_MONTHS_SHORT[point.month - 1] ?? String(point.month);
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

  // ── drill cursor hint on bars ─────────────────────────────────────────────

  // Add a subtle visual cue that year/quarter bars are clickable
  const isDrillable = level === "year" || level === "quarter";

  const xAxis = {
    type: "category" as const,
    data: labels,
    // Show pointer cursor on drillable levels via triggerEvent
    triggerEvent: isDrillable,
    axisLabel: {
      color: isDrillable ? palette.primaryGreen : "#94a3b8",
      fontSize: 11,
    },
  };

  const salesBarSeries = {
    name: "المبيعات",
    type: "bar" as const,
    data: salesValues.map((v, i) => [i, v]),
    barWidth: 40,
    cursor: isDrillable ? "pointer" : "default",
    itemStyle: {
      color: palette.primaryGreen,
      borderRadius: [4, 4, 0, 0] as [number, number, number, number],
    },
    // Subtle hover emphasis to signal drillability
    emphasis: isDrillable
      ? {
          itemStyle: {
            color: palette.primaryGreen,
            opacity: 0.75,
            shadowBlur: 8,
            shadowColor: `${palette.primaryGreen}50`,
          },
        }
      : undefined,
    yAxisIndex: 0,
  };

  const profitLineSeries = {
    name: "الأرباح",
    type: "line" as const,
    data: profitValues.map((v, i) => [i, v]),
    yAxisIndex: seriesMode === "both" ? 1 : 0,
    cursor: isDrillable ? "pointer" : "default",
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
  }, [labels, salesValues, profitValues, seriesMode, palette, isLoadingOrFetching, isError, isEmpty, enabled, isDrillable]);

  // ── subtitle ──────────────────────────────────────────────────────────────

  const subtitle = !enabled
    ? "يرجى تحديد سنة صالحة من الفلتر"
    : isError
      ? "تعذر تحميل البيانات"
      : isEmpty
        ? "لا توجد بيانات للفترة المحددة"
        : isDrillable
          ? "انقر على البيانات للتعمق في التفاصيل"
          : "البيانات مرتبطة بالفلاتر العامة";

  // ── button style factory ──────────────────────────────────────────────────

  const btnStyle = (isActive: boolean, accent: string, loading: boolean) => ({
    background: isActive ? `${accent}25` : "var(--bg-elevated)",
    color:      isActive ? accent : "var(--text-muted)",
    border:     `1px solid ${isActive ? accent : "var(--border-subtle)"}`,
    opacity:    loading ? 0.55 : 1,
    cursor:     loading ? "not-allowed" : "pointer",
    transition: "opacity 0.2s, background 0.15s",
  });

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoadingOrFetching && (
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

      <ChartCard
        title="صافي الأرباح والمبيعات حسب التاريخ"
        subtitle={subtitle}
        titleFlag="green"
        titleFlagNumber={1}
        onEvents={{
          click: (params: unknown) => {
            const p = params as { dataIndex: number; name: string };
            if (typeof p?.name === "string" && typeof p?.dataIndex === "number") {
              handleChartClick(p);
            }
          },
        }}
        headerExtra={
          <div className="flex flex-col items-end gap-2" dir="rtl">
            {/* Row 1: breadcrumb (when drilled) + indicator + level toggles */}
            <div className="flex items-center gap-2 flex-wrap justify-end">

              {/* Breadcrumb — only visible when drilled */}
              <Breadcrumb
                level={level}
                drillYear={drillYear}
                drillQuarter={drillQuarter}
                onNavigate={handleBreadcrumbNavigate}
                accentColor={palette.primaryGreen}
              />

              {/* Separator after breadcrumb */}
              {level !== "year" && (
                <span style={{ width: 1, height: 18, background: "var(--border-subtle)", display: "inline-block", flexShrink: 0 }} />
              )}

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

              {/* Live fetching indicator */}
              {isLoadingOrFetching && (
                <FetchingDots color={palette.primaryGreen} />
              )}

              {/* Error retry button */}
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

            {/* Row 2: sub-period buttons (hidden when drill is active) */}
            <SubPeriodRow
              level={level}
              selectedQuarters={selectedQuarters}
              toggleQuarter={toggleQuarter}
              selectedMonths={selectedMonths}
              toggleMonth={toggleMonth}
              accentColor={palette.primaryGreen}
              disabled={isLoadingOrFetching}
              drillYear={drillYear}
              drillQuarter={drillQuarter}
            />
          </div>
        }
        option={option}
        height="300px"
      />
    </div>
  );
};

export default NetProfitAndSalesByDate;