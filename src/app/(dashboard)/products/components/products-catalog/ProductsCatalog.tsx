"use client";

import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import { useFilterStore } from "@/store/filterStore";
import { useProductCatalog } from "@/hooks/useProductAnalysis";
import type { ProductCatalogChild } from "@/api/product-analysis/products-analysis";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";

// --- Local row type (mirrors ProductCatalogChild exactly) ---------------------

type CatalogRow = {
  name: string;
  categoryAr?: string;
  price?: number;
  netSalesValue: number;
  netSalesPct: number; // 0..100
  soldCount: number;
  returnQty: number;
  damagedQty: number;
  marginPct?: number; // 0..100
  children?: CatalogRow[];
};

// --- Formatters ---------------------------------------------------------------

const fmtCurrency = (v: number) => `${Number(v).toLocaleString("en-US")} د.أ`;
const fmtPct = (v: number) => `${v.toFixed(2)}%`;
const fmtInt = (v: number) => Math.round(v).toLocaleString("en-US");

// --- Map API node → CatalogRow (recursive) ------------------------------------
//
// The API already returns a nested tree (ProductCatalogChild with children[]).
// We just reshape the field names so the render logic stays unchanged.

function mapNode(node: ProductCatalogChild): CatalogRow {
  return {
    name: node.name,
    categoryAr: node.categoryAr,
    price: node.price,
    netSalesValue: node.netSalesValue,
    netSalesPct: node.netSalesPct,
    soldCount: node.soldCount,
    returnQty: node.return_product_qty,
    damagedQty: node.num_of_damaged_products,
    marginPct: node.marginPct,
    children: node.children?.map(mapNode),
  };
}

// --- Walk helpers -------------------------------------------------------------

function walkAll(rows: CatalogRow[]): CatalogRow[] {
  const out: CatalogRow[] = [];
  const visit = (r: CatalogRow) => {
    out.push(r);
    r.children?.forEach(visit);
  };
  rows.forEach(visit);
  return out;
}

// --- Skeleton row -------------------------------------------------------------

function SkeletonRow({ depth = 0 }: { depth?: number }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      {[360, 160, 140, 160, 160, 140].map((w, i) => (
        <td key={i} style={analyticsTdBaseStyle(i === 0 ? "right" : "center")}>
          <div
            style={{
              marginLeft: i === 0 ? depth * 24 : 0,
              height: 10,
              width: `${50 + Math.random() * 40}%`,
              borderRadius: 4,
              background: "var(--bg-elevated)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

// --- Main component -----------------------------------------------------------

const ProductsCatalog = () => {
  // -- Filter store ------------------------------------------------------------
  const {
    activeBranches,
    year,
    quarter,
    month,
    dateRangeFrom,
    dateRangeTo,
    isDateRangeApplied,
  } = useFilterStore();

  // The /products page stores G1/G2/G3 in local state inside GlobalFilterBar
  // and does NOT push them to the store (only /sales does).
  // The closest store fields we have are productCategory / subcategory / product
  // which are set by the sales page.  For the products page we read the store
  // versions as a best-effort; if the team later lifts prodG1/G2/G3 to the
  // store this hook will automatically pick them up.
  const productCategory = useFilterStore((s) => s.productCategory); // G1 ids
  const subcategory = useFilterStore((s) => s.subcategory); // G2 ids
  const productFilter = useFilterStore((s) => s.product); // G3 ids

  // -- Build API params --------------------------------------------------------
  const params = useMemo(() => {
    // Prefer explicit date-range when applied, otherwise use derived year/month/quarter
    const useRange = isDateRangeApplied && dateRangeFrom && dateRangeTo;

    return {
      ...(useRange
        ? { fromDate: dateRangeFrom, toDate: dateRangeTo }
        : {
            ...(year ? { years: [Number(year)] } : {}),
            ...(quarter ? { quarter: [Number(quarter)] } : {}),
            ...(month ? { month: [Number(month)] } : {}),
          }),
      branchIds: activeBranches.length ? activeBranches : undefined,
      group1Ids: productCategory.length ? productCategory : undefined,
      group2Ids: subcategory.length ? subcategory : undefined,
      group3Ids: productFilter.length ? productFilter : undefined,
    };
  }, [
    activeBranches,
    year,
    quarter,
    month,
    dateRangeFrom,
    dateRangeTo,
    isDateRangeApplied,
    productCategory,
    subcategory,
    productFilter,
  ]);

  // -- Query -------------------------------------------------------------------
  const { data, isLoading, isError, error } = useProductCatalog(params);

  // -- Expand state ------------------------------------------------------------
  const [catalogExpanded, setCatalogExpanded] = useState<
    Record<string, boolean>
  >({});

  const toggleCatalogRow = (key: string) =>
    setCatalogExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // -- Map API response → CatalogRow[] ----------------------------------------
  const catalogTableData: CatalogRow[] = useMemo(
    () => (data ?? []).map(mapNode),
    [data],
  );

  // -- Derived max values for bar-cell scaling ---------------------------------
  const allRows = useMemo(() => walkAll(catalogTableData), [catalogTableData]);
  const maxSoldCount = useMemo(
    () => Math.max(1, ...allRows.map((r) => r.soldCount)),
    [allRows],
  );
  const maxMarginPct = useMemo(
    () => Math.max(1, ...allRows.map((r) => r.marginPct ?? 0)),
    [allRows],
  );

  // -- Totals (top-level only — the API root nodes already aggregate children) -
  const catalogTotals = useMemo(
    () => ({
      netSalesValue: catalogTableData.reduce((s, r) => s + r.netSalesValue, 0),
      soldCount: catalogTableData.reduce((s, r) => s + r.soldCount, 0),
    }),
    [catalogTableData],
  );

  // -- Row renderer ------------------------------------------------------------
  const renderCatalogRow = (
    row: CatalogRow,
    level: number,
    parentKey: string,
    idx: number,
  ): React.ReactNode[] => {
    const key = `${parentKey}-${idx}`;
    const hasChildren = !!row.children?.length;
    const isOpen = catalogExpanded[key] === true;
    const indent = level * 24;

    const levelColors = [
      "var(--text-secondary)", // G1
      "var(--accent-green)", // G2
      "var(--accent-blue)", // G3
      "var(--text-secondary)", // leaf
    ];
    const chevronColors = [
      "var(--accent-green)",
      "var(--accent-cyan)",
      "var(--accent-blue)",
    ];
    const rowBg = [
      isOpen ? "rgba(4,120,87,0.04)" : "rgba(4,120,87,0.02)",
      isOpen ? "rgba(8,145,178,0.04)" : "rgba(8,145,178,0.02)",
      "rgba(8,145,178,0.02)",
      "transparent",
    ];

    const colorIdx = Math.min(level, levelColors.length - 1);
    const chevronIdx = Math.min(level, chevronColors.length - 1);
    const bgIdx = Math.min(level, rowBg.length - 1);

    const rows: React.ReactNode[] = [
      <tr
        key={key}
        className={
          hasChildren
            ? "cursor-pointer hover:bg-white/1.5 transition-colors"
            : undefined
        }
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: rowBg[bgIdx],
        }}
        onClick={() => hasChildren && toggleCatalogRow(key)}
      >
        {/* Name */}
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
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: isOpen
                    ? "rgba(0,229,160,0.11)"
                    : "var(--bg-elevated)",
                  transition: "all 0.2s",
                }}
              >
                {isOpen ? (
                  <ChevronDown
                    size={11}
                    style={{ color: chevronColors[chevronIdx] }}
                  />
                ) : (
                  <ChevronLeft
                    size={11}
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
              </span>
            ) : (
              <span style={{ width: 16, display: "inline-block" }} />
            )}
            <span
              className="text-xs font-medium"
              style={{ color: levelColors[colorIdx] }}
            >
              {row.name}
            </span>
          </div>
        </td>

        {/* Category */}
        <td style={analyticsTdBaseStyle("center")}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {row.categoryAr ?? "—"}
          </span>
        </td>

        {/* Price */}
        <td style={analyticsTdBaseStyle("center")}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
            dir="ltr"
          >
            {row.price != null ? fmtCurrency(row.price) : "—"}
          </span>
        </td>

        {/* Net Sales % */}
        <AnalyticsBarCell
          value={row.netSalesPct}
          max={100}
          color="#3b82f6"
          text={fmtPct(row.netSalesPct)}
        />

        {/* Sold count */}
        <AnalyticsBarCell
          value={row.soldCount}
          max={maxSoldCount}
          color="#22c55e"
          text={fmtInt(row.soldCount)}
        />

        {/* Margin % */}
        <AnalyticsBarCell
          value={row.marginPct ?? 0}
          max={maxMarginPct}
          color="#a855f7"
          text={fmtPct(row.marginPct ?? 0)}
        />
      </tr>,
    ];

    if (hasChildren && isOpen) {
      row.children!.forEach((child, ci) =>
        rows.push(...renderCatalogRow(child, level + 1, key, ci)),
      );
    }

    return rows;
  };

  // --- Render ----------------------------------------------------------------

  return (
    <AnalyticsTableCard
      title="كتالوج المنتجات"
      flag="green"
      subtitles={
        <>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            الهرم: المجموعة الأولى — المجموعة الثانية — المجموعة الثالثة —
            المواد
          </p>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            صافي المبيعات هنا كنسبة من إجمالي صافي المبيعات • اضغط على أي صف
            للتوسّع
          </p>
        </>
      }
    >
      <AnalyticsTable
        minWidth="980px"
        headers={[
          { label: "المنتج", align: "right", width: "360px" },
          { label: "الفئة", align: "center", width: "160px" },
          { label: "السعر", align: "center", width: "140px" },
          { label: "صافي المبيعات", align: "center", width: "160px" },
          { label: "عدد المواد المباعة", align: "center", width: "160px" },
          { label: "الهامش", align: "center", width: "140px" },
        ]}
      >
        {/* -- Loading skeleton ----------------------------------------------- */}
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} depth={0} />
          ))}

        {isError && (
          <tr>
            <td
              colSpan={6}
              style={{ ...analyticsTdBaseStyle("center"), padding: "32px 0" }}
            >
              <span style={{ fontSize: 12, color: "var(--accent-red)" }}>
                ⚠ تعذّر تحميل البيانات —{" "}
                {(error as unknown as { message?: string })?.message ??
                  "خطأ غير متوقع"}
              </span>
            </td>
          </tr>
        )}

        {/* -- Empty state ---------------------------------------------------- */}
        {!isLoading && !isError && catalogTableData.length === 0 && (
          <tr>
            <td
              colSpan={6}
              style={{ ...analyticsTdBaseStyle("center"), padding: "32px 0" }}
            >
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                لا توجد بيانات للفلاتر المحددة
              </span>
            </td>
          </tr>
        )}

        {/* -- Data rows ------------------------------------------------------ */}
        {!isLoading &&
          !isError &&
          catalogTableData.flatMap((r, i) => renderCatalogRow(r, 0, "cat", i))}

        {/* -- Total row ------------------------------------------------------ */}
        {!isLoading && !isError && catalogTableData.length > 0 && (
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
            <td style={analyticsTdBaseStyle("center")}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
              >
                —
              </span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                —
              </span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                {fmtPct(100)}
              </span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                {fmtInt(catalogTotals.soldCount)}
              </span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                —
              </span>
            </td>
          </tr>
        )}
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
};

export default ProductsCatalog;
