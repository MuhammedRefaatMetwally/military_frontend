"use client";

import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useNetSalesProfitChart } from "@/hooks/useSalesAnalyses";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { AnalyticsLoader } from "@/components/ui/analytics-loader";
import { useFilterStore } from "@/store/filterStore";

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

// Adjusted grid to accommodate group labels below x-axis
const drillGrid = {
  left: "5%" as const,
  right: "6%" as const,
  top: "14%",
  bottom: "22%",
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

// ─── Hierarchical Grouping Types ─────────────────────────────────────────────

interface HierarchicalGroup {
  groupKey: string | number;
  groupLabel: string;
  children: Array<{
    childKey: string | number;
    childLabel: string;
    sales: number;
    profit: number;
  }>;
  startIndex: number;
  endIndex: number;
}

interface GroupedChartData {
  groups: HierarchicalGroup[];
  flatLabels: string[];
  flatSales: number[];
  flatProfits: number[];
  totalItems: number;
}

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

// ─── Generic Hierarchical Grouping System ────────────────────────────────────
// This function works for BOTH Year→Quarter AND Quarter→Month groupings
// It accepts data and grouping configuration, returning a unified structure

function createHierarchicalGroups<T extends { sales: number; profit: number }>(
  data: T[],
  config: {
    getGroupKey: (item: T) => string | number;
    getGroupLabel: (groupKey: string | number) => string;
    getChildKey: (item: T) => string | number;
    getChildLabel: (item: T) => string;
    sortGroups?: (a: string | number, b: string | number) => number;
    sortChildren?: (a: T, b: T) => number;
  }
): GroupedChartData {
  const { getGroupKey, getGroupLabel, getChildKey, getChildLabel, sortGroups, sortChildren } = config;

  // Group data by parent
  const groupMap = new Map<string | number, T[]>();
  
  for (const item of data) {
    const groupKey = getGroupKey(item);
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, []);
    }
    groupMap.get(groupKey)!.push(item);
  }

  // Sort groups
  let groupKeys = Array.from(groupMap.keys());
  if (sortGroups) {
    groupKeys = groupKeys.sort(sortGroups);
  }

  // Build hierarchical structure
  const groups: HierarchicalGroup[] = [];
  const flatLabels: string[] = [];
  const flatSales: number[] = [];
  const flatProfits: number[] = [];
  let currentIndex = 0;

  for (const groupKey of groupKeys) {
    let children = groupMap.get(groupKey) || [];
    
    // Sort children within group
    if (sortChildren) {
      children = children.sort(sortChildren);
    }

    const startIndex = currentIndex;
    const groupChildren: HierarchicalGroup["children"] = [];

    for (const child of children) {
      const childLabel = getChildLabel(child);
      groupChildren.push({
        childKey: getChildKey(child),
        childLabel,
        sales: child.sales,
        profit: child.profit,
      });
      flatLabels.push(childLabel);
      flatSales.push(child.sales);
      flatProfits.push(child.profit);
      currentIndex++;
    }

    groups.push({
      groupKey,
      groupLabel: getGroupLabel(groupKey),
      children: groupChildren,
      startIndex,
      endIndex: currentIndex - 1,
    });
  }

  return {
    groups,
    flatLabels,
    flatSales,
    flatProfits,
    totalItems: currentIndex,
  };
}

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
  drillYear: number | null;
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

// ─── GroupLabelsOverlay ───────────────────────────────────────────────────────
// Renders group labels below the chart area with proper alignment
// Works for both quarter level (grouped by years) and month level (grouped by quarters)

interface GroupLabelsOverlayProps {
  groups: HierarchicalGroup[];
  totalItems: number;
  accentColor: string;
  level: LevelType;
}

function GroupLabelsOverlay({ groups, totalItems, accentColor, level }: GroupLabelsOverlayProps) {
  // Only show group labels for quarter level (groups = years)
  // Month level has NO hierarchical grouping - each bar is individual
  if (groups.length === 0 || level === "year" || level === "month") return null;

  // Grid margins accounting for containLabel padding
  // ECharts adds extra padding for axis labels, so we adjust accordingly
  const gridLeft = 9.5;  // 5% grid + ~4.5% containLabel
  const gridRight = 8.5; // 6% grid + ~2.5% containLabel
  const chartWidth = 100 - gridLeft - gridRight;
  
  // Half-item offset for proper bar centering
  const halfItemWidth = chartWidth / (totalItems * 2);

  return (
    <div
      className="absolute w-full pointer-events-none"
      style={{
        bottom: "4%",
        left: 0,
        right: 0,
        height: "14%",
      }}
      dir="ltr"
    >
      {/* Group labels centered under each group */}
      {groups.map((group) => {
        const itemCount = group.endIndex - group.startIndex + 1;
        const itemWidth = chartWidth / totalItems;
        const groupWidth = itemCount * itemWidth;
        const groupStart = gridLeft + (group.startIndex * itemWidth);
        const groupCenter = groupStart + (groupWidth / 2);

        return (
          <div key={group.groupKey}>
            {/* Horizontal underline for this group */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: `${groupStart + halfItemWidth}%`,
                width: `${groupWidth - halfItemWidth * 2}%`,
                height: 2,
                background: accentColor,
                opacity: 0.5,
                borderRadius: 1,
              }}
            />

            {/* Group label centered below */}
            <div
              style={{
                position: "absolute",
                top: 8,
                left: `${groupCenter}%`,
                transform: "translateX(-50%)",
                fontSize: 12,
                fontWeight: 600,
                color: accentColor,
                whiteSpace: "nowrap",
              }}
            >
              {group.groupLabel}
            </div>
          </div>
        );
      })}
    </div>
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

  // Multi-year split view state
  const [multiYearYears, setMultiYearYears] = useState<number[]>([]);
  const [isSplitViewMode, setIsSplitViewMode] = useState(false);

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
    if (newLevel === "quarter") setSelectedQuarters([1, 2, 3, 4]);
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
    }
  }, []);

  // ── chart click handler ───────────────────────────────────────────────────

  const handleChartClick = useCallback(
    (params: { dataIndex: number; name: string }) => {
      if (level === "year") {
        // At year level, clicking drills into that year's quarters
        const clickedYear = toInt(params.name);
        if (clickedYear === undefined) return;
        setDrillYear(clickedYear);
        setDrillQuarter(null);
        setSelectedQuarters([1, 2, 3, 4]);
        setLevel("quarter");
      } else if (level === "quarter") {
        // At quarter level, clicking drills into that quarter's months
        const match = params.name.match(/^Q(\d)$/);
        if (!match) return;
        const q = Number.parseInt(match[1], 10) as QuarterType;
        setDrillQuarter(q);
        const monthsForQuarter = QUARTER_MONTHS[q];
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
  const dateRangeFrom  = useFilterStore((s) => s.dateRangeFrom);
  const dateRangeTo    = useFilterStore((s) => s.dateRangeTo);

  const storeYearNum = toInt(storeYear);
  const monthNum     = toInt(storeMonth);

  // ── Extract years from date range and set split-view mode ─────────────────
  useEffect(() => {
    if (!dateRangeFrom || !dateRangeTo) {
      setIsSplitViewMode(false);
      setMultiYearYears([]);
      return;
    }

    const fromYear = parseInt(dateRangeFrom.split('-')[0], 10);
    const toYear = parseInt(dateRangeTo.split('-')[0], 10);

    if (isNaN(fromYear) || isNaN(toYear)) {
      setIsSplitViewMode(false);
      setMultiYearYears([]);
      return;
    }

    if (fromYear !== toYear) {
      const years: number[] = [];
      for (let y = fromYear; y <= toYear; y++) {
        years.push(y);
      }
      setMultiYearYears(years);
      setIsSplitViewMode(true);
    } else {
      setIsSplitViewMode(false);
      setMultiYearYears([]);
    }
  }, [dateRangeFrom, dateRangeTo]);

  // ── years array ───────────────────────────────────────────────────────────

  const years = useMemo(() => {
    if (isSplitViewMode && multiYearYears.length > 0) return multiYearYears;
    if (drillYear !== null) return [drillYear];
    return storeYearNum !== undefined ? [storeYearNum] : [];
  }, [isSplitViewMode, multiYearYears, drillYear, storeYearNum]);

  // ── period array ──────────────────────────────────────────────────────────

  const period = useMemo<number[] | undefined>(() => {
    if (level === "year") return undefined;

    if (level === "quarter") {
      if (isSplitViewMode) return [1, 2, 3, 4];
      return drillYear !== null ? [1, 2, 3, 4] : selectedQuarters;
    }

    if (level === "month") {
      if (drillQuarter !== null) return QUARTER_MONTHS[drillQuarter];
      if (selectedMonths.length === 1 && selectedMonths[0] === 1 && monthNum !== undefined)
        return [monthNum];
      return selectedMonths;
    }

    return undefined;
  }, [level, isSplitViewMode, drillYear, drillQuarter, selectedQuarters, selectedMonths, monthNum]);

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

  // ── Build hierarchical grouped data ───────────────────────────────────────
  // Uses the SAME generic grouping system for both Year→Quarter and Quarter→Month

  const groupedData = useMemo<GroupedChartData>(() => {
    if (chartData.length === 0) {
      return { groups: [], flatLabels: [], flatSales: [], flatProfits: [], totalItems: 0 };
    }

    // Year level: Group quarters under each year
    // [Q1 Q2 Q3 Q4] → 2025
    if (level === "year") {
      return createHierarchicalGroups(chartData, {
        getGroupKey: (item) => item.year,
        getGroupLabel: (year) => String(year),
        getChildKey: (item) => `${item.year}`,
        getChildLabel: (item) => String(item.year),
        sortGroups: (a, b) => Number(a) - Number(b),
      });
    }

    // Quarter level: Group quarters under each year (for multi-year) OR show quarters grouped
    // [Q1 Q2 Q3 Q4] → 2025
    if (level === "quarter") {
      return createHierarchicalGroups(chartData, {
        getGroupKey: (item) => item.year,
        getGroupLabel: (year) => String(year),
        getChildKey: (item) => `Q${item.quarter}`,
        getChildLabel: (item) => `Q${item.quarter}`,
        sortGroups: (a, b) => Number(a) - Number(b),
        sortChildren: (a, b) => (a.quarter ?? 0) - (b.quarter ?? 0),
      });
    }

    // Month level: NO hierarchical grouping - each month shown individually
    // Label format: "شهر X (YYYY)" - e.g., "شهر 1 (2024)"
    // Each bar is separate with vertical dashed lines between them
    if (level === "month") {
      // Sort data by year then month
      const sortedData = [...chartData].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return (a.month ?? 0) - (b.month ?? 0);
      });

      // Build flat arrays - no grouping, each month is individual
      const flatLabels: string[] = [];
      const flatSales: number[] = [];
      const flatProfits: number[] = [];

      for (const item of sortedData) {
        const monthNum = item.month ?? 1;
        const year = item.year;
        // Format: "شهر X (YYYY)"
        flatLabels.push(`شهر ${monthNum} (${year})`);
        flatSales.push(item.sales);
        flatProfits.push(item.profit);
      }

      // Return with empty groups (no hierarchical grouping at month level)
      return {
        groups: [],
        flatLabels,
        flatSales,
        flatProfits,
        totalItems: flatLabels.length,
      };
    }

    return { groups: [], flatLabels: [], flatSales: [], flatProfits: [], totalItems: 0 };
  }, [chartData, level]);

  // ── Build ECharts axis and series from grouped data ───────────────────────

  const isDrillable = level === "year" || level === "quarter";

  // Build mark lines for separators
  const groupSeparatorLines = useMemo(() => {
    // Year level: no separators
    if (level === "year") return [];
    
    // Quarter level: separators between year groups
    if (level === "quarter" && groupedData.groups.length > 1) {
      return groupedData.groups.slice(1).map((group) => ({
        xAxis: group.startIndex - 0.5,
        lineStyle: {
          color: "#d1d5db",
          width: 1,
          type: "dashed" as const,
        },
        label: { show: false },
      }));
    }
    
    // Month level: separator between EACH bar (no grouping)
    if (level === "month" && groupedData.totalItems > 1) {
      const lines = [];
      for (let i = 1; i < groupedData.totalItems; i++) {
        lines.push({
          xAxis: i - 0.5,
          lineStyle: {
            color: "#d1d5db",
            width: 1,
            type: "dashed" as const,
          },
          label: { show: false },
        });
      }
      return lines;
    }
    
    return [];
  }, [groupedData.groups, groupedData.totalItems, level]);

  const xAxis = useMemo(() => ({
    type: "category" as const,
    data: groupedData.flatLabels,
    triggerEvent: isDrillable,
    axisLabel: {
      color: isDrillable ? palette.primaryGreen : "#94a3b8",
      fontSize: 11,
    },
    axisLine: { show: true },
    axisTick: { show: true },
  }), [groupedData.flatLabels, isDrillable, palette.primaryGreen]);

  const salesBarSeries = useMemo(() => ({
    name: "المبيعات",
    type: "bar" as const,
    data: groupedData.flatSales.map((v, i) => [i, v]),
    barWidth: 40,
    cursor: isDrillable ? "pointer" : "default",
    itemStyle: {
      color: palette.primaryGreen,
      borderRadius: [4, 4, 0, 0] as [number, number, number, number],
    },
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
    // Add separator lines between groups (for quarter and month levels)
    markLine: groupSeparatorLines.length > 0 ? {
      silent: true,
      symbol: "none",
      animation: false,
      data: groupSeparatorLines,
    } : undefined,
  }), [groupedData.flatSales, isDrillable, palette.primaryGreen, groupSeparatorLines]);

  const profitLineSeries = useMemo(() => ({
    name: "الأرباح",
    type: "line" as const,
    data: groupedData.flatProfits.map((v, i) => [i, v]),
    yAxisIndex: seriesMode === "both" ? 1 : 0,
    cursor: isDrillable ? "pointer" : "default",
    lineStyle: { color: palette.primaryCyan, width: 2.5 },
    itemStyle: { color: palette.primaryCyan, borderWidth: 2 },
    symbol: "circle" as const,
    symbolSize: 8,
    smooth: true,
    areaStyle: { color: "rgba(8,145,178,0.08)" },
    silent: isDrillable ? true : false,
  }), [groupedData.flatProfits, seriesMode, isDrillable, palette.primaryCyan]);

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

    const baseOption = {
      grid: drillGrid,
    };

    if (seriesMode === "sales")
      return {
        ...baseOption,
        xAxis,
        yAxis: salesYAxis,
        series: [salesBarSeries],
        legend: legend(["المبيعات"]),
      };
    if (seriesMode === "profit")
      return {
        ...baseOption,
        xAxis,
        yAxis: { ...profitYAxis, position: "left" as const },
        series: [{ ...profitLineSeries, yAxisIndex: 0 }],
        legend: legend(["الأرباح"]),
      };
    return {
      ...baseOption,
      xAxis,
      yAxis: [salesYAxis, profitYAxis],
      series: [salesBarSeries, profitLineSeries],
      legend: legend(["المبيعات", "الأرباح"]),
    };
  }, [xAxis, salesBarSeries, profitLineSeries, seriesMode, isLoadingOrFetching, isError, isEmpty, enabled]);

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

      {/* Hierarchical Group Labels Overlay */}
      <GroupLabelsOverlay
        groups={groupedData.groups}
        totalItems={groupedData.totalItems}
        accentColor={palette.primaryGreen}
        level={level}
      />
    </div>
  );
};

export default NetProfitAndSalesByDate;
