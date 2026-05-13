"use client";

import {
  AnalyticsBarCellContent,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import { useDetailedTimeSales } from "@/hooks/useSalesAnalyses";
import { useFilterStore } from "@/store/filterStore";
import { ChevronDown, TrendingDown, TrendingUp } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import {
  headers,
  transformDetailedTimeSales,
  type SalesAnalysisMonth,
  type SalesAnalysisQuarter,
  type SalesAnalysisYear,
} from "./utils/data";
import AnalyticsLoader from "@/components/ui/analytics-loader";

// ── Types ──────────────────────────────────────────────────────────────────────

type RollupMetrics = {
  net: number;
  netYoyPrior: number | null;
  yoy: number | null;
  mom: number | null;
  invoices: number;
  margin: number;
};

// ── Pure Helper Functions ──────────────────────────────────────────────────────

function calculateYoy(net: number, netYoyPrior: number | null) {
  if (netYoyPrior == null || netYoyPrior === 0) return null;
  return ((net - netYoyPrior) / netYoyPrior) * 100;
}

function calculateWeightedMargin(months: SalesAnalysisMonth[]) {
  const totalNet = months.reduce((sum, m) => sum + m.net, 0);
  if (totalNet === 0) return 0;
  return months.reduce((sum, m) => sum + m.margin * m.net, 0) / totalNet;
}

function calculateAverage(values: Array<number | null>) {
  const valid = values.filter((v): v is number => v != null);
  if (!valid.length) return null;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

function getQuarterMonths(q: SalesAnalysisQuarter) {
  return q.months;
}

function getYearMonths(y: SalesAnalysisYear) {
  return y.quarters.flatMap((q) => q.months);
}

function getMonthRollup(month: SalesAnalysisMonth): RollupMetrics {
  return {
    net: month.net,
    netYoyPrior: month.netYoyPrior,
    yoy: calculateYoy(month.net, month.netYoyPrior),
    mom: month.mom,
    invoices: month.invoices,
    margin: month.margin,
  };
}

function getRollupMetrics(months: SalesAnalysisMonth[]): RollupMetrics {
  const net = months.reduce((sum, m) => sum + m.net, 0);
  const invoices = months.reduce((sum, m) => sum + m.invoices, 0);
  const hasPrior = months.some((m) => m.netYoyPrior != null);
  const netYoyPrior = hasPrior
    ? months.reduce((sum, m) => sum + (m.netYoyPrior ?? 0), 0)
    : null;
  return {
    net,
    netYoyPrior,
    yoy: calculateYoy(net, netYoyPrior),
    mom: calculateAverage(months.map((m) => m.mom)),
    invoices,
    margin: calculateWeightedMargin(months),
  };
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

// ── MetricTrend Sub-component ──────────────────────────────────────────────────

function MetricTrend({ value }: { value: number | null }) {
  if (value == null)
    return <span style={{ color: "var(--text-muted)", fontSize: 10 }}>—</span>;
  const isPositive = value >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-semibold"
      style={{
        color: isPositive ? "var(--accent-green)" : "var(--accent-red)",
      }}
      dir="ltr"
    >
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {formatPercent(value)}
    </span>
  );
}

// ── MetricsCells Sub-component ─────────────────────────────────────────────────

function MetricsCells({
  metrics,
  maxNet,
  maxInvoices,
  barColor,
}: {
  metrics: RollupMetrics;
  maxNet: number;
  maxInvoices: number;
  barColor: string;
}) {
  return (
    <>
      <td style={{ ...analyticsTdBaseStyle("center"), position: "relative" }}>
        <AnalyticsBarCellContent
          value={metrics.net}
          max={maxNet}
          color={barColor}
          text={formatNumber(metrics.net)}
        />
      </td>
      {metrics.netYoyPrior != null ? (
        <td style={{ ...analyticsTdBaseStyle("center"), position: "relative" }}>
          <AnalyticsBarCellContent
            value={metrics.netYoyPrior}
            max={maxNet}
            color={barColor}
            text={formatNumber(metrics.netYoyPrior)}
          />
        </td>
      ) : (
        <td style={analyticsTdBaseStyle("center")}>
          <span style={{ color: "var(--text-muted)", fontSize: 10 }}>—</span>
        </td>
      )}
      <td style={analyticsTdBaseStyle("center")}>
        <MetricTrend value={metrics.yoy} />
      </td>
      <td style={analyticsTdBaseStyle("center")}>
        <MetricTrend value={metrics.mom} />
      </td>
      <td style={{ ...analyticsTdBaseStyle("center"), position: "relative" }}>
        <AnalyticsBarCellContent
          value={metrics.invoices}
          max={maxInvoices}
          color={barColor}
          text={formatNumber(metrics.invoices)}
        />
      </td>
      <td style={analyticsTdBaseStyle("center")}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
          dir="ltr"
        >
          {metrics.margin.toFixed(2)}%
        </span>
      </td>
    </>
  );
}

// ── AccordionLabelCell Sub-component ───────────────────────────────────────────

function AccordionLabelCell({
  label,
  subtitle,
  depth,
  isOpen,
  canExpand,
  onToggle,
}: {
  label: string;
  subtitle?: string;
  depth: 0 | 1 | 2;
  isOpen?: boolean;
  canExpand?: boolean;
  onToggle?: () => void;
}) {
  const paddingRight = 12 + depth * 22;
  return (
    <td
      style={{
        ...analyticsTdBaseStyle("right"),
        paddingRight,
        fontSize: 11,
        fontWeight: depth === 0 ? 800 : depth === 1 ? 700 : 600,
        color: depth === 0 ? "var(--text-primary)" : "var(--text-secondary)",
      }}
    >
      {canExpand ? (
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1.5"
          style={{
            border: 0,
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            color: "inherit",
            font: "inherit",
          }}
        >
          <ChevronDown
            size={14}
            style={{
              transition: "transform 160ms ease",
              transform: isOpen ? "rotate(0deg)" : "rotate(90deg)",
            }}
          />
          <span>{label}</span>
          {subtitle && (
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </span>
          )}
        </button>
      ) : (
        <div className="inline-flex items-center gap-1.5">
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 999,
              background: "var(--text-muted)",
              display: "inline-block",
              opacity: 0.65,
            }}
          />
          <span>{label}</span>
          {subtitle && (
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </td>
  );
}

// ── SkeletonRows Sub-component ─────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <tr
          key={i}
          style={{ background: i % 2 === 0 ? "var(--bg-elevated)" : undefined }}
        >
          {[...Array(7)].map((__, j) => (
            <td
              key={j}
              style={analyticsTdBaseStyle(j === 0 ? "right" : "center")}
            >
              <div
                style={{
                  height: 10,
                  borderRadius: 4,
                  width: j === 0 ? 80 : 60,
                  background: "var(--bg-elevated)",
                  animation: "pulse 1.5s ease-in-out infinite",
                  margin: "0 auto",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Helper: build a full inclusive year array from a YYYY-MM-DD range ─────────
//
// deriveDateFilters() in GlobalFilterBar only extracts the FROM year and writes
// it to store.year as a single string — the TO year is never stored separately.
// So "2024-01 → 2026-12" ends up as year="2024", losing 2025 and 2026.
//
// Fix: read the raw dateRangeFrom / dateRangeTo strings (already in the store)
// and derive the full inclusive array here, falling back to store.year when no
// custom range is active (quick-period mode).
function buildYearsArray(
  year: string,
  dateRangeFrom: string,
  dateRangeTo: string,
): number[] | undefined {
  const fromYear = dateRangeFrom
    ? Number(dateRangeFrom.split("-")[0])
    : Number.NaN;
  const toYear = dateRangeTo
    ? Number(dateRangeTo.split("-")[0])
    : Number.NaN;

  if (!Number.isNaN(fromYear) && !Number.isNaN(toYear) && fromYear <= toYear) {
    // Custom range: expand e.g. 2024→2026 into [2024, 2025, 2026]
    return Array.from(
      { length: toYear - fromYear + 1 },
      (_, i) => fromYear + i,
    );
  }

  // Quick-period / single-year fallback
  const y = Number(year);
  return year && !Number.isNaN(y) ? [y] : undefined;
}

// ── Main component ─────────────────────────────────────────────────────────────

const DetailedTimeBasedSalesAnalysis = () => {
  const activeBranches  = useFilterStore((s) => s.activeBranches);
  const region          = useFilterStore((s) => s.region);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory     = useFilterStore((s) => s.subcategory);
  // FIX 2: group3 is stored under the "product" key on the sales page
  const group3          = useFilterStore((s) => s.product);
  const agreement       = useFilterStore((s) => s.agreement);
  const year            = useFilterStore((s) => s.year);
  // FIX 5: month + day act as queryKey discriminators for same-year period changes
  const month           = useFilterStore((s) => s.month);
  const day             = useFilterStore((s) => s.day);
  // NEW: read the raw date range so we can expand multi-year selections
  const dateRangeFrom   = useFilterStore((s) => s.dateRangeFrom);
  const dateRangeTo     = useFilterStore((s) => s.dateRangeTo);

  const params = useMemo(
    () => ({
      // FIX (year range): derive the full inclusive array — "2024 → 2026"
      // now correctly produces [2024, 2025, 2026] instead of just [2024].
      years: buildYearsArray(year, dateRangeFrom, dateRangeTo),

      branchIds:   activeBranches.length > 0  ? activeBranches  : undefined,
      regionIds:   region.length > 0          ? region          : undefined,
      group1Ids:   productCategory.length > 0 ? productCategory : undefined,
      group2Ids:   subcategory.length > 0     ? subcategory     : undefined,
      // FIX 2: pass group3 so the filter actually reaches the API
      group3Ids:   group3.length > 0          ? group3          : undefined,
      // FIX 3: pass first agreement whenever ≥1 selected (not only when === 1)
      agreementId: agreement.length > 0       ? agreement[0]    : undefined,

      // FIX 5: _month/_day are not sent to the API but change the queryKey so
      // React Query refetches when the active period shifts within a year.
      _month: month,
      _day:   day,
    }),
    [
      year, dateRangeFrom, dateRangeTo,
      month, day,
      activeBranches,
      region,
      productCategory,
      subcategory,
      group3,
      agreement,
    ],
  );

  const {
    data: rawData,
    isLoading,
    // FIX 4: isFetching is now consumed for a background-refresh indicator
    isFetching,
    isError,
  } = useDetailedTimeSales(
    // Strip internal discriminator fields before sending to the API
    {
      years:       params.years,
      branchIds:   params.branchIds,
      regionIds:   params.regionIds,
      group1Ids:   params.group1Ids,
      group2Ids:   params.group2Ids,
      group3Ids:   params.group3Ids,
      agreementId: params.agreementId,
    },
    { staleTime: 5 * 60 * 1000 },
  );

  const salesAnalysisData = useMemo<SalesAnalysisYear[]>(
    () => (rawData ? transformDetailedTimeSales(rawData) : []),
    [rawData],
  );

  const [expandedYears, setExpandedYears] = useState<Set<string>>(
    () => new Set(),
  );
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(
    () => new Set(),
  );

  const { maxNet, maxInvoices } = useMemo(() => {
    if (!salesAnalysisData.length) return { maxNet: 1, maxInvoices: 1 };
    const allMetrics: RollupMetrics[] = [];
    salesAnalysisData.forEach((year) => {
      allMetrics.push(getRollupMetrics(getYearMonths(year)));
      year.quarters.forEach((quarter) => {
        allMetrics.push(getRollupMetrics(getQuarterMonths(quarter)));
        quarter.months.forEach((month) =>
          allMetrics.push(getMonthRollup(month)),
        );
      });
    });
    return {
      maxNet:      Math.max(...allMetrics.map((m) => m.net)),
      maxInvoices: Math.max(...allMetrics.map((m) => m.invoices)),
    };
  }, [salesAnalysisData]);

  const toggleYear = (year: string) =>
    setExpandedYears((cur) => {
      const next = new Set(cur);
      next.has(year) ? next.delete(year) : next.add(year);
      return next;
    });

  const toggleQuarter = (key: string) =>
    setExpandedQuarters((cur) => {
      const next = new Set(cur);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <AnalyticsTableCard
      title="التحليل الزمني التفصيلي للمبيعات"
      flag="green"
      titleFlagNumber={4}
      subtitles={
        <p
          className="text-[11px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          صافي المبيعات • صافي المبيعات YoY (العام السابق) • YoY% • MoM% • عدد
          الفواتير • هامش الربح
        </p>
      }
    >
      <AnalyticsTable headers={headers} minWidth={980}>
        {/* ── FIX 4: background-refresh indicator while stale data is shown */}
        {isFetching && !isLoading && (
          <tr>
            <td
              colSpan={7}
              style={{ padding: "4px 0", textAlign: "center" }}
            >
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                جاري التحديث…
              </span>
            </td>
          </tr>
        )}

        {isLoading && salesAnalysisData.length === 0 && (
          <tr>
            <td colSpan={7}>
              <AnalyticsLoader
                variant="compact"
                title="جاري تحميل التحليل الزمني"
              />
            </td>
          </tr>
        )}

        {isError && !isLoading && (
          <tr>
            <td
              colSpan={7}
              style={{
                textAlign: "center",
                padding: 24,
                color: "var(--accent-red)",
                fontSize: 12,
              }}
            >
              حدث خطأ أثناء تحميل البيانات
            </td>
          </tr>
        )}

        {!isLoading && !isError && salesAnalysisData.length === 0 && (
          <tr>
            <td
              colSpan={7}
              style={{
                textAlign: "center",
                padding: 24,
                color: "var(--text-muted)",
                fontSize: 12,
              }}
            >
              لا توجد بيانات متاحة
            </td>
          </tr>
        )}

        {salesAnalysisData.map((year) => {
          const yearMetrics  = getRollupMetrics(getYearMonths(year));
          const isYearExpanded = expandedYears.has(year.year);

          return (
            <Fragment key={year.year}>
              <tr style={{ background: "var(--bg-elevated)" }}>
                <AccordionLabelCell
                  label={year.year}
                  subtitle="السنة"
                  depth={0}
                  canExpand
                  isOpen={isYearExpanded}
                  onToggle={() => toggleYear(year.year)}
                />
                <MetricsCells
                  metrics={yearMetrics}
                  maxNet={maxNet}
                  maxInvoices={maxInvoices}
                  barColor="#3b82f6"
                />
              </tr>

              {isYearExpanded &&
                year.quarters.map((quarter) => {
                  const quarterKey     = `${year.year}-${quarter.id}`;
                  const quarterMetrics = getRollupMetrics(getQuarterMonths(quarter));
                  const isQuarterExpanded = expandedQuarters.has(quarterKey);

                  return (
                    <Fragment key={quarterKey}>
                      <tr
                        style={{
                          background:
                            "color-mix(in srgb, var(--bg-elevated) 55%, transparent)",
                        }}
                      >
                        <AccordionLabelCell
                          label={quarter.label}
                          subtitle="ربع سنوي"
                          depth={1}
                          canExpand
                          isOpen={isQuarterExpanded}
                          onToggle={() => toggleQuarter(quarterKey)}
                        />
                        <MetricsCells
                          metrics={quarterMetrics}
                          maxNet={maxNet}
                          maxInvoices={maxInvoices}
                          barColor="#0891b2"
                        />
                      </tr>

                      {isQuarterExpanded &&
                        quarter.months.map((month) => (
                          <tr key={`${quarterKey}-${month.id}`}>
                            <AccordionLabelCell
                              label={month.label}
                              subtitle={month.monthOrderLabel}
                              depth={2}
                            />
                            <MetricsCells
                              metrics={getMonthRollup(month)}
                              maxNet={maxNet}
                              maxInvoices={maxInvoices}
                              barColor="#047857"
                            />
                          </tr>
                        ))}
                    </Fragment>
                  );
                })}
            </Fragment>
          );
        })}
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
};

export default DetailedTimeBasedSalesAnalysis;