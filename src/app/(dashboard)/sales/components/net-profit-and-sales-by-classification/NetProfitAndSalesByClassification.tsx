"use client";

import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useSalesProfitByCategory } from "@/hooks/useSalesAnalyses";
import type {
  CategoryRow,
  SalesProfitByCategoryResponse,
} from "@/api/sales-analyses";
import { useFilterStore } from "@/store/filterStore";
import dynamic from "next/dynamic";
import { useMemo, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { AnalyticsLoader } from "@/components/ui/analytics-loader";
import { GroupSelector } from "./components/GroupSelector";
import { Breadcrumb } from "./components/Breadcrumb";
import {
  GROUP_OPTIONS,
  type GroupLevel,
  EMPTY_OPTION,
  CHART_LEGEND,
  CHART_GRID,
  CHART_Y_AXIS,
  BAR_RADIUS,
  normalizeSelections,
  toInt,
} from "./utils/classification.constants";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  { ssr: false, loading: () => <Skeleton variant="chart" /> },
);

type DrillEntry = { level: GroupLevel; name: string; id: string };

// ─── Main Component ───────────────────────────────────────────────────────────

const NetProfitAndSalesByClassification = () => {
  const palette = useResolvedAnalyticsPalette();

  // groupLevel drives the API call; drillStack tracks the breadcrumb trail
  const [groupLevel, setGroupLevel] = useState<GroupLevel>(1);
  const [drillStack, setDrillStack] = useState<DrillEntry[]>([]);

  // ── global filters ────────────────────────────────────────────────────────
  const storeYear = useFilterStore((s) => s.year);
  const storeQuarter = useFilterStore((s) => s.quarter);
  const storeMonth = useFilterStore((s) => s.month);
  const region = useFilterStore((s) => s.region);
  const activeBranches = useFilterStore((s) => s.activeBranches);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory = useFilterStore((s) => s.subcategory);
  const product = useFilterStore((s) => s.product);
  const agreement = useFilterStore((s) => s.agreement);

  const yearNum = toInt(storeYear);
  const monthNum = toInt(storeMonth);
  const quarterNum = toInt(storeQuarter);

  const timeLevel = useMemo<"year" | "quarter" | "month">(() => {
    if (monthNum !== undefined) return "month";
    if (quarterNum !== undefined) return "quarter";
    return "year";
  }, [monthNum, quarterNum]);

  const years = useMemo(
    () => (yearNum !== undefined ? [yearNum] : []),
    [yearNum],
  );

  const period = useMemo<number[] | undefined>(() => {
    if (timeLevel === "month" && monthNum !== undefined) return [monthNum];
    if (timeLevel === "quarter" && quarterNum !== undefined)
      return [quarterNum];
    return undefined;
  }, [timeLevel, monthNum, quarterNum]);

  const agreementId = useMemo(
    () => normalizeSelections(agreement)[0] ?? undefined,
    [agreement],
  );

  // ── drill-aware category filters ─────────────────────────────────────────
  // When drilled, pass the clicked id as the parent group filter
  const group1Ids = useMemo(() => {
    const drilled = drillStack.find((d) => d.level === 1);
    if (drilled) return [drilled.id];
    return normalizeSelections(productCategory);
  }, [drillStack, productCategory]);

  const group2Ids = useMemo(() => {
    const drilled = drillStack.find((d) => d.level === 2);
    if (drilled) return [drilled.id];
    return normalizeSelections(subcategory);
  }, [drillStack, subcategory]);

  const group3Ids = useMemo(() => {
    return normalizeSelections(product);
  }, [product]);

  const enabled =
    years.length > 0 && (timeLevel === "year" || period !== undefined);

  const queryParams = useMemo(
    () => ({
      groupLevel,
      level: timeLevel,
      years,
      period,
      regionIds: normalizeSelections(region),
      branchIds: normalizeSelections(activeBranches),
      group1Ids,
      group2Ids,
      group3Ids,
      agreementId,
    }),
    [
      groupLevel,
      timeLevel,
      years,
      period,
      region,
      activeBranches,
      group1Ids,
      group2Ids,
      group3Ids,
      agreementId,
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

  const chartData: CategoryRow[] =
    (data as SalesProfitByCategoryResponse | undefined)?.data ?? [];

  // Keep a name→id map so we can resolve the clicked bar's id
  const nameToId = useMemo(() => {
    const map = new Map<string, string>();
    chartData.forEach((r) => map.set(r.name, String(r.id ?? r.name)));
    return map;
  }, [chartData]);

  const { labels, quantities, revenues, profits } = useMemo(() => {
    const slice = chartData.slice(0, 10);
    return {
      labels: slice.map((r) => r.name.split(" ").slice(0, 2).join(" ")),
      quantities: slice.map((r) => r.quantity_sold),
      revenues: slice.map((r) => r.sales),
      profits: slice.map((r) => r.profit),
    };
  }, [chartData]);

  // ── drill handlers ────────────────────────────────────────────────────────

  const isDrillable = groupLevel < 3;

  const handleChartClick = useCallback(
    (params: unknown) => {
      if (!isDrillable) return;
      const p = params as { name: string; dataIndex: number };
      const clickedName = p.name;
      // Resolve back to full name from chartData using dataIndex
      const fullName = chartData[p.dataIndex]?.name ?? clickedName;
      const id = nameToId.get(fullName) ?? fullName;

      setDrillStack((prev) => [
        ...prev,
        { level: groupLevel, name: fullName, id },
      ]);
      setGroupLevel((prev) =>
        (prev < 3 ? ((prev + 1) as GroupLevel) : prev),
      );
    },
    [isDrillable, groupLevel, chartData, nameToId],
  );

  // Breadcrumb navigate: pop drill stack back to the clicked crumb index
  const handleBreadcrumbNavigate = useCallback((toIndex: number) => {
    if (toIndex === -1) {
      // Go back to root
      setDrillStack([]);
      setGroupLevel(1);
    } else {
      setDrillStack((prev) => prev.slice(0, toIndex + 1));
      const targetLevel = (toIndex + 2) as GroupLevel; // level after the crumb
      setGroupLevel(targetLevel);
    }
  }, []);

  // When user manually changes group level, reset drill
  const handleGroupLevelChange = useCallback((v: GroupLevel) => {
    setGroupLevel(v);
    setDrillStack([]);
  }, []);

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
        cursor: isDrillable ? "pointer" : "default",
        itemStyle: { color: palette.primaryBlue, borderRadius: BAR_RADIUS },
        emphasis: isDrillable
          ? {
              itemStyle: {
                opacity: 0.75,
                shadowBlur: 8,
                shadowColor: `${palette.primaryBlue}50`,
              },
            }
          : undefined,
      },
      {
        name: "قيمة البيع",
        type: "bar" as const,
        data: revenues,
        yAxisIndex: 1,
        barWidth: 14,
        barGap: "12%",
        cursor: isDrillable ? "pointer" : "default",
        itemStyle: { color: palette.primaryGreen, borderRadius: BAR_RADIUS },
        emphasis: isDrillable
          ? {
              itemStyle: {
                opacity: 0.75,
                shadowBlur: 8,
                shadowColor: `${palette.primaryGreen}50`,
              },
            }
          : undefined,
      },
      {
        name: "الأرباح",
        type: "line" as const,
        data: profits,
        yAxisIndex: 1,
        smooth: true,
        cursor: isDrillable ? "pointer" : "default",
        lineStyle: { color: palette.primaryCyan, width: 2.5 },
        itemStyle: { color: palette.primaryCyan, borderWidth: 2 },
        symbol: "circle" as const,
        symbolSize: 7,
        areaStyle: { color: "rgba(8,145,178,0.07)" },
      },
    ],
    [quantities, revenues, profits, palette, isDrillable],
  );

  const option = useMemo(
    () => ({
      xAxis: {
        type: "category" as const,
        data: labels,
        triggerEvent: isDrillable,
        axisLabel: {
          rotate: 35,
          fontSize: 10,
          color: isDrillable ? palette.primaryGreen : "#94a3b8",
        },
      },
      yAxis: CHART_Y_AXIS,
      series,
      legend: CHART_LEGEND,
      grid: CHART_GRID,
    }),
    [labels, series, isDrillable, palette],
  );

  // ── status helpers ────────────────────────────────────────────────────────

  const isBusy = isLoading || isFetching;
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
          : isDrillable
            ? "انقر على البيانات للتعمق في التفاصيل"
            : "المجموعة الثالثة — لا يوجد مستوى أعمق";

  return (
    <div className="relative">
      {isBusy && (
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
        title="صافي الأرباح والمبيعات حسب التصنيف"
        subtitle={subtitle}
        titleFlag="green"
        titleFlagNumber={2}
        onEvents={{
          click: handleChartClick,
        }}
        headerExtra={
          <div className="flex flex-col items-end gap-2" dir="rtl">
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Breadcrumb — only when drilled */}
              <Breadcrumb
                drillStack={drillStack}
                onNavigate={handleBreadcrumbNavigate}
                accentColor={palette.primaryGreen}
              />

              {drillStack.length > 0 && (
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

              <GroupSelector
                value={groupLevel}
                onChange={handleGroupLevelChange}
                disabled={isBusy}
              />
            </div>
          </div>
        }
        option={showChart ? option : EMPTY_OPTION}
        height="340px"
        delay={2}
      />
    </div>
  );
};

export default NetProfitAndSalesByClassification;
