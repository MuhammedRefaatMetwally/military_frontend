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

// ── All pure helpers (unchanged) ──────────────────────────────────────────────

type RollupMetrics = {
  net: number;
  netYoyPrior: number | null;
  yoy: number | null;
  mom: number | null;
  invoices: number;
  margin: number;
};

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

// ── Sub-components (unchanged) ────────────────────────────────────────────────

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

// ── Main component ─────────────────────────────────────────────────────────────

const DetailedTimeBasedSalesAnalysis = () => {
  // ── Read only the relevant sales filter fields from the store ────────────
  const activeBranches = useFilterStore((s) => s.activeBranches);
  const region = useFilterStore((s) => s.region);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory = useFilterStore((s) => s.subcategory);
  const agreement = useFilterStore((s) => s.agreement);
  const year = useFilterStore((s) => s.year);

  // ── Build params — only pass non-empty values to the API ─────────────────
  //
  //  The API treats missing params as "no filter" (returns all data).
  //  Passing empty arrays or empty strings would cause a 400/empty response,
  //  so we only include a field when the user has actually selected something.
  //
  const params = useMemo(
    () => ({
      // year is always present (defaults to current year in filterStore)
      years: year ? [Number(year)] : undefined,

      // multi-select filters — only send when user picked at least one
      branchIds: activeBranches.length > 0 ? activeBranches : undefined,
      regionIds: region.length > 0 ? region : undefined,
      group1Ids: productCategory.length > 0 ? productCategory : undefined,
      group2Ids: subcategory.length > 0 ? subcategory : undefined,
      // group3Ids — not exposed in the sales filter bar for this endpoint
      agreementId: agreement.length === 1 ? agreement[0] : undefined,
    }),
    [year, activeBranches, region, productCategory, subcategory, agreement],
  );

  // ── Data fetching ─────────────────────────────────────────────────────────
  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
  } = useDetailedTimeSales(params, {
    staleTime: 5 * 60 * 1000,
  });

  // ── Transform API response → component data shape ─────────────────────────
  const salesAnalysisData = useMemo<SalesAnalysisYear[]>(
    () => (rawData ? transformDetailedTimeSales(rawData) : []),
    [rawData],
  );

  // ── Accordion state ───────────────────────────────────────────────────────
  const [expandedYears, setExpandedYears] = useState<Set<string>>(
    () => new Set(),
  );
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(
    () => new Set(),
  );

  // ── Bar-chart max values ──────────────────────────────────────────────────
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
      maxNet: Math.max(...allMetrics.map((m) => m.net)),
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

  // ── Render ────────────────────────────────────────────────────────────────
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
            const yearMetrics = getRollupMetrics(getYearMonths(year));
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
                    const quarterKey = `${year.year}-${quarter.id}`;
                    const quarterMetrics = getRollupMetrics(
                      getQuarterMonths(quarter),
                    );
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
