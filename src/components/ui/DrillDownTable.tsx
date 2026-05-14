"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
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

function buildYearsArray(
  year: string,
  dateRangeFrom: string,
  dateRangeTo: string,
): number[] {
  const fromYear = dateRangeFrom ? Number(dateRangeFrom.split("-")[0]) : NaN;
  const toYear = dateRangeTo ? Number(dateRangeTo.split("-")[0]) : NaN;

  if (!isNaN(fromYear) && !isNaN(toYear) && fromYear <= toYear) {
    return Array.from(
      { length: toYear - fromYear + 1 },
      (_, i) => fromYear + i,
    );
  }

  const y = Number(year);
  if (year && !isNaN(y)) return [y];

  return [new Date().getFullYear()];
}

// ── Column definitions ─────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "grossSales", label: "إجمالي المبيعات", labelEn: "Gross Sales" },
  { key: "netSales", label: "صافي المبيعات", labelEn: "Net Sales" },
  { key: "invoiceCount", label: "عدد الفواتير", labelEn: "Invoice count" },
  { key: "discountValue", label: "قيمة الخصم", labelEn: "Discount Value" },
  { key: "discountPct", label: "نسبة الخصم", labelEn: "Discount %" },
  { key: "returns", label: "المرتجع", labelEn: "Returns" },
  {
    key: "returnedItemCount",
    label: "عدد المواد المرتجعة",
    labelEn: "Returned SKUs",
  },
  { key: "productVolume", label: "الكمية", labelEn: "Quantity" },
  { key: "itemCount", label: "عدد المواد", labelEn: "SKU Count" },
  {
    key: "soldMaterialsValue",
    label: "سعر المواد المباعة",
    labelEn: "Sold Materials Value",
  },
  { key: "avgPrice", label: "متوسط السعر", labelEn: "Avg. Price" },
  { key: "avgDiscRate", label: "متوسط نسبة الخصم", labelEn: "Avg. Discount %" },
] as const;

// ── Returns colour tiers ───────────────────────────────────────────────────────

const RETURNS_TIERS = [
  { maxExclusive: 1, color: "#0a0a0a", labelAr: "أقل من ١٪" },
  { maxExclusive: 3, color: "#ea580c", labelAr: "١٪ – أقل من ٣٪" },
  { maxExclusive: 5, color: "#fb7185", labelAr: "٣٪ – أقل من ٥٪" },
  { maxExclusive: 10, color: "#dc2626", labelAr: "٥٪ – أقل من ١٠٪" },
  { maxExclusive: Infinity, color: "#7f1d1d", labelAr: "١٠٪ فأكثر" },
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

// ── Columns that show a thin blue left-bar indicator ──────────────────────────
const BAR_INDICATOR_KEYS = new Set([
  "grossSales",
  "netSales",
  "discountValue",
  "productVolume",
  "soldMaterialsValue",
  "avgPrice",
  "invoiceCount",
  "returnedItemCount",
  "itemCount",
]);

// ── Shared cell padding — single source of truth ─────────────────────────────
// All data cells use identical horizontal padding so numbers start at the
// exact same x-position in every row, regardless of level or type.
const CELL_PADDING_H = "0 12px";

// ── Cell with a short rounded accent bar to the right of the value ───────────
// FIX: bar is now placed to the RIGHT of the text (leading side in RTL),
// the container uses `justify-content: flex-end` so values right-align
// uniformly under their column headers. Uniform padding via CELL_PADDING_H.
function AccentBarCell({
  text,
  title,
  value,
  max,
  barColor = "rgba(99,155,255,0.55)",
  textColor,
}: {
  text: string;
  title: string;
  value: number;
  max: number;
  barColor?: string;
  textColor?: string;
}) {
  const MIN_H = 4;
  const MAX_H = 20;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const barHeight = Math.round(MIN_H + ratio * (MAX_H - MIN_H));

  return (
    <td
      title={title}
      style={{
        padding: CELL_PADDING_H,
        verticalAlign: "middle",
        height: 36,
        whiteSpace: "nowrap",
        textAlign: "right",
        direction: "rtl",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          direction: "ltr",   // keeps bar+number in physical left→right order
        }}
      >
        {/* Accent bar — sits to the left of the number physically */}
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: barHeight,
            borderRadius: 99,
            background: barColor,
            flexShrink: 0,
          }}
        />
        {/* Numeric value */}
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: textColor ?? "var(--text-primary)",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.01em",
          }}
        >
          {text}
        </span>
      </span>
    </td>
  );
}

// ── Plain text cell (no bar) ──────────────────────────────────────────────────
// FIX: same padding and height as AccentBarCell so all cells are vertically
// identical. Right-aligned content to stay consistent with AccentBarCell.
function PlainCell({
  text,
  title,
  color,
}: {
  text: string;
  title: string;
  color?: string;
}) {
  return (
    <td
      title={title}
      style={{
        padding: CELL_PADDING_H,
        verticalAlign: "middle",
        height: 36,
        textAlign: "right",
        direction: "rtl",
        whiteSpace: "nowrap",
        cursor: "default",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: color ?? "var(--text-secondary)",
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.01em",
          direction: "ltr",
          display: "inline-block",
        }}
      >
        {text}
      </span>
    </td>
  );
}

// ── Drill-down context passed down through recursive render ────────────────────

interface DrillContext {
  branchId?: string;
  group1Id?: string;
  group2Id?: string;
  group3Id?: string;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DrillDownTable() {
  const activeBranches = useFilterStore((s) => s.activeBranches);
  const region = useFilterStore((s) => s.region);
  const productCategory = useFilterStore((s) => s.productCategory);
  const subcategory = useFilterStore((s) => s.subcategory);
  const group3Filter = useFilterStore((s) => s.product);
  const agreement = useFilterStore((s) => s.agreement);
  const year = useFilterStore((s) => s.year);
  const dateRangeFrom = useFilterStore((s) => s.dateRangeFrom);
  const dateRangeTo = useFilterStore((s) => s.dateRangeTo);

  const years = useMemo(
    () => buildYearsArray(year, dateRangeFrom, dateRangeTo),
    [year, dateRangeFrom, dateRangeTo],
  );

  const regionIds = region.length > 0 ? region : undefined;
  const agreementId = agreement.length > 0 ? agreement[0] : undefined;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [rowCache, setRowCache] = useState<Map<string, RowData>>(new Map());
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [errorKeys, setErrorKeys] = useState<Set<string>>(new Set());

  const {
    data: marketData,
    isLoading: marketLoading,
    isError: marketError,
    refetch: marketRefetch,
  } = useDetailedSalesBreakdown({
    at: "market",
    years,
    regionIds,
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

  const loadChildren = useCallback(
    async (rowKey: string, row: RowData, ctx: DrillContext) => {
      const liveRow = rowCache.get(rowKey) ?? row;
      if (liveRow.childrenLoaded) return;

      const nextLevel: RowData["level"] =
        row.level === "market"
          ? "group1"
          : row.level === "group1"
            ? "group2"
            : row.level === "group2"
              ? "group3"
              : "product";

      setLoadingKeys((prev) => new Set(prev).add(rowKey));
      setErrorKeys((prev) => {
        const s = new Set(prev);
        s.delete(rowKey);
        return s;
      });

      try {
        const branchIdToSend = row.level === "market" ? row.id : ctx.branchId;
        const group1IdToSend = row.level === "group1" ? row.id : ctx.group1Id;
        const group2IdToSend = row.level === "group2" ? row.id : ctx.group2Id;
        const group3IdToSend = row.level === "group3" ? row.id : ctx.group3Id;

        const branchIds = branchIdToSend ? [branchIdToSend] : undefined;
        const group1Ids = group1IdToSend
          ? [group1IdToSend]
          : productCategory.length > 0
            ? productCategory
            : undefined;
        const group2Ids = group2IdToSend
          ? [group2IdToSend]
          : subcategory.length > 0
            ? subcategory
            : undefined;
        const group3Ids = group3IdToSend
          ? [group3IdToSend]
          : group3Filter.length > 0
            ? group3Filter
            : undefined;

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

        setRowCache((prev) => {
          const latest = prev.get(rowKey) ?? row;
          const next = new Map(prev);
          next.set(rowKey, {
            ...latest,
            children,
            childrenLoaded: true,
            childrenError: false,
          });
          return next;
        });
      } catch {
        setRowCache((prev) => {
          const latest = prev.get(rowKey) ?? row;
          const next = new Map(prev);
          next.set(rowKey, {
            ...latest,
            children: [],
            childrenLoaded: false,
            childrenError: true,
          });
          return next;
        });
        setErrorKeys((prev) => new Set(prev).add(rowKey));
      } finally {
        setLoadingKeys((prev) => {
          const s = new Set(prev);
          s.delete(rowKey);
          return s;
        });
      }
    },
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

  const toggle = useCallback(
    (rowKey: string, row: RowData, ctx: DrillContext) => {
      setExpanded((prev) => {
        const isOpen = prev[rowKey] === true;
        if (isOpen) return { ...prev, [rowKey]: false };

        const liveRow = rowCache.get(rowKey) ?? row;
        if (!liveRow.childrenLoaded && row.level !== "product") {
          loadChildren(rowKey, row, ctx);
        }
        return { ...prev, [rowKey]: true };
      });
    },
    [loadChildren, rowCache],
  );

  const retryChildren = useCallback(
    (rowKey: string, row: RowData, ctx: DrillContext) => {
      setErrorKeys((prev) => {
        const s = new Set(prev);
        s.delete(rowKey);
        return s;
      });
      loadChildren(rowKey, row, ctx);
    },
    [loadChildren],
  );

  const totals = useMemo(() => {
    if (!marketData?.totals) return {} as Record<string, number>;
    const t = marketData.totals;
    return {
      grossSales: t.total_sales,
      netSales: t.net_sales,
      invoiceCount: t.invoice_count,
      discountValue: t.discount_value,
      discountPct: t.discount_pct,
      returns: t.return_amount,
      returnedItemCount: t.returned_qty,
      productVolume: t.sold_qty,
      itemCount: t.item_count,
      soldMaterialsValue: t.sold_items_value,
      avgPrice: t.avg_price,
      avgDiscRate: t.return_ratio_pct,
    };
  }, [marketData?.totals]);

  const maxByKey = useMemo(() => {
    if (!marketData?.maxima) return {} as Record<string, number>;
    const m = marketData.maxima;
    return {
      grossSales: m.total_sales,
      netSales: m.net_sales,
      invoiceCount: 1,
      discountValue: m.discount_value,
      discountPct: 100,
      returns: m.return_amount,
      returnedItemCount: m.returned_qty,
      productVolume: m.sold_qty,
      itemCount: m.item_count,
      soldMaterialsValue: m.sold_items_value,
      avgPrice: m.total_sales / Math.max(1, m.sold_qty),
      avgDiscRate: 100,
    };
  }, [marketData?.maxima]);

  const maxGross = marketData?.maxima?.total_sales ?? 1;

  // ── Recursive row renderer ────────────────────────────────────────────────────
  const renderRow = (
    row: RowData,
    level: number,
    parentKey: string,
    idx: number,
    ctx: DrillContext,
  ): React.ReactNode[] => {
    const key = `${parentKey}-${idx}`;
    const cachedRow = rowCache.get(key) ?? row;
    const isOpen = expanded[key] === true;
    const isChildLoading = loadingKeys.has(key);
    const isChildError = errorKeys.has(key);
    const canExpand = level < 4;

    // FIX: indent only shifts the name cell content, not via padding-right
    // on the cell itself, so that the cell's width stays stable across levels.
    // Using a fixed icon column width (20px) + indent gap keeps the chevron
    // icon perfectly aligned in the same column at every depth.
    const indent = level * 20;

    const colorIdx = Math.min(level, LEVEL_TEXT_COLORS.length - 1);
    const chevronIdx = Math.min(level, CHEVRON_COLORS.length - 1);
    const rowBg = (isOpen ? ROW_BG_OPEN : ROW_BG_CLOSED)[Math.min(level, 4)];

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
          // FIX: fixed row height so all rows are uniform regardless of content
          height: 36,
        }}
        onClick={() => canExpand && toggle(key, cachedRow, ctx)}
      >
        {/* ── Name cell ────────────────────────────────────────────────────── */}
        {/*
          FIX: remove per-level paddingRight from the TD itself. Instead we
          push the indent into an inline spacer element. This means the TD
          always has the same right-padding (12px) and the chevron icon column
          stays pinned at the same physical position for all levels.
        */}
        <td
          style={{
            ...analyticsTdBaseStyle("right"),
            paddingRight: 12,
            paddingLeft: 8,
            verticalAlign: "middle",
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            {/* Indent spacer — grows with depth, keeps icon column stable */}
            {indent > 0 && (
              <span
                aria-hidden
                style={{ display: "inline-block", width: indent, flexShrink: 0 }}
              />
            )}

            {/* Chevron / loading icon — fixed 18×18 box */}
            {canExpand ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  background: isOpen
                    ? "rgba(0,229,160,0.11)"
                    : "var(--bg-elevated)",
                  transition: "background 0.2s",
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
                  <ChevronLeft
                    size={11}
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
              </span>
            ) : (
              /* Leaf-level placeholder keeps text indent consistent */
              <span
                style={{ width: 18, height: 18, flexShrink: 0, display: "inline-block" }}
              />
            )}

            {/* Row label — single line, full name always visible */}
            <span
              className="text-xs font-medium"
              style={{
                color: LEVEL_TEXT_COLORS[colorIdx],
                whiteSpace: "nowrap",
                lineHeight: 1.4,
              }}
            >
              {row.name}
            </span>
          </div>
        </td>

        {/* ── Data cells ──────────────────────────────────────────────────── */}
        {COLUMNS.map((col) => {
          const val = (cachedRow as any)[col.key] as number | null;
          const isReturns = col.key === "returns";
          const isPctOnly =
            col.key === "discountPct" || col.key === "avgDiscRate";
          const hasPipe = BAR_INDICATOR_KEYS.has(col.key);

          if (isReturns) {
            const retColor =
              val !== null
                ? returnsTextColor(cachedRow.grossSales, val)
                : "var(--text-muted)";
            return (
              <AccentBarCell
                key={col.key}
                text={fmt(val, col.key)}
                title={fmtFull(val, col.key)}
                value={val ?? 0}
                max={(maxByKey as any)[col.key] ?? maxGross}
                barColor={retColor}
                textColor={retColor}
              />
            );
          }

          if (isPctOnly) {
            return (
              <PlainCell
                key={col.key}
                text={fmt(val, col.key)}
                title={fmtFull(val, col.key)}
                color="var(--text-secondary)"
              />
            );
          }

          if (hasPipe) {
            return (
              <AccentBarCell
                key={col.key}
                text={fmt(val, col.key)}
                title={fmtFull(val, col.key)}
                value={val ?? 0}
                max={(maxByKey as any)[col.key] ?? maxGross}
                barColor="rgba(99,155,255,0.55)"
              />
            );
          }

          return (
            <PlainCell
              key={col.key}
              text={fmt(val, col.key)}
              title={fmtFull(val, col.key)}
            />
          );
        })}
      </tr>,
    );

    // ── Error row ─────────────────────────────────────────────────────────────
    if (isOpen && isChildError && !isChildLoading) {
      nodes.push(
        <tr
          key={`${key}-error`}
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <td
            colSpan={COLUMNS.length + 1}
            style={{
              padding: "8px 16px",
              // FIX: match indent so error message lines up with child rows
              paddingRight: indent + 12 + 18 + 6,
              verticalAlign: "middle",
            }}
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

    // ── Loading row ───────────────────────────────────────────────────────────
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

    // ── Children ──────────────────────────────────────────────────────────────
    if (
      isOpen &&
      !isChildLoading &&
      !isChildError &&
      cachedRow.children?.length
    ) {
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
        <p
          className="text-[11px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
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
        minWidth="1280px"
        headers={[
          { label: "الاسم", align: "right", width: "220px" },
          ...COLUMNS.map((c) => ({
            label: c.label,
            align: "right" as const,
            width: "88px" as const,
          })),
        ]}
      >
        {/* ── Loading ────────────────────────────────────────────────────── */}
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

        {/* ── Market-level error ─────────────────────────────────────────── */}
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

        {/* ── Empty ─────────────────────────────────────────────────────── */}
        {isEmpty && (
          <tr>
            <td
              colSpan={COLUMNS.length + 1}
              style={{ padding: "48px 24px", textAlign: "center" }}
            >
              <div className="flex flex-col items-center gap-2">
                <Inbox
                  size={20}
                  style={{ color: "var(--text-muted)", opacity: 0.4 }}
                />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  لا توجد بيانات للفترة المحددة
                </span>
              </div>
            </td>
          </tr>
        )}

        {/* ── Data rows ─────────────────────────────────────────────────── */}
        {!marketLoading &&
          !marketError &&
          tableData.flatMap((row, bi) => renderRow(row, 0, "root", bi, {}))}

        {/* ── Totals row ────────────────────────────────────────────────── */}
        {!marketLoading && !marketError && !isEmpty && (
          <tr
            style={{
              background: "var(--accent-green-dim)",
              borderTop: "2px solid rgba(0,229,160,0.3)",
              height: 36,
            }}
          >
            <td
              style={{
                ...analyticsTdBaseStyle("right"),
                paddingRight: 12,
                verticalAlign: "middle",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--accent-green)",
                }}
              >
                الإجمالي — Total
              </span>
            </td>
            {COLUMNS.map((col) => {
              const totalVal = (totals as any)[col.key] as number | undefined;
              const isReturns = col.key === "returns";
              const totalColor = isReturns
                ? returnsTextColor(totals.grossSales ?? 0, totals.returns ?? 0)
                : "var(--text-secondary)";
              return (
                <td
                  key={col.key}
                  style={{
                    padding: CELL_PADDING_H,
                    verticalAlign: "middle",
                    textAlign: "right",
                    direction: "rtl",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    title={fmtFull(totalVal ?? null, col.key)}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: totalColor,
                      cursor: "default",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "0.01em",
                      direction: "ltr",
                      display: "inline-block",
                    }}
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