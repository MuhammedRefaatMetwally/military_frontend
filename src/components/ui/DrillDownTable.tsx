"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { AnalyticsLoader } from "@/components/ui/analytics-loader";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import {
  getDetailedSalesBreakdown,
  SalesBreakdownRecord,
} from "@/api/sales-analyses";
import { useDetailedSalesBreakdown } from "@/hooks/useSalesAnalyses";
import { fmt, fmtFull } from "@/api/utils";
import { useFilterStore } from "@/store/filterStore";

// ── Types ──────────────────────────────────────────────────────────────────────

interface RowData {
  id: string;
  name: string;
  grossSales: number;
  netSales: number;
  invoiceCount: number | null;
  discountValue: number;
  discountPct: number;
  returns: number;
  returnedItemCount: number;
  productVolume: number;
  itemCount: number;
  soldMaterialsValue: number;
  avgPrice: number;
  avgDiscRate: number;
  level: "market" | "group1" | "group2" | "group3" | "product";
  children?: RowData[];
  childrenLoaded?: boolean;
  childrenError?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function apiRecordToRowData(
  record: SalesBreakdownRecord,
  level: RowData["level"],
): Omit<RowData, "children" | "childrenLoaded" | "childrenError"> {
  return {
    id: record.id?.toString() || record.name,
    name: record.name,
    grossSales: record.total_sales,
    netSales: record.net_sales,
    invoiceCount: record.invoice_count,
    discountValue: record.discount_value,
    discountPct: record.discount_pct,
    returns: record.return_amount,
    returnedItemCount: record.returned_qty,
    productVolume: record.sold_qty,
    itemCount: record.item_count,
    soldMaterialsValue: record.sold_items_value,
    avgPrice: record.avg_price,
    avgDiscRate: record.return_ratio_pct,
    level,
  };
}

/**
 * Build the years array from the filter store values.
 *
 * Priority:
 *  1. If a dateRangeFrom / dateRangeTo pair is available → expand into every
 *     year in the inclusive range (e.g. "2024-01" → "2026-12" → [2024,2025,2026]).
 *  2. Else if a single `year` string is set → [year].
 *  3. Fallback: current calendar year, so the API never receives an undefined
 *     years param and returns the entire history.
 */
function buildYearsArray(
  year: string,
  dateRangeFrom: string,
  dateRangeTo: string,
): number[] {
  const fromYear = dateRangeFrom ? Number(dateRangeFrom.split("-")[0]) : NaN;
  const toYear   = dateRangeTo   ? Number(dateRangeTo.split("-")[0])   : NaN;

  if (!isNaN(fromYear) && !isNaN(toYear) && fromYear <= toYear) {
    return Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);
  }

  const y = Number(year);
  if (year && !isNaN(y)) return [y];

  // Hard fallback — never send undefined years to the API.
  return [new Date().getFullYear()];
}

// ── Column definitions ─────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "grossSales",         label: "إجمالي المبيعات",      labelEn: "Gross Sales" },
  { key: "netSales",           label: "صافي المبيعات",         labelEn: "Net Sales" },
  { key: "invoiceCount",       label: "عدد الفواتير",          labelEn: "Invoice count" },
  { key: "discountValue",      label: "قيمة الخصم",            labelEn: "Discount Value" },
  { key: "discountPct",        label: "نسبة الخصم",            labelEn: "Discount %" },
  { key: "returns",            label: "المرتجع",               labelEn: "Returns" },
  { key: "returnedItemCount",  label: "عدد المواد المرتجعة",   labelEn: "Returned SKUs" },
  { key: "productVolume",      label: "الكمية",                labelEn: "Quantity" },
  { key: "itemCount",          label: "عدد المواد",            labelEn: "SKU Count" },
  { key: "soldMaterialsValue", label: "سعر المواد المباعة",    labelEn: "Sold Materials Value" },
  { key: "avgPrice",           label: "متوسط السعر",           labelEn: "Avg. Price" },
  { key: "avgDiscRate",        label: "متوسط نسبة الخصم",      labelEn: "Avg. Discount %" },
] as const;

// ── Returns colour tiers ───────────────────────────────────────────────────────

const RETURNS_TIERS = [
  { maxExclusive: 1,        color: "#0a0a0a",  labelAr: "أقل من ١٪" },
  { maxExclusive: 3,        color: "#ea580c",  labelAr: "١٪ – أقل من ٣٪" },
  { maxExclusive: 5,        color: "#fb7185",  labelAr: "٣٪ – أقل من ٥٪" },
  { maxExclusive: 10,       color: "#dc2626",  labelAr: "٥٪ – أقل من ١٠٪" },
  { maxExclusive: Infinity, color: "#7f1d1d",  labelAr: "١٠٪ فأكثر" },
] as const;

function returnsTextColor(grossSales: number, returns: number): string {
  if (grossSales <= 0) return RETURNS_TIERS[0].color;
  const rate = (returns / grossSales) * 100;
  for (const tier of RETURNS_TIERS) {
    if (rate < tier.maxExclusive) return tier.color;
  }
  return RETURNS_TIERS[RETURNS_TIERS.length - 1].color;
}

// ── Visual constants ───────────────────────────────────────────────────────────

const LEVEL_TEXT_COLORS = [
  "var(--text-primary)",
  "var(--accent-green)",
  "var(--accent-cyan)",
  "var(--accent-blue)",
  "var(--text-secondary)",
];

const CHEVRON_COLORS = [
  "var(--accent-green)",
  "var(--accent-green)",
  "var(--accent-cyan)",
  "var(--accent-blue)",
];

const ROW_BG_OPEN = [
  "rgba(4,120,87,0.04)",
  "rgba(8,145,178,0.04)",
  "rgba(8,145,178,0.02)",
  "rgba(8,145,178,0.02)",
  "transparent",
];
const ROW_BG_CLOSED = [
  "transparent",
  "rgba(4,120,87,0.02)",
  "rgba(8,145,178,0.02)",
  "rgba(8,145,178,0.02)",
  "transparent",
];

// ── Drill-down context passed down through recursive render ────────────────────

interface DrillContext {
  branchId?: string;
  group1Id?: string;
  group2Id?: string;
  group3Id?: string;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DrillDownTable() {
  // Read every relevant global filter directly from the store.
  const activeBranches  = useFilterStore((s) => s.activeBranches);
  const region          = useFilterStore((s) => s.region);
  const productCategory = useFilterStore((s) => s.productCategory); // group1
  const subcategory     = useFilterStore((s) => s.subcategory);     // group2
  const group3Filter    = useFilterStore((s) => s.product);          // group3
  const agreement       = useFilterStore((s) => s.agreement);
  const year            = useFilterStore((s) => s.year);
  const dateRangeFrom   = useFilterStore((s) => s.dateRangeFrom);
  const dateRangeTo     = useFilterStore((s) => s.dateRangeTo);

  // Derive full inclusive year array — never undefined.
  const years = useMemo(
    () => buildYearsArray(year, dateRangeFrom, dateRangeTo),
    [year, dateRangeFrom, dateRangeTo],
  );

  // Global filters used only by child drill-down queries (not the market query).
  const regionIds   = region.length > 0         ? region         : undefined;
  const agreementId = agreement.length > 0       ? agreement[0]   : undefined;

  // ── Local state ──────────────────────────────────────────────────────────────
  const [expanded,    setExpanded]    = useState<Record<string, boolean>>({});
  const [rowCache,    setRowCache]    = useState<Map<string, RowData>>(new Map());
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [errorKeys,   setErrorKeys]   = useState<Set<string>>(new Set());

  // ── Top-level market query ───────────────────────────────────────────────────
  // FIX 1: The market-level query must NOT receive branch / group filters.
  // Passing those causes the backend to find no markets that satisfy all
  // constraints simultaneously and return an empty result set.
  // Only `years` and `regionIds` are safe to apply at the market level;
  // everything else belongs to the child drill-down queries.
  const {
    data: marketData,
    isLoading: marketLoading,
    isError: marketError,
    refetch: marketRefetch,
  } = useDetailedSalesBreakdown({
    at: "market",
    years,
    regionIds,
    // Intentionally omit: branchIds, group1Ids, group2Ids, group3Ids, agreementId
  });

  const tableData = useMemo<RowData[]>(() => {
    if (!marketData?.data) return [];
    return marketData.data.map((record: SalesBreakdownRecord) => ({
      ...apiRecordToRowData(record, "market"),
      children: [],
      childrenLoaded: false,
      childrenError: false,
    }));
  }, [marketData?.data]);

  const isEmpty = !marketLoading && !marketError && tableData.length === 0;

  // ── Drill-down child loader ──────────────────────────────────────────────────
  const loadChildren = useCallback(
    async (rowKey: string, row: RowData, ctx: DrillContext) => {
      // Guard: check the live cache, not the stale closure row.
      const liveRow = rowCache.get(rowKey) ?? row;
      if (liveRow.childrenLoaded) return;

      const nextLevel: RowData["level"] =
        row.level === "market"  ? "group1"  :
        row.level === "group1"  ? "group2"  :
        row.level === "group2"  ? "group3"  :
                                  "product";

      setLoadingKeys((prev) => new Set(prev).add(rowKey));
      setErrorKeys((prev) => { const s = new Set(prev); s.delete(rowKey); return s; });

      try {
        // Resolve which IDs to forward to the child query.
        // Each level "absorbs" the ID of the row that was clicked and passes
        // the rest of the ancestor context down unchanged.
        //
        // FIX 2 / FIX 6:
        //   • branchId is always the single market row id — never the
        //     multi-value global activeBranches array.
        //   • Global group filters (productCategory / subcategory / group3)
        //     are applied here at the child level where they're meaningful,
        //     but are overridden by the specific drilled ID when available.
        const branchIdToSend =
          row.level === "market" ? row.id : ctx.branchId;

        // group1: use the clicked row id if we just expanded a group1 row,
        // otherwise inherit from context; fall back to the global filter.
        const group1IdToSend =
          row.level === "group1"
            ? row.id
            : ctx.group1Id;

        const group2IdToSend =
          row.level === "group2"
            ? row.id
            : ctx.group2Id;

        const group3IdToSend =
          row.level === "group3"
            ? row.id
            : ctx.group3Id;

        // Build optional array params — undefined means "no filter".
        const branchIds =
          branchIdToSend ? [branchIdToSend] : undefined;

        // At group1 level: apply global group1 filter unless we have a
        // specific drilled group1 id.
        const group1Ids =
          group1IdToSend
            ? [group1IdToSend]
            : productCategory.length > 0 ? productCategory : undefined;

        const group2Ids =
          group2IdToSend
            ? [group2IdToSend]
            : subcategory.length > 0 ? subcategory : undefined;

        const group3Ids =
          group3IdToSend
            ? [group3IdToSend]
            : group3Filter.length > 0 ? group3Filter : undefined;

        const json = await getDetailedSalesBreakdown({
          at: nextLevel,
          years,
          branchIds,
          regionIds,
          group1Ids,
          group2Ids,
          group3Ids,
          agreementId,
        });

        const children: RowData[] = (json.data ?? []).map(
          (record: SalesBreakdownRecord) => ({
            ...apiRecordToRowData(record, nextLevel),
            children: [],
            childrenLoaded: false,
            childrenError: false,
          }),
        );

        // FIX 3: use the functional updater so we always write onto the
        // latest cache state, not the stale closure snapshot.
        setRowCache((prev) => {
          const latest = prev.get(rowKey) ?? row;
          const next = new Map(prev);
          next.set(rowKey, { ...latest, children, childrenLoaded: true, childrenError: false });
          return next;
        });
      } catch {
        // FIX 3 (catch branch): same functional updater pattern.
        setRowCache((prev) => {
          const latest = prev.get(rowKey) ?? row;
          const next = new Map(prev);
          next.set(rowKey, { ...latest, children: [], childrenLoaded: false, childrenError: true });
          return next;
        });
        setErrorKeys((prev) => new Set(prev).add(rowKey));
      } finally {
        setLoadingKeys((prev) => { const s = new Set(prev); s.delete(rowKey); return s; });
      }
    },
    // FIX: include all global filter values the child queries depend on so the
    // callback is invalidated (and stale child data is cleared) when filters change.
    [
      years,
      regionIds,
      agreementId,
      productCategory,
      subcategory,
      group3Filter,
      rowCache,
    ],
  );

  // ── Toggle expand / collapse ─────────────────────────────────────────────────
  const toggle = useCallback(
    (rowKey: string, row: RowData, ctx: DrillContext) => {
      setExpanded((prev) => {
        const isOpen = prev[rowKey] === true;
        if (isOpen) return { ...prev, [rowKey]: false };

        // FIX 5: check rowCache for the live childrenLoaded flag.
        // The original row object from tableData is never mutated, so
        // its childrenLoaded is always false — causing duplicate fetches.
        const liveRow = rowCache.get(rowKey) ?? row;
        if (!liveRow.childrenLoaded && row.level !== "product") {
          loadChildren(rowKey, row, ctx);
        }
        return { ...prev, [rowKey]: true };
      });
    },
    [loadChildren, rowCache],
  );

  // ── Retry failed child load ──────────────────────────────────────────────────
  const retryChildren = useCallback(
    (rowKey: string, row: RowData, ctx: DrillContext) => {
      setErrorKeys((prev) => { const s = new Set(prev); s.delete(rowKey); return s; });
      loadChildren(rowKey, row, ctx);
    },
    [loadChildren],
  );

  // ── Derived totals & maxima ───────────────────────────────────────────────────
  const totals = useMemo(() => {
    if (!marketData?.totals) return {} as Record<string, number>;
    const t = marketData.totals;
    return {
      grossSales:         t.total_sales,
      netSales:           t.net_sales,
      invoiceCount:       t.invoice_count,
      discountValue:      t.discount_value,
      discountPct:        t.discount_pct,
      returns:            t.return_amount,
      returnedItemCount:  t.returned_qty,
      productVolume:      t.sold_qty,
      itemCount:          t.item_count,
      soldMaterialsValue: t.sold_items_value,
      avgPrice:           t.avg_price,
      avgDiscRate:        t.return_ratio_pct,
    };
  }, [marketData?.totals]);

  const maxByKey = useMemo(() => {
    if (!marketData?.maxima) return {} as Record<string, number>;
    const m = marketData.maxima;
    return {
      grossSales:         m.total_sales,
      netSales:           m.net_sales,
      invoiceCount:       1,
      discountValue:      m.discount_value,
      discountPct:        100,
      returns:            m.return_amount,
      returnedItemCount:  m.returned_qty,
      productVolume:      m.sold_qty,
      itemCount:          m.item_count,
      soldMaterialsValue: m.sold_items_value,
      avgPrice:           m.total_sales / Math.max(1, m.sold_qty),
      avgDiscRate:        100,
    };
  }, [marketData?.maxima]);

  const maxGross = marketData?.maxima?.total_sales ?? 1;

  // ── Recursive row renderer ────────────────────────────────────────────────────
  const renderRow = (
    row: RowData,
    level: number,
    parentKey: string,
    idx: number,
    ctx: DrillContext,           // ancestor drill-down IDs
  ): React.ReactNode[] => {
    const key       = `${parentKey}-${idx}`;
    const cachedRow = rowCache.get(key) ?? row;
    const isOpen    = expanded[key] === true;
    const isChildLoading = loadingKeys.has(key);
    const isChildError   = errorKeys.has(key);
    const canExpand = level < 4;
    const indent    = level * 24;

    const colorIdx   = Math.min(level, LEVEL_TEXT_COLORS.length - 1);
    const chevronIdx = Math.min(level, CHEVRON_COLORS.length - 1);
    const rowBg      = (isOpen ? ROW_BG_OPEN : ROW_BG_CLOSED)[Math.min(level, 4)];

    // Build the context to pass into child rows — each level "captures" its
    // own id so descendants know which ancestor branch / groups they live under.
    const childCtx: DrillContext = {
      branchId: row.level === "market" ? row.id : ctx.branchId,
      group1Id: row.level === "group1" ? row.id : ctx.group1Id,
      group2Id: row.level === "group2" ? row.id : ctx.group2Id,
      group3Id: row.level === "group3" ? row.id : ctx.group3Id,
    };

    const nodes: React.ReactNode[] = [];

    nodes.push(
      <tr
        key={key}
        className={
          canExpand
            ? "cursor-pointer hover:bg-white/[0.015] transition-colors"
            : undefined
        }
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: rowBg,
        }}
        onClick={() => canExpand && toggle(key, cachedRow, ctx)}
      >
        {/* Name cell */}
        <td
          style={{
            ...analyticsTdBaseStyle("right"),
            paddingRight: `${indent + 12}px`,
          }}
        >
          <div className="flex items-center gap-1.5">
            {canExpand ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: isOpen
                    ? "rgba(0,229,160,0.11)"
                    : "var(--bg-elevated)",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                {isChildLoading ? (
                  <Loader2
                    size={10}
                    className="animate-spin"
                    style={{ color: CHEVRON_COLORS[chevronIdx] }}
                  />
                ) : isOpen ? (
                  <ChevronDown
                    size={11}
                    style={{ color: CHEVRON_COLORS[chevronIdx] }}
                  />
                ) : (
                  <ChevronLeft size={11} style={{ color: "var(--text-muted)" }} />
                )}
              </span>
            ) : (
              <span style={{ width: 16, flexShrink: 0, display: "inline-block" }} />
            )}
            <span
              className="text-xs font-medium"
              style={{ color: LEVEL_TEXT_COLORS[colorIdx] }}
            >
              {row.name}
            </span>
          </div>
        </td>

        {/* Data cells */}
        {COLUMNS.map((col) => {
          const val       = (cachedRow as any)[col.key] as number | null;
          const isReturns = col.key === "returns";
          const isPctOnly = col.key === "discountPct" || col.key === "avgDiscRate";

          if (isReturns) {
            return (
              <td key={col.key} style={analyticsTdBaseStyle("center")}>
                <span
                  title={fmtFull(val, col.key)}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color:
                      val !== null
                        ? returnsTextColor(cachedRow.grossSales, val)
                        : "var(--text-muted)",
                    cursor: "default",
                  }}
                  dir="ltr"
                >
                  {fmt(val, col.key)}
                </span>
              </td>
            );
          }

          if (isPctOnly) {
            return (
              <td key={col.key} style={analyticsTdBaseStyle("center")}>
                <span
                  title={fmtFull(val, col.key)}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    cursor: "default",
                  }}
                  dir="ltr"
                >
                  {fmt(val, col.key)}
                </span>
              </td>
            );
          }

          return (
            <td
              key={col.key}
              title={fmtFull(val, col.key)}
              style={{ cursor: "default" }}
            >
              <AnalyticsBarCell
                value={val ?? 0}
                max={(maxByKey as any)[col.key] ?? maxGross}
                color="#3b82f6"
                text={fmt(val, col.key)}
              />
            </td>
          );
        })}
      </tr>,
    );

    // Error row
    if (isOpen && isChildError && !isChildLoading) {
      nodes.push(
        <tr
          key={`${key}-error`}
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <td
            colSpan={COLUMNS.length + 1}
            style={{ padding: "8px 16px", paddingRight: `${indent + 36}px` }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle
                size={12}
                style={{ color: "var(--accent-red)", flexShrink: 0 }}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                تعذر تحميل البيانات
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  retryChildren(key, cachedRow, ctx);
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded transition-opacity hover:opacity-80"
                style={{
                  fontSize: 10,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={9} />
                إعادة المحاولة
              </button>
            </div>
          </td>
        </tr>,
      );
    }

    // Loading row
    if (isOpen && isChildLoading) {
      nodes.push(
        <tr
          key={`${key}-loading`}
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <td
            colSpan={COLUMNS.length + 1}
            style={{ padding: 0, position: "relative", height: 80 }}
          >
            <AnalyticsLoader variant="compact" title="جاري تحميل البيانات" />
          </td>
        </tr>,
      );
    }

    // Recursively render children
    if (isOpen && !isChildLoading && !isChildError && cachedRow.children?.length) {
      cachedRow.children.forEach((child, ci) => {
        nodes.push(...renderRow(child, level + 1, key, ci, childCtx));
      });
    }

    return nodes;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AnalyticsTableCard
      title="تحليل المبيعات التفصيلي — سوق / مجموعات / مادة"
      flag="green"
      titleFlagNumber={5}
      subtitles={
        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
          التسلسل الهرمي: سوق — المجموعة الأولى — المجموعة الثانية — المجموعة
          الثالثة — المادة
        </p>
      }
      headerExtra={
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          <span
            className="font-medium shrink-0"
            style={{ color: "var(--text-secondary)" }}
          >
            ألوان المرتجع (نسبة المرتجع / الإجمالي):
          </span>
          {RETURNS_TIERS.map((tier) => (
            <span key={tier.labelAr} className="inline-flex items-center gap-1">
              <span
                className="inline-block rounded-sm shrink-0"
                style={{
                  width: 10,
                  height: 10,
                  background: tier.color,
                  border: "1px solid var(--border-subtle)",
                }}
              />
              <span>{tier.labelAr}</span>
            </span>
          ))}
        </div>
      }
    >
      <AnalyticsTable
        minWidth="1620px"
        headers={[
          { label: "الاسم", align: "right", width: "160px" },
          ...COLUMNS.map((c) => ({
            label: c.label,
            align: "center" as const,
            width: "110px" as const,
          })),
        ]}
      >
        {/* Loading */}
        {marketLoading && (
          <tr>
            <td
              colSpan={COLUMNS.length + 1}
              style={{ padding: 0, position: "relative", height: 200 }}
            >
              <AnalyticsLoader variant="compact" title="جاري تحميل البيانات" />
            </td>
          </tr>
        )}

        {/* Market-level error */}
        {!marketLoading && marketError && (
          <tr>
            <td
              colSpan={COLUMNS.length + 1}
              style={{ padding: "48px 24px", textAlign: "center" }}
            >
              <div className="flex flex-col items-center gap-3">
                <AlertCircle
                  size={20}
                  style={{ color: "var(--accent-red)", opacity: 0.75 }}
                />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  تعذر تحميل بيانات المبيعات
                </span>
                <button
                  type="button"
                  onClick={() => marketRefetch()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-opacity hover:opacity-80"
                  style={{
                    fontSize: 11,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw size={11} />
                  إعادة المحاولة
                </button>
              </div>
            </td>
          </tr>
        )}

        {/* Empty */}
        {isEmpty && (
          <tr>
            <td
              colSpan={COLUMNS.length + 1}
              style={{ padding: "48px 24px", textAlign: "center" }}
            >
              <div className="flex flex-col items-center gap-2">
                <Inbox size={20} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  لا توجد بيانات للفترة المحددة
                </span>
              </div>
            </td>
          </tr>
        )}

        {/* Data rows — seed with empty DrillContext */}
        {!marketLoading &&
          !marketError &&
          tableData.flatMap((row, bi) =>
            renderRow(row, 0, "root", bi, {}),
          )}

        {/* Totals row */}
        {!marketLoading && !marketError && !isEmpty && (
          <tr
            style={{
              background: "var(--accent-green-dim)",
              borderTop: "2px solid rgba(0,229,160,0.3)",
            }}
          >
            <td style={analyticsTdBaseStyle("right")}>
              <span
                style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-green)" }}
              >
                الإجمالي — Total
              </span>
            </td>
            {COLUMNS.map((col) => {
              const totalVal = (totals as any)[col.key] as number | undefined;
              const totalColor =
                col.key === "returns"
                  ? returnsTextColor(totals.grossSales ?? 0, totals.returns ?? 0)
                  : "var(--text-secondary)";
              return (
                <td key={col.key} style={analyticsTdBaseStyle("center")}>
                  <span
                    title={fmtFull(totalVal ?? null, col.key)}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: totalColor,
                      cursor: "default",
                    }}
                    dir="ltr"
                  >
                    {fmt(totalVal ?? null, col.key)}
                  </span>
                </td>
              );
            })}
          </tr>
        )}
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
}