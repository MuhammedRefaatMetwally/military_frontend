"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import { useHierarchicalSales } from "@/hooks/useSalesAnalyses";
import { useFilterStore } from "@/store/filterStore";
import { TreeItem } from "./components/TreeItem";
import AnalyticsLoader from "@/components/ui/analytics-loader";
import type { HierarchicalSalesParams } from "@/api/sales-analyses";

// ─── Local types ──────────────────────────────────────────────────────────────

interface TreeNode {
  id:     string;
  label:  string;
  value:  number; // aggregated sales
  profit: number; // aggregated profit
}

type AtLevel = "branch" | "group1" | "group2" | "group3" | "product";

interface SelectedLevel {
  at:   AtLevel;
  node: TreeNode;
}

// The API returns one row per entity at year level, but one row per
// (entity × month) when split_by_period=true.  We type the superset.
interface RawRow {
  id:     number;
  code?:  string | number;
  name:   string;
  sales:  number;
  profit: number;
  year?:  number;
  month?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AT_LEVELS: AtLevel[] = [
  "branch",
  "group1",
  "group2",
  "group3",
  "product",
];

const HIERARCHY_TITLES: Record<AtLevel, string> = {
  branch:  "الفرع",
  group1:  "المجموعة الأولى",
  group2:  "المجموعة الثانية",
  group3:  "المجموعة الثالثة",
  product: "المنتج",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeSelections = (values: string[]) =>
  values.filter((v) => v && v !== "all");

const toInt = (s: string): number | undefined => {
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) || s === "" ? undefined : n;
};

/**
 * When split_by_period=true the API emits one row per (entity × month).
 * Collapse them into a single TreeNode per entity by summing sales+profit.
 */
function aggregateRows(rows: RawRow[]): TreeNode[] {
  const map = new Map<
    string,
    { id: string; label: string; sales: number; profit: number }
  >();
  for (const row of rows) {
    const key = String(row.id);
    const hit = map.get(key);
    if (hit) {
      hit.sales  += row.sales;
      hit.profit += row.profit;
    } else {
      map.set(key, {
        id:     key,
        label:  row.name,
        sales:  row.sales,
        profit: row.profit,
      });
    }
  }
  return Array.from(map.values()).map((e) => ({
    id:     e.id,
    label:  e.label,
    value:  e.sales,
    profit: e.profit,
  }));
}

// ─── Per-column filter shape ──────────────────────────────────────────────────

interface ColFilterParams {
  branchIds?:   string[];
  regionIds?:   string[];
  group1Ids?:   string[];
  group2Ids?:   string[];
  group3Ids?:   string[];
  agreementId?: string;
}

// ─── HierarchyColumn ─────────────────────────────────────────────────────────

interface ColumnProps extends ColFilterParams {
  at:              AtLevel;
  years:           number[];
  level:           "year" | "quarter" | "month";
  period:          number[] | undefined;
  selectedNodeId?: string;
  onSelect:        (node: TreeNode) => void;
  onDeselect:      () => void;
  colIdx:          number;
}

function HierarchyColumn({
  at,
  years,
  level,
  period,
  branchIds,
  regionIds,
  group1Ids,
  group2Ids,
  group3Ids,
  agreementId,
  selectedNodeId,
  onSelect,
  onDeselect,
  colIdx,
}: ColumnProps) {
  // For month/quarter levels the period array must be present and non-empty,
  // otherwise the API returns nothing useful.
  const enabled =
    years.length > 0 &&
    (level === "year" || (period !== undefined && period.length > 0));

  // split_by_period=true is required for month/quarter so the API returns
  // per-period rows that we then aggregate into one bar per entity.
  const splitByPeriod = level === "month" || level === "quarter";

  // Build the params object that matches HierarchicalSalesParams exactly.
  const params: HierarchicalSalesParams = {
    at,
    level,
    years,
    splitByPeriod,
    // Only include period when it has values; omitting it for year-level
    // avoids sending ?period= which some backends treat as period=0.
    ...(period?.length    ? { period }      : {}),
    ...(branchIds?.length ? { branchIds }   : {}),
    ...(regionIds?.length ? { regionIds }   : {}),
    ...(group1Ids?.length ? { group1Ids }   : {}),
    ...(group2Ids?.length ? { group2Ids }   : {}),
    ...(group3Ids?.length ? { group3Ids }   : {}),
    ...(agreementId       ? { agreementId } : {}),
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CRITICAL FIX — explicit queryKey that includes EVERY param.
  //
  // salesAnalysesQueryKeys.hierarchicalSales(params) almost certainly builds
  // its key from SalesAnalysisBaseFilters only (years, branchIds, …) and does
  // NOT include `level`, `period`, or `splitByPeriod`.  This means a cached
  // year-level response is silently returned for a month-level query, so the
  // column appears empty (the year cache has data but the month interpretation
  // renders nothing because the items lack a `month` field that triggers the
  // aggregation path — and worse, the year data may have already been shown so
  // React Query considers the query "fresh" and never refetches).
  //
  // By providing our own queryKey that encodes ALL params, every unique
  // combination of (at, level, period, years, filters) gets its own cache
  // slot and the correct API call is always made.
  // ─────────────────────────────────────────────────────────────────────────
  const queryKey = [
    "hierarchical-sales",
    at,
    level,
    splitByPeriod,
    years.join(","),
    (period ?? []).join(","),
    (branchIds  ?? []).join(","),
    (regionIds  ?? []).join(","),
    (group1Ids  ?? []).join(","),
    (group2Ids  ?? []).join(","),
    (group3Ids  ?? []).join(","),
    agreementId ?? "",
  ];

  const { data, isFetching, isError } = useHierarchicalSales(params, {
    enabled,
    queryKey,                    // ← overrides whatever the hook builds internally
    staleTime:            5 * 60_000,
    gcTime:              10 * 60_000,
    refetchOnWindowFocus: false,
    // Keep previous (stale) data visible while a new fetch is in flight so the
    // column doesn't flash blank when filters change.
    placeholderData: (prev: any) => prev,
  });

  // Build display nodes.  For split_by_period responses each entity appears
  // once per month — collapse them.  For year responses each entity appears
  // once already.
  const nodes: TreeNode[] = useMemo(() => {
    if (!data?.data?.length) return [];
    const rows = data.data as RawRow[];
    return splitByPeriod ? aggregateRows(rows) : rows.map((r) => ({
      id:     String(r.id),
      label:  r.name,
      value:  r.sales,
      profit: r.profit,
    }));
  }, [data, splitByPeriod]);

  const maxVal    = nodes.length ? Math.max(...nodes.map((n) => n.value))          : 1;
  const maxSecVal = nodes.length ? Math.max(1, ...nodes.map((n) => n.profit ?? 0)) : 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: colIdx * 0.05 }}
      className="shrink-0 self-stretch flex flex-col"
      style={{ minWidth: "160px", maxWidth: "160px" }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span
          className="text-[10px] font-semibold"
          style={{ color: "var(--text-muted)" }}
        >
          {HIERARCHY_TITLES[at]}
        </span>
        {selectedNodeId && (
          <button
            onClick={onDeselect}
            className="p-0.5 rounded transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Column body */}
      <div
        className="overflow-y-auto flex-1 min-h-0 hide-scrollbar"
        style={{
          maxHeight:        "650px",
          paddingRight:     "2px",
          scrollbarWidth:   "none",
          msOverflowStyle:  "none",
        }}
      >
        {/* Spinner only on initial load — stale data stays visible on refetch */}
        {isFetching && !data && (
          <AnalyticsLoader variant="compact" title="جاري التحميل" />
        )}

        {!isFetching && isError && (
          <p className="text-[11px] text-center py-6" style={{ color: "var(--accent-red)" }}>
            تعذر تحميل البيانات
          </p>
        )}

        {!enabled && !isFetching && (
          <p className="text-[11px] text-center py-6" style={{ color: "var(--text-muted)" }}>
            يرجى تحديد سنة
          </p>
        )}

        {!isFetching && !isError && enabled && nodes.length === 0 && (
          <p className="text-[11px] text-center py-6" style={{ color: "var(--text-muted)" }}>
            لا توجد بيانات
          </p>
        )}

        {!isError &&
          nodes.map((node) => {
            const isSel = selectedNodeId === node.id;
            return (
              <TreeItem
                key={node.id}
                node={node}
                max={maxVal}
                maxSecondary={maxSecVal}
                selected={isSel}
                showLeadArrow={isSel}
                onClick={() => (isSel ? onDeselect() : onSelect(node))}
              />
            );
          })}
      </div>
    </motion.div>
  );
}

// ─── SalesHierarchyAnalysis ───────────────────────────────────────────────────

export default function SalesHierarchyAnalysis() {
  const {
    year:           storeYear,
    month:          storeMonth,
    quarter:        storeQuarter,
    activeBranches,
    region,
    productCategory,
    subcategory,
    product:        storeProduct,
    agreement,
  } = useFilterStore();

  // ── Time dimension ──────────────────────────────────────────────────────────
  //
  // GlobalFilterBar sets year/month/quarter in the store by calling
  // deriveDateFilters(dateFrom, dateTo) whenever the local dateFrom state
  // changes.  For the "month" quick-period chip on the sales page it sets:
  //   year    = "2026"
  //   month   = "05"   ← the calendar month (1-12)
  //   quarter = "2"    ← derived from the same date, also set
  //   day     = "01"
  //
  // Priority: month > quarter > year.  We check month first so that when both
  // month and quarter are set (which always happens), month wins.

  const yearNum    = toInt(storeYear);
  const monthNum   = toInt(storeMonth);
  const quarterNum = toInt(storeQuarter);

  const level: "year" | "quarter" | "month" =
    monthNum   !== undefined ? "month"   :
    quarterNum !== undefined ? "quarter" :
                               "year";

  // years — single-element array; empty disables all queries.
  const years: number[] = yearNum !== undefined ? [yearNum] : [];

  // period — calendar months (1-12) for month level, quarters (1-4) for
  // quarter level, undefined for year level.
  //
  // API contract: "For level=month, period must list one or more calendar
  // months 1-12 (comma-separated)."
  // Example URL: ?years=2026&at=branch&level=month&split_by_period=true&period=5
  const period: number[] | undefined =
    level === "month"   && monthNum   !== undefined ? [monthNum]   :
    level === "quarter" && quarterNum !== undefined ? [quarterNum] :
    undefined;

  // ── Store-level entity filters ──────────────────────────────────────────────
  const storeBranchIds   = normalizeSelections(activeBranches);
  const storeRegionIds   = normalizeSelections(region);
  const storeG1Ids       = normalizeSelections(productCategory);
  const storeG2Ids       = normalizeSelections(subcategory);
  const storeG3Ids       = normalizeSelections(storeProduct);
  // agreement holds string IDs; take the first selected one
  const storeAgreementId = normalizeSelections(agreement)[0] as string | undefined;

  // ── Drill-down path ─────────────────────────────────────────────────────────
  const [path, setPath] = useState<SelectedLevel[]>([]);

  // Reset path whenever the time dimension or top-level entity filters change
  // to avoid stale column selections pointing to nodes outside the new data set.
  const branchKey = storeBranchIds.join(",");
  const regionKey = storeRegionIds.join(",");
  const g1Key     = storeG1Ids.join(",");

  useEffect(() => {
    setPath([]);
  }, [storeYear, storeMonth, storeQuarter, branchKey, regionKey, g1Key]);

  // Scroll back to start when a new column opens
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [path.length]);

  // ── Visible columns ─────────────────────────────────────────────────────────
  const visibleColumns: AtLevel[] = [AT_LEVELS[0]];
  for (let i = 0; i < path.length && i + 1 < AT_LEVELS.length; i++) {
    visibleColumns.push(AT_LEVELS[i + 1]);
  }

  // ── Per-column entity filter params ────────────────────────────────────────
  // years / level / period are identical across all columns and are passed as
  // direct props.  This function handles only the entity-scoped filters that
  // differ per column based on the drill-down path.
  const getColParams = (colIdx: number): ColFilterParams => {
    const selBranchId = path[0]?.node.id;
    const selG1Id     = path[1]?.node.id;
    const selG2Id     = path[2]?.node.id;
    const selG3Id     = path[3]?.node.id;

    const commonRegion    = storeRegionIds.length ? storeRegionIds : undefined;
    const commonAgreement = storeAgreementId;

    // col 0 — Branches ────────────────────────────────────────────────────────
    if (colIdx === 0) {
      return {
        branchIds:   storeBranchIds.length ? storeBranchIds : undefined,
        regionIds:   commonRegion,
        group1Ids:   undefined,
        group2Ids:   undefined,
        group3Ids:   undefined,
        agreementId: commonAgreement,
      };
    }

    const effectiveBranchIds =
      selBranchId
        ? [selBranchId]
        : storeBranchIds.length ? storeBranchIds : undefined;

    // col 1 — Group 1 ─────────────────────────────────────────────────────────
    if (colIdx === 1) {
      return {
        branchIds:   effectiveBranchIds,
        regionIds:   commonRegion,
        group1Ids:   storeG1Ids.length ? storeG1Ids : undefined,
        group2Ids:   undefined,
        group3Ids:   undefined,
        agreementId: commonAgreement,
      };
    }

    const effectiveG1Ids =
      selG1Id
        ? [selG1Id]
        : storeG1Ids.length ? storeG1Ids : undefined;

    // col 2 — Group 2 ─────────────────────────────────────────────────────────
    if (colIdx === 2) {
      return {
        branchIds:   effectiveBranchIds,
        regionIds:   commonRegion,
        group1Ids:   effectiveG1Ids,
        group2Ids:   storeG2Ids.length ? storeG2Ids : undefined,
        group3Ids:   undefined,
        agreementId: commonAgreement,
      };
    }

    const effectiveG2Ids =
      selG2Id
        ? [selG2Id]
        : storeG2Ids.length ? storeG2Ids : undefined;

    // col 3 — Group 3 ─────────────────────────────────────────────────────────
    if (colIdx === 3) {
      return {
        branchIds:   effectiveBranchIds,
        regionIds:   commonRegion,
        group1Ids:   effectiveG1Ids,
        group2Ids:   effectiveG2Ids,
        group3Ids:   storeG3Ids.length ? storeG3Ids : undefined,
        agreementId: commonAgreement,
      };
    }

    // col 4 — Product ─────────────────────────────────────────────────────────
    const effectiveG3Ids =
      selG3Id
        ? [selG3Id]
        : storeG3Ids.length ? storeG3Ids : undefined;

    return {
      branchIds:   effectiveBranchIds,
      regionIds:   commonRegion,
      group1Ids:   effectiveG1Ids,
      group2Ids:   effectiveG2Ids,
      group3Ids:   effectiveG3Ids,
      agreementId: commonAgreement,
    };
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSelect = (colIdx: number, node: TreeNode) => {
    setPath((prev) => [
      ...prev.slice(0, colIdx),
      { at: visibleColumns[colIdx], node },
    ]);
  };

  const handleDeselect = (colIdx: number) => {
    setPath((prev) => prev.slice(0, colIdx));
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <ChartTitleFlagBadge flag="green" flagNumber={3} size="sm" />
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            التحليل الهرمي للمبيعات
          </h3>
        </div>
        <p
          className="text-[11px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          اضغط على أي عنصر للتعمق • الشريط والرقم الأزرق: المبيعات • الأخضر:
          الربح • الفرع ← المجموعة الأولى ← المجموعة الثانية ← المجموعة الثالثة
          ← المنتج
        </p>
      </div>

      {/* Breadcrumb */}
      <AnimatePresence>
        {path.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b overflow-hidden"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div
              className="px-5 py-2.5 flex items-center gap-1 flex-nowrap overflow-x-auto hide-scrollbar"
              dir="rtl"
            >
              <button
                onClick={() => setPath([])}
                className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-md hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-muted)" }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="text-[11px] font-medium">الكل</span>
              </button>

              {path.map((lvl, i) => {
                const isLast = i === path.length - 1;
                return (
                  <React.Fragment key={lvl.node.id}>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 rotate-180"
                      style={{ color: "var(--text-muted)", opacity: 0.4 }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>

                    {isLast ? (
                      <span
                        className="inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                        style={{
                          background: "rgba(37,99,235,0.12)",
                          border:     "1px solid rgba(37,99,235,0.3)",
                          color:      "var(--accent-blue)",
                          maxWidth:   "160px",
                        }}
                      >
                        <span className="truncate" title={lvl.node.label} style={{ minWidth: 0 }}>
                          {lvl.node.label}
                        </span>
                        <button
                          onClick={() => handleDeselect(i)}
                          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                          style={{ color: "var(--accent-blue)", lineHeight: 1 }}
                        >
                          <X size={9} />
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeselect(i + 1)}
                        className="shrink-0 px-2 py-1 rounded-md hover:opacity-70 transition-opacity"
                        style={{ maxWidth: "120px" }}
                        title={lvl.node.label}
                      >
                        <span
                          className="block text-[11px] font-medium truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {lvl.node.label}
                        </span>
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Columns */}
      <div
        ref={scrollRef}
        className="overflow-x-auto p-5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex w-max me-auto gap-2 items-stretch" dir="ltr">
          {visibleColumns.map((at, colIdx) => {
            const p = getColParams(colIdx);
            return (
              <HierarchyColumn
                // Key encodes every param that must cause a remount.
                // Changing level or period must produce a new column instance
                // so stale placeholderData from a different time slice is
                // never shown.
                key={`${at}-${colIdx}-${level}-${period?.join(",") ?? "yr"}`}
                at={at}
                years={years}
                level={level}
                period={period}
                branchIds={p.branchIds}
                regionIds={p.regionIds}
                group1Ids={p.group1Ids}
                group2Ids={p.group2Ids}
                group3Ids={p.group3Ids}
                agreementId={p.agreementId}
                selectedNodeId={path[colIdx]?.node.id}
                onSelect={(node) => handleSelect(colIdx, node)}
                onDeselect={() => handleDeselect(colIdx)}
                colIdx={colIdx}
              />
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 pb-4 pt-0">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span
              className="inline-block rounded-full"
              style={{ width: 22, height: 6, background: "#2563eb" }}
            />
            <span style={{ color: "var(--text-muted)" }}>
              المبيعات (القيمة الأساسية)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="inline-block rounded-full"
              style={{ width: 22, height: 6, background: "#16a34a" }}
            />
            <span style={{ color: "var(--text-muted)" }}>
              الربح (المقياس الثانوي)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}