"use client";

import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useNetSalesProfitChart } from "@/hooks/useSalesAnalyses";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { AnalyticsLoader } from "@/components/ui/analytics-loader";
import { useFilterStore } from "@/store/filterStore";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  { ssr: false, loading: () => <Skeleton variant="chart" /> },
);

// ─── helpers ──────────────────────────────────────────────────────────────────

const normalizeSelections = (values: string[]) =>
  values.filter((v) => v && v !== "all");

const toInt = (s: string): number | undefined => {
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) || s === "" ? undefined : n;
};

const QUARTER_MONTHS: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
};

// ─── y-axis definitions ───────────────────────────────────────────────────────

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
};

const EMPTY_OPTION = {
  xAxis: { type: "category" as const, data: [] },
  yAxis: { type: "value" as const },
  series: [],
};

// ─── types ────────────────────────────────────────────────────────────────────

type LevelType = "year" | "quarter" | "month";
type IndicatorType = "both" | "sales" | "profit";
type QuarterType = 1 | 2 | 3 | 4;

const ARABIC_MONTHS_SHORT = [
  "يناير",
  "فبراير",
  "مارس",
  "إبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const QUARTER_LABELS: Record<QuarterType, string> = {
  1: "الربع الأول",
  2: "الربع الثاني",
  3: "الربع الثالث",
  4: "الربع الرابع",
};

const QUARTER_SHORT: Record<QuarterType, string> = {
  1: "Q1",
  2: "Q2",
  3: "Q3",
  4: "Q4",
};

const indicatorButtons: { value: IndicatorType; label: string }[] = [
  { value: "sales", label: "المبيعات" },
  { value: "profit", label: "الأرباح" },
  { value: "both", label: "كلاهما" },
];

const levelButtons: { value: LevelType; label: string }[] = [
  { value: "year", label: "سنوي" },
  { value: "quarter", label: "ربع سنوي" },
  { value: "month", label: "شهري" },
];

// ─── ParsedItem ───────────────────────────────────────────────────────────────

interface ParsedItem {
  label: string; // The X-axis tick label shown by ECharts
  year: number;
  quarter: QuarterType;
  month?: number;
  index: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── GENERIC GROUPED AXIS ────────────────────────────────────────────────────
//
// This replaces the old HierarchicalAxis with a fully generic system.
//
// The concept:
//   - `items`  : the flat list of bars (ParsedItem[])
//   - `groups` : how to extract the "parent group key" from each item
//                e.g. for year-level: item => item.year
//                     for quarter-level: item => `${item.year}-Q${item.quarter}`
//   - `getGroupLabel` : how to render the parent group's label
//                e.g. for year-level: key => "2025"
//                     for quarter-level: key => "الربع الأول"
//
// Layout per group (same pattern for BOTH year and quarter level):
//
//   [ child  child  child  child ]
//          GROUP_LABEL
//   ─────────────────────────────
//
// Visual separators between groups are vertical lines through the full height.
// ══════════════════════════════════════════════════════════════════════════════

interface GroupedAxisConfig {
  /** Extract the group key string from each item (must be stable/comparable) */
  getGroupKey: (item: ParsedItem) => string;
  /** Render the group label from a key */
  getGroupLabel: (key: string, items: ParsedItem[]) => string;
  /** Accent color for the group label and underline */
  accentColor: string;
  /** Whether separator between groups is solid (true) or dashed (false) */
  solidSeparator?: boolean;
}

interface GroupedAxisProps {
  items: ParsedItem[];
  config: GroupedAxisConfig;
  /** Must match ECharts grid left/right/containLabel settings */
  gridLeft: string | number;
  gridRight: string | number;
  /** Approximate px added by containLabel per side */
  labelExtra?: number;
}

interface AxisGroup {
  key: string;
  startIndex: number;
  endIndex: number;
  items: ParsedItem[];
}

function buildGroups(
  items: ParsedItem[],
  getKey: (i: ParsedItem) => string,
): AxisGroup[] {
  const groups: AxisGroup[] = [];
  for (const item of items) {
    const key = getKey(item);
    const last = groups[groups.length - 1];
    if (!last || last.key !== key) {
      groups.push({
        key,
        startIndex: item.index,
        endIndex: item.index,
        items: [item],
      });
    } else {
      last.endIndex = item.index;
      last.items.push(item);
    }
  }
  return groups;
}

function GroupedAxis({
  items,
  config,
  gridLeft,
  gridRight,
  labelExtra = 44,
}: GroupedAxisProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setContainerW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Heights for each visual row
  const ROW_LABEL_H = 20; // group label row (e.g. "2025" or "الربع الأول")
  const ROW_LINE_H = 10; // underline + padding below
  const TOTAL_H = ROW_LABEL_H + ROW_LINE_H;

  if (containerW === 0 || items.length === 0) {
    return <div ref={wrapRef} style={{ width: "100%", height: TOTAL_H }} />;
  }

  // ── Grid geometry matching ECharts ────────────────────────────────────────
  const gLeft =
    typeof gridLeft === "string"
      ? containerW * (parseFloat(gridLeft) / 100) + labelExtra
      : gridLeft + labelExtra;
  const gRight =
    typeof gridRight === "string"
      ? containerW * (parseFloat(gridRight) / 100) + labelExtra
      : gridRight + labelExtra;
  const plotW = containerW - gLeft - gRight;
  const n = items.length;
  const slotW = plotW / n;

  // Pixel helpers
  const lx = (i: number) => gLeft + slotW * i;
  const rx = (i: number) => gLeft + slotW * (i + 1);
  const midX = (start: number, end: number) => (lx(start) + rx(end)) / 2;

  // Build groups
  const groups = buildGroups(items, config.getGroupKey);

  const labelY = ROW_LABEL_H / 2 + 1; // center of label row
  const lineY = ROW_LABEL_H + 4; // underline y
  const svgH = TOTAL_H;

  const els: React.ReactNode[] = [];

  groups.forEach((group, gi) => {
    const x1 = lx(group.startIndex);
    const x2 = rx(group.endIndex);
    const mx = midX(group.startIndex, group.endIndex);
    const label = config.getGroupLabel(group.key, group.items);

    // Group label centered under its children
    els.push(
      <text
        key={`gl-${group.key}`}
        x={mx}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="600"
        fill={config.accentColor}
      >
        {label}
      </text>,
    );

    // Horizontal underline spanning the group
    els.push(
      <line
        key={`ul-${group.key}`}
        x1={x1 + 6}
        x2={x2 - 6}
        y1={lineY}
        y2={lineY}
        stroke={config.accentColor}
        strokeWidth={1.5}
        strokeOpacity={0.6}
      />,
    );

    // Vertical separator BEFORE this group (except first)
    if (gi > 0) {
      const sepX = lx(group.startIndex);
      els.push(
        <line
          key={`vs-${group.key}`}
          x1={sepX}
          x2={sepX}
          y1={0}
          y2={svgH}
          stroke={config.solidSeparator ? "#94a3b8" : "#cbd5e1"}
          strokeWidth={config.solidSeparator ? 1.5 : 1}
          strokeDasharray={config.solidSeparator ? undefined : "4 2"}
        />,
      );
    }
  });

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <svg
        width="100%"
        height={svgH}
        style={{ display: "block", overflow: "visible" }}
      >
        {els}
      </svg>
    </div>
  );
}

// ─── HtmlLegend ───────────────────────────────────────────────────────────────

interface LegendItem {
  color: string;
  name: string;
}

function HtmlLegend({ items }: { items: LegendItem[] }) {
  return (
    <div
      className="flex items-center justify-center gap-4"
      style={{ padding: "2px 0 6px" }}
    >
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 8,
              borderRadius: 2,
              background: item.color,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── ChartFooter ─────────────────────────────────────────────────────────────
//
// Composed footer rendered INSIDE the glass-panel via ChartCard's `footer` prop.
//
// Structure (top → bottom):
//   1. HtmlLegend      — المبيعات / الأرباح dots
//   2. GroupedAxis     — group labels + underlines (only for quarter/month level)

interface ChartFooterProps {
  level: LevelType;
  items: ParsedItem[];
  seriesMode: IndicatorType;
  palette: { primaryGreen: string; primaryCyan: string };
}

function ChartFooter({ level, items, seriesMode, palette }: ChartFooterProps) {
  // ── Legend items ──────────────────────────────────────────────────────────
  const legendItems: LegendItem[] = useMemo(() => {
    const out: LegendItem[] = [];
    if (seriesMode === "sales" || seriesMode === "both")
      out.push({ color: palette.primaryGreen, name: "المبيعات" });
    if (seriesMode === "profit" || seriesMode === "both")
      out.push({ color: palette.primaryCyan, name: "الأرباح" });
    return out;
  }, [seriesMode, palette.primaryGreen, palette.primaryCyan]);

  // ── Grouped axis config — SAME pattern for both year and quarter level ────
  //
  // year level    → group by year  → label = "2025"
  // quarter level → group by year+quarter → label = "الربع الأول"
  // month level   → no grouping (just the legend)
  //
  const axisConfig = useMemo((): GroupedAxisConfig | null => {
    if (level === "year") return null; // ECharts handles year labels natively
    if (level === "month") return null; // no sub-grouping needed for month view

    if (level === "quarter") {
      // Group by year; label = the year number
      return {
        getGroupKey: (item) => String(item.year),
        getGroupLabel: (key) => key,
        accentColor: palette.primaryGreen,
        solidSeparator: true,
      };
    }

    // Should never reach here with current levels, but satisfies TS
    return null;
  }, [level, palette.primaryGreen]);

  // For month level: group by year+quarter → label = quarter name
  // We need a second tier: group by year → label = year
  // So month level renders TWO GroupedAxis rows stacked
  const quarterAxisConfig = useMemo((): GroupedAxisConfig | null => {
    if (level !== "month") return null;
    return {
      getGroupKey: (item) => `${item.year}-${item.quarter}`,
      getGroupLabel: (_key, groupItems) =>
        QUARTER_LABELS[groupItems[0].quarter],
      accentColor: "#64748b",
      solidSeparator: false,
    };
  }, [level]);

  const yearAxisConfig = useMemo((): GroupedAxisConfig | null => {
    if (level !== "month") return null;
    return {
      getGroupKey: (item) => String(item.year),
      getGroupLabel: (key) => key,
      accentColor: palette.primaryGreen,
      solidSeparator: true,
    };
  }, [level, palette.primaryGreen]);

  // ECharts grid settings — must match what we pass in `option`
  const GRID_LEFT = "5%";
  const GRID_RIGHT = "6%";

  return (
    <div style={{ width: "100%", paddingBottom: 8 }}>
      {/* Axis rows FIRST — sit immediately below the chart, no top gap */}

      {/* Quarter level: one year-grouping row */}
      {axisConfig && items.length > 0 && (
        <GroupedAxis
          items={items}
          config={axisConfig}
          gridLeft={GRID_LEFT}
          gridRight={GRID_RIGHT}
        />
      )}

      {/* Month level: quarter tier then year tier */}
      {quarterAxisConfig && yearAxisConfig && items.length > 0 && (
        <>
          <GroupedAxis
            items={items}
            config={quarterAxisConfig}
            gridLeft={GRID_LEFT}
            gridRight={GRID_RIGHT}
          />
          <GroupedAxis
            items={items}
            config={yearAxisConfig}
            gridLeft={GRID_LEFT}
            gridRight={GRID_RIGHT}
          />
        </>
      )}

      {/* Legend LAST — always at the very bottom of the card */}
      <HtmlLegend items={legendItems} />
    </div>
  );
}

// ─── buildChartData ───────────────────────────────────────────────────────────

interface GroupedChartData {
  items: ParsedItem[];
  flatLabels: string[];
  flatSales: number[];
  flatProfits: number[];
  totalItems: number;
}

function buildChartData(chartData: any[], level: LevelType): GroupedChartData {
  if (chartData.length === 0)
    return {
      items: [],
      flatLabels: [],
      flatSales: [],
      flatProfits: [],
      totalItems: 0,
    };

  if (level === "year") {
    const sorted = [...chartData].sort((a, b) => a.year - b.year);
    const items: ParsedItem[] = sorted.map((d, i) => ({
      label: String(d.year),
      year: d.year,
      quarter: 1 as QuarterType,
      index: i,
    }));
    return {
      items,
      flatLabels: items.map((x) => x.label),
      flatSales: sorted.map((d) => d.sales),
      flatProfits: sorted.map((d) => d.profit),
      totalItems: sorted.length,
    };
  }

  if (level === "quarter") {
    const sorted = [...chartData].sort((a, b) =>
      a.year !== b.year ? a.year - b.year : (a.quarter ?? 0) - (b.quarter ?? 0),
    );
    const items: ParsedItem[] = sorted.map((d, i) => ({
      label: `Q${d.quarter}`,
      year: d.year,
      quarter: (d.quarter ?? 1) as QuarterType,
      index: i,
    }));
    return {
      items,
      flatLabels: items.map((x) => x.label),
      flatSales: sorted.map((d) => d.sales),
      flatProfits: sorted.map((d) => d.profit),
      totalItems: sorted.length,
    };
  }

  // month
  const sorted = [...chartData].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : (a.month ?? 0) - (b.month ?? 0),
  );
  const items: ParsedItem[] = sorted.map((d, i) => ({
    label: `شهر ${d.month ?? i + 1}`,
    year: d.year,
    quarter: Math.ceil((d.month ?? 1) / 3) as QuarterType,
    month: d.month,
    index: i,
  }));
  return {
    items,
    flatLabels: items.map((x) => x.label),
    flatSales: sorted.map((d) => d.sales),
    flatProfits: sorted.map((d) => d.profit),
    totalItems: sorted.length,
  };
}

// ─── buildMarkLines ───────────────────────────────────────────────────────────

function buildMarkLines(items: ParsedItem[], level: LevelType): object[] {
  if (level === "year" || items.length === 0) return [];
  const result: object[] = [];
  for (let i = 1; i < items.length; i++) {
    if (items[i].year !== items[i - 1].year) {
      result.push({
        xAxis: i - 0.5,
        lineStyle: { color: "#94a3b8", width: 1.5, type: "solid" },
        label: { show: false },
      });
    } else if (level === "month" && items[i].quarter !== items[i - 1].quarter) {
      result.push({
        xAxis: i - 0.5,
        lineStyle: { color: "#cbd5e1", width: 1, type: "dashed" },
        label: { show: false },
      });
    }
  }
  return result;
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({
  level,
  drillYear,
  drillQuarter,
  onNavigate,
  accentColor,
}: {
  level: LevelType;
  drillYear: number | null;
  drillQuarter: QuarterType | null;
  onNavigate: (l: LevelType) => void;
  accentColor: string;
}) {
  if (level === "year") return null;
  const crumbs: { label: string; level: LevelType }[] = [
    { label: "سنوي", level: "year" },
  ];
  if (drillYear !== null)
    crumbs.push({ label: String(drillYear), level: "quarter" });
  if (level === "month" && drillQuarter !== null)
    crumbs.push({ label: QUARTER_SHORT[drillQuarter], level: "month" });
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
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: 9,
                  opacity: 0.6,
                }}
              >
                ›
              </span>
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
              }}
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
}: {
  level: LevelType;
  selectedQuarters: QuarterType[];
  toggleQuarter: (q: QuarterType) => void;
  selectedMonths: number[];
  toggleMonth: (m: number) => void;
  accentColor: string;
  disabled: boolean;
  drillYear: number | null;
  drillQuarter: QuarterType | null;
}) {
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

// ─── Main Component ───────────────────────────────────────────────────────────

const NetProfitAndSalesByDate = () => {
  const [seriesMode, setSeriesMode] = useState<IndicatorType>("both");
  const [level, setLevel] = useState<LevelType>("year");
  const [selectedQuarters, setSelectedQuarters] = useState<QuarterType[]>([1]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([1]);
  const [drillYear, setDrillYear] = useState<number | null>(null);
  const [drillQuarter, setDrillQuarter] = useState<QuarterType | null>(null);
  const [multiYearYears, setMultiYearYears] = useState<number[]>([]);
  const [isSplitViewMode, setIsSplitViewMode] = useState(false);

  const toggleQuarter = (quarter: QuarterType) =>
    setSelectedQuarters((prev) =>
      prev.includes(quarter)
        ? prev.length === 1
          ? prev
          : prev.filter((q) => q !== quarter)
        : [...prev, quarter].sort((a, b) => a - b),
    );

  const toggleMonth = (month: number) =>
    setSelectedMonths((prev) =>
      prev.includes(month)
        ? prev.length === 1
          ? prev
          : prev.filter((m) => m !== month)
        : [...prev, month].sort((a, b) => a - b),
    );

  const handleLevelChange = (newLevel: LevelType) => {
    setLevel(newLevel);
    setDrillYear(null);
    setDrillQuarter(null);
    if (newLevel === "quarter") setSelectedQuarters([1, 2, 3, 4]);
    if (newLevel === "month") setSelectedMonths([1]);
  };

  const handleBreadcrumbNavigate = useCallback((targetLevel: LevelType) => {
    if (targetLevel === "year") {
      setLevel("year");
      setDrillYear(null);
      setDrillQuarter(null);
    }
    if (targetLevel === "quarter") {
      setLevel("quarter");
      setDrillQuarter(null);
    }
  }, []);

  const handleChartClick = useCallback(
    (params: { dataIndex: number; name: string }) => {
      if (level === "year") {
        const y = toInt(params.name);
        if (y === undefined) return;
        setDrillYear(y);
        setDrillQuarter(null);
        setSelectedQuarters([1, 2, 3, 4]);
        setLevel("quarter");
      } else if (level === "quarter") {
        const match = params.name.match(/^Q(\d)$/);
        if (!match) return;
        const q = parseInt(match[1], 10) as QuarterType;
        setDrillQuarter(q);
        setSelectedMonths(QUARTER_MONTHS[q]);
        setLevel("month");
      }
    },
    [level],
  );

  const palette = useResolvedAnalyticsPalette();

  const storeYear = useFilterStore((s) => s.year);
  const storeMonth = useFilterStore((s) => s.month);
  const region = useFilterStore((s) => s.region);
  const activeBranches = useFilterStore((s) => s.activeBranches);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory = useFilterStore((s) => s.subcategory);
  const product = useFilterStore((s) => s.product);
  const agreement = useFilterStore((s) => s.agreement);
  const dateRangeFrom = useFilterStore((s) => s.dateRangeFrom);
  const dateRangeTo = useFilterStore((s) => s.dateRangeTo);

  const storeYearNum = toInt(storeYear);
  const monthNum = toInt(storeMonth);

  useEffect(() => {
    if (!dateRangeFrom || !dateRangeTo) {
      setIsSplitViewMode(false);
      setMultiYearYears([]);
      return;
    }
    const fromYear = parseInt(dateRangeFrom.split("-")[0], 10);
    const toYear = parseInt(dateRangeTo.split("-")[0], 10);
    if (isNaN(fromYear) || isNaN(toYear)) {
      setIsSplitViewMode(false);
      setMultiYearYears([]);
      return;
    }
    if (fromYear !== toYear) {
      const years: number[] = [];
      for (let y = fromYear; y <= toYear; y++) years.push(y);
      setMultiYearYears(years);
      setIsSplitViewMode(true);
    } else {
      setIsSplitViewMode(false);
      setMultiYearYears([]);
    }
  }, [dateRangeFrom, dateRangeTo]);

  const years = useMemo(() => {
    if (isSplitViewMode && multiYearYears.length > 0) return multiYearYears;
    if (drillYear !== null) return [drillYear];
    return storeYearNum !== undefined ? [storeYearNum] : [];
  }, [isSplitViewMode, multiYearYears, drillYear, storeYearNum]);

  const period = useMemo<number[] | undefined>(() => {
    if (level === "year") return undefined;
    if (level === "quarter") {
      if (isSplitViewMode || drillYear !== null) return [1, 2, 3, 4];
      return selectedQuarters;
    }
    if (level === "month") {
      if (drillQuarter !== null) return QUARTER_MONTHS[drillQuarter];
      if (
        selectedMonths.length === 1 &&
        selectedMonths[0] === 1 &&
        monthNum !== undefined
      )
        return [monthNum];
      return selectedMonths;
    }
    return undefined;
  }, [
    level,
    isSplitViewMode,
    drillYear,
    drillQuarter,
    selectedQuarters,
    selectedMonths,
    monthNum,
  ]);

  const agreementId = useMemo(
    () => normalizeSelections(agreement)[0] ?? undefined,
    [agreement],
  );
  const enabled =
    years.length > 0 && (level === "year" || (period ?? []).length > 0);

  const isDrillable = level === "year" || level === "quarter";

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

  const { data, isLoading, isFetching, isError, refetch } =
    useNetSalesProfitChart(chartParams, {
      enabled,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    });

  const chartData = data?.data ?? [];
  const groupedData = useMemo(
    () => buildChartData(chartData, level),
    [chartData, level],
  );
  const separatorMarkLines = useMemo(
    () => buildMarkLines(groupedData.items, level),
    [groupedData.items, level],
  );
  const itemCount = groupedData.totalItems || 1;
  const dynamicChartHeight = useMemo(() => {
    if (itemCount <= 6) return "260px";
    if (itemCount <= 12) return "300px";
    if (itemCount <= 20) return "340px";
    if (itemCount <= 30) return "380px";
    return "420px";
  }, [itemCount]);

  const dynamicBarWidth = useMemo(() => {
    if (itemCount <= 6) return 48;
    if (itemCount <= 12) return 40;
    if (itemCount <= 18) return 28;
    if (itemCount <= 24) return 20;
    if (itemCount <= 36) return 14;
    return 10;
  }, [itemCount]);
  // ── ECharts xAxis ─────────────────────────────────────────────────────────
  // For quarter/month levels: show the tick labels (Q1/Q2 or شهر1/شهر2)
  // natively via ECharts — the footer GroupedAxis handles the parent tier only.
  const xAxis = useMemo(
    () => ({
      type: "category" as const,
      data: groupedData.flatLabels,
      triggerEvent: isDrillable,
      axisLabel: {
        show: true,
        color: isDrillable ? palette.primaryGreen : "#94a3b8",
        fontSize: itemCount <= 12 ? 10 : itemCount <= 24 ? 8 : 7,
        interval: 0,
      },
      axisLine: { show: true },
      axisTick: { show: false },
      splitLine: { show: false },
    }),
    [
      groupedData.flatLabels,
      isDrillable,
      level,
      palette.primaryGreen,
      itemCount,
    ],
  );

  const isLoadingOrFetching = isLoading || isFetching;
  const isEmpty =
    !isLoadingOrFetching && !isError && enabled && chartData.length === 0;

  const salesBarSeries = useMemo(
    () => ({
      name: "المبيعات",
      type: "bar" as const,
      data: groupedData.flatSales,
      barWidth: dynamicBarWidth,
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
      ...(separatorMarkLines.length > 0
        ? {
            markLine: {
              silent: true,
              symbol: "none",
              animation: false,
              data: separatorMarkLines,
            },
          }
        : {}),
    }),
    [
      groupedData.flatSales,
      isDrillable,
      palette.primaryGreen,
      separatorMarkLines,
      dynamicBarWidth,
    ],
  );

  const profitLineSeries = useMemo(
    () => ({
      name: "الأرباح",
      type: "line" as const,
      data: groupedData.flatProfits,
      yAxisIndex: seriesMode === "both" ? 1 : 0,
      cursor: isDrillable ? "pointer" : "default",
      lineStyle: {
        color: palette.primaryCyan,
        width: itemCount > 20 ? 1.5 : 2.5,
      },
      itemStyle: { color: palette.primaryCyan, borderWidth: 2 },
      symbol: "circle" as const,
      symbolSize: itemCount <= 12 ? 8 : itemCount <= 24 ? 5 : 3,
      smooth: true,
      areaStyle: { color: "rgba(8,145,178,0.08)" },
      silent: isDrillable,
    }),
    [
      groupedData.flatProfits,
      seriesMode,
      isDrillable,
      palette.primaryCyan,
      itemCount,
    ],
  );

  // ── Grid: tight bottom — footer lives outside the canvas ─────────────────
  const option = useMemo(() => {
    if (isLoadingOrFetching || isError || !enabled || chartData.length === 0)
      return EMPTY_OPTION;

    const grid = {
      left: "5%" as const,
      right: "6%" as const,
      top: "14%",
      bottom: "8%", // tight — legend + axis tiers are in footer, not canvas
      containLabel: true,
    };

    // Disable ECharts built-in legend — we render our own HTML legend in footer
    const noLegend = { show: false };

    if (seriesMode === "sales")
      return {
        grid,
        xAxis,
        yAxis: salesYAxis,
        series: [salesBarSeries],
        legend: noLegend,
      };
    if (seriesMode === "profit")
      return {
        grid,
        xAxis,
        yAxis: { ...profitYAxis, position: "left" as const },
        series: [{ ...profitLineSeries, yAxisIndex: 0 }],
        legend: noLegend,
      };
    return {
      grid,
      xAxis,
      yAxis: [salesYAxis, profitYAxis],
      series: [salesBarSeries, profitLineSeries],
      legend: noLegend,
    };
  }, [
    xAxis,
    salesBarSeries,
    profitLineSeries,
    seriesMode,
    isLoadingOrFetching,
    isError,
    enabled,
    chartData.length,
  ]);

  const subtitle = !enabled
    ? "يرجى تحديد سنة صالحة من الفلتر"
    : isError
      ? "تعذر تحميل البيانات"
      : isEmpty
        ? "لا توجد بيانات للفترة المحددة"
        : isDrillable
          ? "انقر على البيانات للتعمق في التفاصيل"
          : "البيانات مرتبطة بالفلاتر العامة";

  const btnStyle = (isActive: boolean, accent: string, loading: boolean) => ({
    background: isActive ? `${accent}25` : "var(--bg-elevated)",
    color: isActive ? accent : "var(--text-muted)",
    border: `1px solid ${isActive ? accent : "var(--border-subtle)"}`,
    opacity: loading ? 0.55 : 1,
    cursor: loading ? "not-allowed" : "pointer",
    transition: "opacity 0.2s, background 0.15s",
  });

  // ── Footer: legend + grouped axis, rendered inside glass-panel ───────────
  const footer = useMemo(
    () => (
      <ChartFooter
        level={level}
        items={groupedData.items}
        seriesMode={seriesMode}
        palette={palette}
      />
    ),
    [level, groupedData.items, seriesMode, palette],
  );

  return (
    <div className="relative">
      {isLoadingOrFetching && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
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
            if (typeof p?.name === "string" && typeof p?.dataIndex === "number")
              handleChartClick(p);
          },
        }}
        headerExtra={
          <div className="flex flex-col items-end gap-2" dir="rtl">
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Breadcrumb
                level={level}
                drillYear={drillYear}
                drillQuarter={drillQuarter}
                onNavigate={handleBreadcrumbNavigate}
                accentColor={palette.primaryGreen}
              />
              {level !== "year" && (
                <span
                  style={{
                    width: 1,
                    height: 18,
                    background: "var(--border-subtle)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
              )}
              <div className="flex items-center gap-1">
                <span
                  className="text-[9px] shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  المؤشر:
                </span>
                {indicatorButtons.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={isLoadingOrFetching}
                    onClick={() => setSeriesMode(value)}
                    className="px-2 py-1 rounded-md text-[10px] font-medium"
                    style={btnStyle(
                      seriesMode === value,
                      palette.primaryCyan,
                      isLoadingOrFetching,
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span
                style={{
                  width: 1,
                  height: 18,
                  background: "var(--border-subtle)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <div className="flex items-center gap-1">
                <span
                  className="text-[9px] shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  المستوى:
                </span>
                {levelButtons.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={isLoadingOrFetching}
                    onClick={() => handleLevelChange(value)}
                    className="px-2 py-1 rounded-md text-[10px] font-medium"
                    style={btnStyle(
                      level === value,
                      palette.primaryGreen,
                      isLoadingOrFetching,
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {isLoadingOrFetching && (
                <FetchingDots color={palette.primaryGreen} />
              )}
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
        height={dynamicChartHeight}
        footer={footer}
      />
    </div>
  );
};

export default NetProfitAndSalesByDate;
