"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Calendar } from "lucide-react";

import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useFilterStore } from "@/store/filterStore";
import { useTransactionsWaterfall } from "@/hooks/useSalesAnalyses";
import { isWaterfallYearResponse, isWaterfallQuarterResponse } from "@/api/sales-analyses/types";
import { Dropdown } from "@/components/ui/Dropdown";
import AnalyticsLoader from "@/components/ui/analytics-loader";

import { ALL_YEARS, CURRENT_YEAR, MIN_CHART_WIDTH, PX_PER_BAR, CHART_HEIGHT } from "./utils/constants";
import { buildYearSeries, buildQuarterSeries } from "./utils/series-builders";
import { buildConnectorMarkLines } from "./utils/connectors";
import { buildChartOption } from "./utils/chart-option";
import { deriveGlobalYears } from "./utils/year-utils";
import type { PeriodMode } from "./types";

// ─── Lazy-loaded chart card (SSR-safe) ───────────────────────────────────────
const ChartCard = dynamic(() => import("@/components/ui/chart-card/ChartCard"), {
  ssr: false,
  loading: () => <div style={{ height: 340 }}>Loading chart...</div>,
});

// ─── Year dropdown option lists ───────────────────────────────────────────────
const ALL_YEAR_OPTIONS = ALL_YEARS.map((y) => ({ value: String(y), label: String(y) }));

// ─── Component ────────────────────────────────────────────────────────────────

export default function TransactionsCountWaterfall() {
  const palette = useResolvedAnalyticsPalette();
  const { activeBranches, region, year, dateRangeFrom, dateRangeTo } = useFilterStore();

  const branchIds = activeBranches.length > 0 ? activeBranches : undefined;
  const regionIds = region.length > 0 ? region : undefined;

  // ── Derive year range from global filters ─────────────────────────────────
  const globalYears = useMemo(
    () => deriveGlobalYears(year, dateRangeFrom, dateRangeTo),
    [year, dateRangeFrom, dateRangeTo],
  );

  // ── Local year-range override (null = follow global) ──────────────────────
  const [localYearFrom, setLocalYearFrom] = useState<number | null>(null);
  const [localYearTo, setLocalYearTo] = useState<number | null>(null);
  const prevGlobalRef = useRef(globalYears);

  // Reset local overrides whenever global filter changes
  useEffect(() => {
    const prev = prevGlobalRef.current;
    const globalChanged = prev.yearFrom !== globalYears.yearFrom || prev.yearTo !== globalYears.yearTo;

    if (globalChanged) {
      setLocalYearFrom(null);
      setLocalYearTo(null);
      prevGlobalRef.current = globalYears;
    }

    if (!dateRangeFrom || !dateRangeTo) {
      setLocalYearFrom(null);
      setLocalYearTo(null);
    }
  }, [globalYears, dateRangeFrom, dateRangeTo]);

  // ── Effective range (local wins over global) ──────────────────────────────
  const effectiveYearFrom = localYearFrom ?? globalYears.yearFrom;
  const effectiveYearTo   = localYearTo   ?? globalYears.yearTo;
  const safeYearTo        = Math.max(effectiveYearTo, effectiveYearFrom); // clamp
  const isSinglePeriod    = effectiveYearFrom === safeYearTo;

  const handleLocalYearFrom = (v: string) => {
    const val = Number(v);
    setLocalYearFrom(val);
    if (val > (localYearTo ?? globalYears.yearTo)) setLocalYearTo(val);
  };

  const handleLocalYearTo = (v: string) => {
    const val = Number(v);
    setLocalYearTo(val);
    if (val < (localYearFrom ?? globalYears.yearFrom)) setLocalYearFrom(val);
  };

  // ── Granularity & quarter-year state ─────────────────────────────────────
  const [period, setPeriod] = useState<PeriodMode>("سنوي");
  const [yearPick, setYearPick] = useState<number>(CURRENT_YEAR);

  // ── Data queries ──────────────────────────────────────────────────────────
  const yearQuery = useTransactionsWaterfall(
    { granularity: "year", yearFrom: effectiveYearFrom, yearTo: safeYearTo, branchIds, regionIds },
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
  const isLoading   = activeQuery.isLoading || activeQuery.isFetching;
  const isError     = activeQuery.isError;

  // ── Build chart series data ───────────────────────────────────────────────
  const { xLabels, helperData, incData, decData, totalData, maxValue, chartWidth, connectorMarkLines } =
    useMemo(() => {
      let xLabels     = [] as string[];
      let helperData  = [] as (number | null)[];
      let incData     = [] as (import("./types").BarDataItem | null)[];
      let decData     = [] as (import("./types").BarDataItem | null)[];
      let totalData   = [] as (import("./types").BarDataItem | null)[];
      let maxValue: number | undefined;

      if (period === "سنوي" && yearQuery.data && isWaterfallYearResponse(yearQuery.data)) {
        const built = buildYearSeries(yearQuery.data.data, palette);
        ({ xLabels, helperData, incData, decData, totalData } = built);
      } else if (period === "ربعي" && quarterQuery.data && isWaterfallQuarterResponse(quarterQuery.data)) {
        maxValue = quarterQuery.data.max_value || undefined;
        const built = buildQuarterSeries(quarterQuery.data.periods, palette);
        ({ xLabels, helperData, incData, decData, totalData } = built);
      }

      const connectorMarkLines = buildConnectorMarkLines(xLabels, helperData, incData, decData, totalData);
      const chartWidth = xLabels.length <= 1
        ? 0
        : Math.max(MIN_CHART_WIDTH, xLabels.length * PX_PER_BAR);

      return { xLabels, helperData, incData, decData, totalData, maxValue, chartWidth, connectorMarkLines };
    }, [period, yearQuery.data, quarterQuery.data, palette]);

  // ── Build ECharts option ──────────────────────────────────────────────────
  const option = useMemo(
    () => buildChartOption({ xLabels, helperData, incData, decData, totalData, maxValue, connectorMarkLines, palette, isSinglePeriod }),
    [xLabels, helperData, incData, decData, totalData, maxValue, palette, connectorMarkLines, isSinglePeriod],
  );

  // ── Subtitle hint text ────────────────────────────────────────────────────
  const subtitle = useMemo(() => {
    if (xLabels.length === 0) return "";
    return isSinglePeriod
      ? "عمود الإجمالي (أزرق) = إجمالي الفترة، الجسر يوضح التغييرات (+/-)"
      : `${xLabels.length} عمود: مرر أفقياً لعرض كل الأعمدة • عمود الإجمالي (أزرق) = إجمالي الفترة`;
  }, [xLabels.length, isSinglePeriod]);

  // ── Dropdown options ──────────────────────────────────────────────────────
  const yearToOptions = ALL_YEARS
    .filter((y) => y >= effectiveYearFrom)
    .map((y) => ({ value: String(y), label: String(y) }));

  const isDateRangeActive = Boolean(dateRangeFrom && dateRangeTo);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <ChartCard
        title="عدد المعاملات حسب السنة/الربع والفرع"
        titleFlag="blue"
        subtitle={subtitle}
        height={`${CHART_HEIGHT}px`}
        width={chartWidth === 0 ? "100%" : `${chartWidth}px`}
                titleFlagNumber={6}
        delay={2}
        option={option}
        scrollViewportDir="ltr"
        headerExtra={
          <div className="flex flex-wrap items-center justify-start gap-2">

            {/* Local year-range pickers — only when a global date range is active */}
            {isDateRangeActive && (
              <div className="flex items-center gap-1.5">
                <Dropdown
                  icon={Calendar}
                  label="من"
                  value={String(effectiveYearFrom)}
                  options={ALL_YEAR_OPTIONS}
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

            {/* Granularity toggle — only for multi-year ranges */}
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
                      color:      period === p ? "#2563eb" : "#6b7280",
                      border:     `1px solid ${period === p ? "#93c5fd" : "#e5e7eb"}`,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Quarter year picker */}
            {period === "ربعي" && !isSinglePeriod && (
              <Dropdown
                icon={Calendar}
                label="السنة"
                value={String(yearPick)}
                options={
                  availableYears.length > 0
                    ? availableYears.map((y) => ({ value: String(y), label: String(y) }))
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

      {/* Loading overlay */}
      {isLoading && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}
        >
          <AnalyticsLoader variant="compact" title="جاري تحميل البيانات" />
        </div>
      )}

      {/* Error overlay */}
      {!isLoading && isError && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}
        >
          <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 600 }}>تعذر تحميل البيانات</p>
        </div>
      )}
    </div>
  );
}