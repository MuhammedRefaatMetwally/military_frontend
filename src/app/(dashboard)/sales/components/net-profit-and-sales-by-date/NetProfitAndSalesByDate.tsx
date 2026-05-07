/**
 * NetProfitAndSalesByDate - Main component for date-based sales and profit analysis
 */

"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { AnalyticsLoader } from "@/components/ui/analytics-loader";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useNetSalesProfitChart } from "@/hooks/useSalesAnalyses";
import { useFilterStore } from "@/store/filterStore";
import {
  type LevelType,
  type IndicatorType,
  type QuarterType,
  salesYAxis,
  profitYAxis,
  EMPTY_OPTION,
  indicatorButtons,
  levelButtons,
  QUARTER_MONTHS,
  normalizeSelections,
  toInt,
  getChartHeight,
  getBarWidth,
} from "./utils/date-based-sales.constants";
import { buildChartData, buildMarkLines } from "./utils/chart-utils";
import { ChartFooter } from "./components/ChartFooter";
import { Breadcrumb } from "./components/Breadcrumb";
import { SubPeriodRow } from "./components/SubPeriodRow";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  { ssr: false, loading: () => <Skeleton variant="chart" /> },
);

// ─── FetchingDots indicator ───────────────────────────────────────────────

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

// ─── Button style builder ─────────────────────────────────────────────────

const getBtnStyle = (
  isActive: boolean,
  accent: string,
  loading: boolean,
) => ({
  background: isActive ? `${accent}25` : "var(--bg-elevated)",
  color: isActive ? accent : "var(--text-muted)",
  border: `1px solid ${isActive ? accent : "var(--border-subtle)"}`,
  opacity: loading ? 0.55 : 1,
  cursor: loading ? "not-allowed" : "pointer",
  transition: "opacity 0.2s, background 0.15s",
});

// ─── Main Component ───────────────────────────────────────────────────────

const NetProfitAndSalesByDate = () => {
  // ─── Component state ──────────────────────────────────────────────────

  const [seriesMode, setSeriesMode] = useState<IndicatorType>("both");
  const [level, setLevel] = useState<LevelType>("year");
  const [selectedQuarters, setSelectedQuarters] = useState<QuarterType[]>([1]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([1]);
  const [drillYear, setDrillYear] = useState<number | null>(null);
  const [drillQuarter, setDrillQuarter] = useState<QuarterType | null>(null);
  const [multiYearYears, setMultiYearYears] = useState<number[]>([]);
  const [isSplitViewMode, setIsSplitViewMode] = useState(false);

  // ─── Toggle handlers ──────────────────────────────────────────────────

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

  // ─── Filter store selectors ────────────────────────────────────────────

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

  // ─── Handle date range for split view ──────────────────────────────────

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

  // ─── Build query parameters ───────────────────────────────────────────

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

  // ─── Data fetching ────────────────────────────────────────────────────

  const { data, isLoading, isFetching, isError, refetch } =
    useNetSalesProfitChart(chartParams, {
      enabled,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    });

  // ─── Build chart data ─────────────────────────────────────────────────

  const chartData = data?.data ?? [];
  const groupedData = useMemo(
    () => buildChartData(chartData, level),
    [chartData, level],
  );
  const separatorMarkLines = useMemo(
    () => buildMarkLines(groupedData.items, level),
    [groupedData.items, level],
  );

  // ─── Dynamic chart dimensions ─────────────────────────────────────────

  const itemCount = groupedData.totalItems || 1;
  const dynamicChartHeight = getChartHeight(itemCount);
  const dynamicBarWidth = getBarWidth(itemCount);

  // ─── X-Axis configuration ─────────────────────────────────────────────

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
    [groupedData.flatLabels, isDrillable, level, palette.primaryGreen, itemCount],
  );

  // ─── Series configuration ──────────────────────────────────────────────

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

  // ─── Chart option builder ─────────────────────────────────────────────

  const isLoadingOrFetching = isLoading || isFetching;
  const isEmpty =
    !isLoadingOrFetching && !isError && enabled && chartData.length === 0;

  const option = useMemo(() => {
    if (isLoadingOrFetching || isError || !enabled || chartData.length === 0)
      return EMPTY_OPTION;

    const grid = {
      left: "5%" as const,
      right: "6%" as const,
      top: "14%",
      bottom: "8%",
      containLabel: true,
    };

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

  // ─── Status messages ──────────────────────────────────────────────────

  const subtitle = !enabled
    ? "يرجى تحديد سنة صالحة من الفلتر"
    : isError
      ? "تعذر تحميل البيانات"
      : isEmpty
        ? "لا توجد بيانات للفترة المحددة"
        : isDrillable
          ? "انقر على البيانات للتعمق في التفاصيل"
          : "البيانات مرتبطة بالفلاتر العامة";

  // ─── Footer component ─────────────────────────────────────────────────

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

  // ─── Render ───────────────────────────────────────────────────────────

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
                    style={getBtnStyle(
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
                    style={getBtnStyle(
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
