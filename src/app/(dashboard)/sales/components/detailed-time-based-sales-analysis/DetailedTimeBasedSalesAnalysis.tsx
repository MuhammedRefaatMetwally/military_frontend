"use client";

import {
  AnalyticsBarCellContent,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import { ChevronDown, TrendingDown, TrendingUp } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import {
  headers,
  salesAnalysisData,
  type SalesAnalysisMonth,
  type SalesAnalysisQuarter,
  type SalesAnalysisYear,
} from "./utils/data";

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
  const totalNet = months.reduce((sum, month) => sum + month.net, 0);

  if (totalNet === 0) return 0;

  return (
    months.reduce((sum, month) => sum + month.margin * month.net, 0) / totalNet
  );
}

function calculateAverage(values: Array<number | null>) {
  const validValues = values.filter((value): value is number => value != null);

  if (!validValues.length) return null;

  return (
    validValues.reduce((sum, value) => sum + value, 0) / validValues.length
  );
}

function getQuarterMonths(quarter: SalesAnalysisQuarter) {
  return quarter.months;
}

function getYearMonths(year: SalesAnalysisYear) {
  return year.quarters.flatMap((quarter) => quarter.months);
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
  const net = months.reduce((sum, month) => sum + month.net, 0);
  const invoices = months.reduce((sum, month) => sum + month.invoices, 0);

  const hasPriorValues = months.some((month) => month.netYoyPrior != null);
  const netYoyPrior = hasPriorValues
    ? months.reduce((sum, month) => sum + (month.netYoyPrior ?? 0), 0)
    : null;

  return {
    net,
    netYoyPrior,
    yoy: calculateYoy(net, netYoyPrior),
    mom: calculateAverage(months.map((month) => month.mom)),
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

function MetricTrend({ value }: { value: number | null }) {
  if (value == null) {
    return <span style={{ color: "var(--text-muted)", fontSize: 10 }}>—</span>;
  }

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
      <td
        style={{
          ...analyticsTdBaseStyle("center"),
          position: "relative",
        }}
      >
        <AnalyticsBarCellContent
          value={metrics.net}
          max={maxNet}
          color={barColor}
          text={formatNumber(metrics.net)}
        />
      </td>

      {metrics.netYoyPrior != null ? (
        <td
          style={{
            ...analyticsTdBaseStyle("center"),
            position: "relative",
          }}
        >
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

      <td
        style={{
          ...analyticsTdBaseStyle("center"),
          position: "relative",
        }}
      >
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
          {subtitle ? (
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </span>
          ) : null}
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
          {subtitle ? (
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      )}
    </td>
  );
}

const DetailedTimeBasedSalesAnalysis = () => {
  const [expandedYears, setExpandedYears] = useState<Set<string>>(
    () => new Set<string>(),
  );

  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(
    () => new Set<string>(),
  );

  const { maxNet, maxInvoices } = useMemo(() => {
    const allMetrics: RollupMetrics[] = [];

    salesAnalysisData.forEach((year) => {
      allMetrics.push(getRollupMetrics(getYearMonths(year)));

      year.quarters.forEach((quarter) => {
        allMetrics.push(getRollupMetrics(getQuarterMonths(quarter)));

        quarter.months.forEach((month) => {
          allMetrics.push(getMonthRollup(month));
        });
      });
    });

    return {
      maxNet: Math.max(...allMetrics.map((metrics) => metrics.net)),
      maxInvoices: Math.max(...allMetrics.map((metrics) => metrics.invoices)),
    };
  }, []);

  const toggleYear = (year: string) => {
    setExpandedYears((current) => {
      const next = new Set(current);

      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }

      return next;
    });
  };

  const toggleQuarter = (quarterKey: string) => {
    setExpandedQuarters((current) => {
      const next = new Set(current);

      if (next.has(quarterKey)) {
        next.delete(quarterKey);
      } else {
        next.add(quarterKey);
      }

      return next;
    });
  };

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
        {salesAnalysisData.map((year) => {
          const yearMetrics = getRollupMetrics(getYearMonths(year));
          const isYearExpanded = expandedYears.has(year.year);

          return (
            <Fragment key={year.year}>
              <tr
                style={{
                  background: "var(--bg-elevated)",
                }}
              >
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

              {isYearExpanded
                ? year.quarters.map((quarter) => {
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

                        {isQuarterExpanded
                          ? quarter.months.map((month) => {
                              const monthMetrics = getMonthRollup(month);

                              return (
                                <tr key={`${quarterKey}-${month.id}`}>
                                  <AccordionLabelCell
                                    label={month.label}
                                    subtitle={month.monthOrderLabel}
                                    depth={2}
                                  />

                                  <MetricsCells
                                    metrics={monthMetrics}
                                    maxNet={maxNet}
                                    maxInvoices={maxInvoices}
                                    barColor="#047857"
                                  />
                                </tr>
                              );
                            })
                          : null}
                      </Fragment>
                    );
                  })
                : null}
            </Fragment>
          );
        })}
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
};

export default DetailedTimeBasedSalesAnalysis;
