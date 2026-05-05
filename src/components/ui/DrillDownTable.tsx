"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ChevronDown, ChevronLeft, Loader2 } from "lucide-react";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import { SalesBreakdownRecord, useSalesBreakdownData } from "@/hooks/use-sales-breakdown-data";

// ── Types ──
interface RowData {
  id: string; // Unique key for caching
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
  level: 'market' | 'group1' | 'group2' | 'group3' | 'product';
  children?: RowData[];
  childrenLoaded?: boolean;
}

// ── Helper to convert API response to RowData ──
function apiRecordToRowData(
  record: SalesBreakdownRecord,
  level: 'market' | 'group1' | 'group2' | 'group3' | 'product',
): Omit<RowData, "children" | "childrenLoaded"> {
  return {
    id: record.id?.toString() || record.name,
    name: record.name,
    grossSales: record.total_sales,
    netSales: record.net_sales,
    invoiceCount: record.invoice_count, // null for drill-down levels
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

// ── Columns definition ──
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
];

/** شرائح لون عمود المرتجع: نسبة المرتجع على الإجمالي (مرتجع / إجمالي × 100). */
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

// ── Main Component ──
interface DrillDownTableProps {
  years?: string; // CSV: "2017,2018,2026"
  branch?: string; // CSV: "51,52,53"
  region?: string; // Single region ID
}

export default function DrillDownTable({ years = "2026", branch, region }: DrillDownTableProps) {
  // State for drill-down and caching
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [rowCache, setRowCache] = useState<Map<string, RowData>>(new Map());

  // Fetch market-level data
  const { data: marketData, isLoading: marketLoading } = useSalesBreakdownData({
    at: "market",
    years,
    region,
  });

  // Build initial rows from market data
  const tableData = useMemo<RowData[]>(() => {
    if (!marketData?.data) return [];
    return marketData.data.map((record) => ({
      ...apiRecordToRowData(record, "market"),
      children: [],
      childrenLoaded: false,
    }));
  }, [marketData?.data]);

  // Lazy-load children on expand
  const loadChildren = useCallback(
    async (rowKey: string, row: RowData, parentBranchId: string) => {
      if (row.childrenLoaded || !row.name) return;

      const nextLevel = row.level === "market" ? "group1" : 
                        row.level === "group1" ? "group2" : 
                        row.level === "group2" ? "group3" : "product";

      // Build filter params based on drill-down level
      const filters: any = {
        at: nextLevel,
        years,
      };

      // Add accumulated branch filter
      if (parentBranchId) filters.branch = parentBranchId;

      // Fetch next level
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://military-project-6jpnk.ondigitalocean.app"}/api/datasorce/sales-analyses/detailed-sales-breakdown?` +
        new URLSearchParams(filters).toString()
      );

      if (response.ok) {
        const data = await response.json();
        const children: RowData[] = data.data.map((record: SalesBreakdownRecord) => ({
          ...apiRecordToRowData(record, nextLevel),
          children: [],
          childrenLoaded: false,
        }));

        // Update row in cache
        const updatedRow: RowData = {
          ...row,
          children,
          childrenLoaded: true,
        };

        setRowCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(rowKey, updatedRow);
          return newCache;
        });
      }
    },
    [years]
  );

  const toggle = (rowKey: string, row: RowData, parentBranchId?: string) => {
    setExpanded((prev) => {
      const isOpen = prev[rowKey] === true;
      if (isOpen) {
        // Close and collapse children
        const next: Record<string, boolean> = { ...prev };
        next[rowKey] = false;
        return next;
      } else {
        // Open and load children if needed
        if (!row.childrenLoaded && row.level !== "product") {
          loadChildren(rowKey, row, parentBranchId || "");
        }
        return { ...prev, [rowKey]: true };
      }
    });
  };

  // Compute totals from API response
  const totals = useMemo(() => {
    if (!marketData?.totals) return {};
    return {
      grossSales: marketData.totals.total_sales,
      netSales: marketData.totals.net_sales,
      invoiceCount: marketData.totals.invoice_count,
      discountValue: marketData.totals.discount_value,
      discountPct: marketData.totals.discount_pct,
      returns: marketData.totals.return_amount,
      returnedItemCount: marketData.totals.returned_qty,
      productVolume: marketData.totals.sold_qty,
      itemCount: marketData.totals.item_count,
      soldMaterialsValue: marketData.totals.sold_items_value,
      avgPrice: marketData.totals.avg_price,
      avgDiscRate: marketData.totals.return_ratio_pct,
    };
  }, [marketData?.totals]);

  // Use API maxima for scaling
  const maxByKey = useMemo(() => {
    if (!marketData?.maxima) return {};
    return {
      grossSales: marketData.maxima.total_sales,
      netSales: marketData.maxima.net_sales,
      invoiceCount: 1,
      discountValue: marketData.maxima.discount_value,
      discountPct: 100,
      returns: marketData.maxima.return_amount,
      returnedItemCount: marketData.maxima.returned_qty,
      productVolume: marketData.maxima.sold_qty,
      itemCount: marketData.maxima.item_count,
      soldMaterialsValue: marketData.maxima.sold_items_value,
      avgPrice: marketData.maxima.total_sales / Math.max(1, marketData.maxima.sold_qty),
      avgDiscRate: 100,
    };
  }, [marketData?.maxima]);

  const maxGross = marketData?.maxima?.total_sales || 1;

  const fmt = (v: number | null, key: string) => {
    if (v === null) return "—";
    if (key === "avgPrice") return v.toFixed(2);
    if (key === "discountPct" || key === "avgDiscRate")
      return `${v.toFixed(2)}%`;
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
  };

  const renderRow = (
    row: RowData,
    level: number,
    parentKey: string,
    idx: number,
  ) => {
    const key = `${parentKey}-${idx}`;
    const hasChildren = !row.childrenLoaded ? level < 4 : (row.children && row.children.length > 0); // Can expand to next level
    const isOpen = expanded[key] === true;
    const isLoadingChildren = expanded[key] === true && !row.childrenLoaded && hasChildren;
    const indent = level * 24;

    const levelColors = [
      "var(--text-primary)", // سوق
      "var(--accent-green)", // المجموعة الاولى
      "var(--accent-cyan)", // المجموعة الثانية
      "var(--accent-blue)", // المجموعة الثالثة
      "var(--text-secondary)", // المادة
    ];
    const chevronIconOpen = [
      "var(--accent-green)",
      "var(--accent-green)",
      "var(--accent-cyan)",
      "var(--accent-blue)",
    ];
    const colorIdx = Math.min(level, levelColors.length - 1);
    const chevronIdx = Math.min(level, chevronIconOpen.length - 1);

    const rowBgByLevel = [
      isOpen ? "rgba(4,120,87,0.04)" : "transparent",
      isOpen ? "rgba(8,145,178,0.04)" : "rgba(4,120,87,0.02)",
      "rgba(8,145,178,0.02)",
      "rgba(8,145,178,0.02)",
      "transparent",
    ];

    const rows: React.ReactNode[] = [];

    rows.push(
      <tr
        key={key}
        className={
          hasChildren
            ? "cursor-pointer hover:bg-white/1.5 transition-colors"
            : undefined
        }
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: rowBgByLevel[Math.min(level, rowBgByLevel.length - 1)],
        }}
        onClick={() => hasChildren && toggle(key, row, branch)}
      >
        {/* Name column */}
        <td
          style={{
            ...analyticsTdBaseStyle("right"),
            paddingRight: `${indent + 12}px`,
          }}
        >
          <div className="flex items-center gap-1.5">
            {hasChildren ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "16px",
                  height: "16px",
                  borderRadius: "4px",
                  background: isOpen
                    ? "rgba(0,229,160,0.11)"
                    : "var(--bg-elevated)",
                  transition: "all 0.2s",
                }}
              >
                {isLoadingChildren ? (
                  <Loader2
                    size={10}
                    className="animate-spin"
                    style={{ color: chevronIconOpen[chevronIdx] }}
                  />
                ) : isOpen ? (
                  <ChevronDown
                    size={11}
                    style={{ color: chevronIconOpen[chevronIdx] }}
                  />
                ) : (
                  <ChevronLeft
                    size={11}
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
              </span>
            ) : (
              <span style={{ width: "16px", display: "inline-block" }} />
            )}
            <span
              className="text-xs font-medium"
              style={{ color: levelColors[colorIdx] }}
            >
              {row.name}
            </span>
          </div>
        </td>

        {/* Data columns */}
        {COLUMNS.map((col) => {
          const val = (row as any)[col.key] as number | null;
          const isReturnsCol = col.key === "returns";
          const isDiscPct = col.key === "discountPct";
          const isAvgDisc = col.key === "avgDiscRate";

          if (isReturnsCol) {
            return (
              <td key={col.key} style={analyticsTdBaseStyle("center")}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: val !== null ? returnsTextColor(row.grossSales, val) : "var(--text-muted)",
                  }}
                  dir="ltr"
                >
                  {fmt(val, col.key)}
                </span>
              </td>
            );
          }

          if (isDiscPct || isAvgDisc) {
            return (
              <td key={col.key} style={analyticsTdBaseStyle("center")}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                  dir="ltr"
                >
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
              color={isReturnsCol ? "#ef4444" : "#3b82f6"}
              text={fmt(val, col.key)}
            />
          );
        })}
      </tr>,
    );

    // Render children
    if (hasChildren && isOpen && row.children && row.children.length > 0) {
      row.children.forEach((child, ci) => {
        rows.push(...renderRow(child, level + 1, key, ci));
      });
    }

    return rows;
  };

  if (marketLoading) {
    return (
      <AnalyticsTableCard
        title="تحليل المبيعات التفصيلي — سوق / مجموعات / مادة"
        flag="green"
        titleFlagNumber={5}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span>جاري تحميل البيانات...</span>
        </div>
      </AnalyticsTableCard>
    );
  }

  return (
    <AnalyticsTableCard
      title="تحليل المبيعات التفصيلي — سوق / مجموعات / مادة"
      flag="green"
      titleFlagNumber={5}
      subtitles={
        <>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            التسلسل الهرمي: سوق — المجموعة الاولى — المجموعة الثانية — المجموعة
            الثالثة — المادة
          </p>
        </>
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
        {tableData.flatMap((branch, bi) => renderRow(branch, 0, "root", bi))}

        {/* Total row */}
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
                ? returnsTextColor(totals.grossSales || 0, totals.returns || 0)
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
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
}
