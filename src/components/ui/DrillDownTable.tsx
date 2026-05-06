"use client";

import React, { useState, useMemo, useCallback } from "react";
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

function fmt(v: number | null, key: string): string {
  if (v === null) return "—";
  if (key === "avgPrice") return v.toFixed(2);
  if (key === "discountPct" || key === "avgDiscRate") return `${v.toFixed(2)}%`;
  if (
    key === "itemCount" ||
    key === "invoiceCount" ||
    key === "returnedItemCount"
  )
    return Math.round(v).toLocaleString("en-US");
  if (key === "returns") return v.toFixed(2);
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

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

interface DrillDownTableProps {
  years?: string;
  branch?: string;
  region?: string;
}

export default function DrillDownTable({
  years = "2026",
  branch,
  region,
}: DrillDownTableProps) {
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
    years: years ? years.split(",").map(Number) : undefined,
    branchIds: branch, //  branch ? branch.split(",") : undefined
    regionIds: region ? region.split(",") : undefined,
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
    async (
      rowKey: string,
      row: RowData,
      parentBranchId: string,
      parentGroup1Id?: string,
      parentGroup2Id?: string,
      parentGroup3Id?: string,
    ) => {
      if (row.childrenLoaded) return;
  
      const nextLevel =
        row.level === "market"  ? "group1"  :
        row.level === "group1"  ? "group2"  :
        row.level === "group2"  ? "group3"  : "product";
  
      setLoadingKeys((prev) => new Set(prev).add(rowKey));
      setErrorKeys((prev) => { const s = new Set(prev); s.delete(rowKey); return s; });
  
      try {
        const branchIdToSend  = row.level === "market" ? row.id : parentBranchId;
        const group1IdToSend  = row.level === "group1" ? row.id : parentGroup1Id;
        const group2IdToSend  = row.level === "group2" ? row.id : parentGroup2Id;
        const group3IdToSend  = row.level === "group3" ? row.id : parentGroup3Id;
  
        const json = await getDetailedSalesBreakdown({
          at:        nextLevel,
          years:     years ? years.split(",").map(Number) : undefined,
          branchIds: branchIdToSend  || undefined,
          group1Ids: group1IdToSend  ? [group1IdToSend]  : undefined,
          group2Ids: group2IdToSend  ? [group2IdToSend]  : undefined,
          group3Ids: group3IdToSend  ? [group3IdToSend]  : undefined,
        });
  
        const children: RowData[] = (json.data ?? []).map((record: SalesBreakdownRecord) => ({
          ...apiRecordToRowData(record, nextLevel as RowData["level"]),
          children:       [],
          childrenLoaded: false,
          childrenError:  false,
        }));
  
        setRowCache((prev) => {
          const next = new Map(prev);
          next.set(rowKey, { ...row, children, childrenLoaded: true, childrenError: false });
          return next;
        });
      } catch {
        setRowCache((prev) => {
          const next = new Map(prev);
          next.set(rowKey, { ...row, children: [], childrenLoaded: false, childrenError: true });
          return next;
        });
        setErrorKeys((prev) => new Set(prev).add(rowKey));
      } finally {
        setLoadingKeys((prev) => { const s = new Set(prev); s.delete(rowKey); return s; });
      }
    },
    [years],
  );

  const toggle = useCallback(
    (
      rowKey: string,
      row: RowData,
      parentBranchId?: string,
      parentGroup1Id?: string,
      parentGroup2Id?: string,
      parentGroup3Id?: string,
    ) => {
      setExpanded((prev) => {
        const isOpen = prev[rowKey] === true;
        if (isOpen) return { ...prev, [rowKey]: false };
  
        if (!row.childrenLoaded && row.level !== "product") {
          const branchId = row.level === "market" ? row.id : parentBranchId;
          const group1Id = row.level === "group1" ? row.id : parentGroup1Id;
          const group2Id = row.level === "group2" ? row.id : parentGroup2Id;
          const group3Id = row.level === "group3" ? row.id : parentGroup3Id;
          loadChildren(rowKey, row, branchId ?? "", group1Id, group2Id, group3Id);
        }
        return { ...prev, [rowKey]: true };
      });
    },
    [loadChildren],
  );

  const retryChildren = useCallback(
    (
      rowKey: string,
      row: RowData,
      parentBranchId?: string,
      parentGroup1Id?: string,
      parentGroup2Id?: string,
      parentGroup3Id?: string,
    ) => {
      setErrorKeys((prev) => { const s = new Set(prev); s.delete(rowKey); return s; });
      loadChildren(rowKey, row, parentBranchId ?? "", parentGroup1Id, parentGroup2Id, parentGroup3Id);
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

  const renderRow = (
    row: RowData,
    level: number,
    parentKey: string,
    idx: number,
    activeBranchId?: string,
    activeGroup1Id?: string,
    activeGroup2Id?: string,
    activeGroup3Id?: string,
  ): React.ReactNode[] => {
    const key        = `${parentKey}-${idx}`;
    const cachedRow  = rowCache.get(key) ?? row;
    const isOpen     = expanded[key] === true;
    const isChildLoading = loadingKeys.has(key);
    const isChildError   = errorKeys.has(key);
    const canExpand  = level < 4;
    const indent     = level * 24;
  
    const colorIdx   = Math.min(level, LEVEL_TEXT_COLORS.length - 1);
    const chevronIdx = Math.min(level, CHEVRON_COLORS.length - 1);
    const rowBg      = (isOpen ? ROW_BG_OPEN : ROW_BG_CLOSED)[Math.min(level, 4)];
  
    // Compute what each child level will need
    const nextBranchId = row.level === "market" ? row.id : activeBranchId;
    const nextGroup1Id = row.level === "group1" ? row.id : activeGroup1Id;
    const nextGroup2Id = row.level === "group2" ? row.id : activeGroup2Id;
    const nextGroup3Id = row.level === "group3" ? row.id : activeGroup3Id;
  
    const nodes: React.ReactNode[] = [];
  
    nodes.push(
      <tr
        key={key}
        className={canExpand ? "cursor-pointer hover:bg-white/[0.015] transition-colors" : undefined}
        style={{ borderBottom: "1px solid var(--border-subtle)", background: rowBg }}
        onClick={() =>
          canExpand &&
          toggle(key, cachedRow, activeBranchId, activeGroup1Id, activeGroup2Id, activeGroup3Id)
        }
      >
        {/* Name cell */}
        <td style={{ ...analyticsTdBaseStyle("right"), paddingRight: `${indent + 12}px` }}>
          <div className="flex items-center gap-1.5">
            {canExpand ? (
              <span
                style={{
                  display:        "inline-flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  width:          16,
                  height:         16,
                  borderRadius:   4,
                  background:     isOpen ? "rgba(0,229,160,0.11)" : "var(--bg-elevated)",
                  transition:     "all 0.2s",
                  flexShrink:     0,
                }}
              >
                {isChildLoading ? (
                  <Loader2 size={10} className="animate-spin" style={{ color: CHEVRON_COLORS[chevronIdx] }} />
                ) : isOpen ? (
                  <ChevronDown size={11} style={{ color: CHEVRON_COLORS[chevronIdx] }} />
                ) : (
                  <ChevronLeft size={11} style={{ color: "var(--text-muted)" }} />
                )}
              </span>
            ) : (
              <span style={{ width: 16, flexShrink: 0, display: "inline-block" }} />
            )}
            <span className="text-xs font-medium" style={{ color: LEVEL_TEXT_COLORS[colorIdx] }}>
              {row.name}
            </span>
          </div>
        </td>
  
        {/* Data cells — unchanged */}
        {COLUMNS.map((col) => {
          const val       = (cachedRow as any)[col.key] as number | null;
          const isReturns = col.key === "returns";
          const isPctOnly = col.key === "discountPct" || col.key === "avgDiscRate";
  
          if (isReturns) {
            return (
              <td key={col.key} style={analyticsTdBaseStyle("center")}>
                <span
                  style={{
                    fontSize:   10,
                    fontWeight: 600,
                    color: val !== null ? returnsTextColor(cachedRow.grossSales, val) : "var(--text-muted)",
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
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)" }} dir="ltr">
                  {fmt(val, col.key)}
                </span>
              </td>
            );
          }
  
          return (
            <AnalyticsBarCell
              key={col.key}
              value={val ?? 0}
              max={(maxByKey as any)[col.key] ?? maxGross}
              color="#3b82f6"
              text={fmt(val, col.key)}
            />
          );
        })}
      </tr>,
    );
  
    // Error row
    if (isOpen && isChildError && !isChildLoading) {
      nodes.push(
        <tr key={`${key}-error`} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <td colSpan={COLUMNS.length + 1} style={{ padding: "8px 16px", paddingRight: `${indent + 36}px` }}>
            <div className="flex items-center gap-2">
              <AlertCircle size={12} style={{ color: "var(--accent-red)", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>تعذر تحميل البيانات</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  retryChildren(key, cachedRow, activeBranchId, activeGroup1Id, activeGroup2Id, activeGroup3Id);
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded transition-opacity hover:opacity-80"
                style={{
                  fontSize:   10,
                  background: "var(--bg-elevated)",
                  border:     "1px solid var(--border-subtle)",
                  color:      "var(--text-secondary)",
                  cursor:     "pointer",
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
        <tr key={`${key}-loading`} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <td colSpan={COLUMNS.length + 1} style={{ padding: 0, position: "relative", height: 80 }}>
            <AnalyticsLoader variant="compact" title="جاري تحميل البيانات" />
          </td>
        </tr>,
      );
    }
  
    // Recursively render children — pass all computed next ids
    if (isOpen && !isChildLoading && !isChildError && cachedRow.children?.length) {
      cachedRow.children.forEach((child, ci) => {
        nodes.push(
          ...renderRow(child, level + 1, key, ci, nextBranchId, nextGroup1Id, nextGroup2Id, nextGroup3Id),
        );
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
        {/* Loading state — centered loader */}
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

        {/* Empty state */}
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

        {/* Data rows */}
        {!marketLoading && !marketError && tableData.flatMap((row, bi) =>
  renderRow(row, 0, "root", bi, branch, undefined, undefined, undefined)
)}

        {/* Total row — only when data available */}
        {!marketLoading && !marketError && !isEmpty && (
          <tr
            style={{
              background: "var(--accent-green-dim)",
              borderTop: "2px solid rgba(0,229,160,0.3)",
            }}
          >
            <td style={analyticsTdBaseStyle("right")}>
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
              const totalColor =
                col.key === "returns"
                  ? returnsTextColor(
                      totals.grossSales ?? 0,
                      totals.returns ?? 0,
                    )
                  : "var(--text-secondary)";
              return (
                <td key={col.key} style={analyticsTdBaseStyle("center")}>
                  <span
                    style={{ fontSize: 10, fontWeight: 700, color: totalColor }}
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
