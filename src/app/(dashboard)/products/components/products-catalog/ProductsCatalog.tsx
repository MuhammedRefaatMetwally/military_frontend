"use client";

import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import { useFilterStore } from "@/store/filterStore";
import { useProductCatalog } from "@/hooks/useProductAnalysis";
import type {
  ProductCatalogChild,
  ProductCatalogParams,
} from "@/api/product-analysis/products-analysis";
import { ChevronDown, ChevronLeft, Loader2 } from "lucide-react";
import { useMemo, useState, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type GroupLevel = "group1" | "group2" | "group3";

type CatalogRow = {
  id: number;
  name: string;
  categoryAr?: string;
  price?: number;
  netSalesValue: number;
  netSalesPct: number;
  soldCount: number;
  returnQty: number;
  damagedQty: number;
  marginPct?: number;
  level: GroupLevel;
  children?: CatalogRow[]; // undefined = not yet fetched; [] = fetched & empty
};

// ─── Level Config ─────────────────────────────────────────────────────────────

/**
 * Describes the relationship between levels for lazy-loading.
 *
 * When the user expands a row at `currentLevel`, we need to:
 *   1. Set group_level = childLevel in the API call
 *   2. Pass parentParam = [row.id] to filter children by the current row
 *
 * Example: expanding a group1 row →
 *   group_level=group2, group1Ids=[row.id]
 *
 * Example: expanding a group2 row →
 *   group_level=group3, group2Ids=[row.id]
 *
 * group3 is the leaf — it has no child level and never triggers a fetch.
 */
type LevelConfig = {
  childLevel: GroupLevel;
  parentParam: keyof ProductCatalogParams; // which param carries the parent's id
};

const LEVEL_CONFIG: Record<string, LevelConfig | null> = {
  group1: { childLevel: "group2", parentParam: "group1Id" },
  group2: { childLevel: "group3", parentParam: "group2Id" },
  group3: null,
};

// ─── Visual Constants ─────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<GroupLevel, string> = {
  group1: "المجموعة الأولى",
  group2: "المجموعة الثانية",
  group3: "المجموعة الثالثة",
};

const LEVEL_TEXT_COLOR: Record<GroupLevel, string> = {
  group1: "var(--text-secondary)",
  group2: "var(--accent-green)",
  group3: "var(--accent-blue)",
};

const CHEVRON_COLOR: Record<GroupLevel, string> = {
  group1: "var(--accent-green)",
  group2: "var(--accent-cyan)",
  group3: "var(--text-muted)",
};

const ROW_BG: Record<GroupLevel, { open: string; closed: string }> = {
  group1: { open: "rgba(4,120,87,0.05)",  closed: "rgba(4,120,87,0.02)"  },
  group2: { open: "rgba(8,145,178,0.05)", closed: "rgba(8,145,178,0.02)" },
  group3: { open: "transparent",          closed: "transparent"           },
};

const BADGE_STYLE: Record<GroupLevel, { bg: string; color: string }> = {
  group1: { bg: "rgba(4,120,87,0.12)",   color: "var(--accent-green)" },
  group2: { bg: "rgba(8,145,178,0.12)",  color: "var(--accent-cyan)"  },
  group3: { bg: "rgba(59,130,246,0.12)", color: "var(--accent-blue)"  },
};

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtCurrency = (v: number) => `${Number(v).toLocaleString("en-US")} د.أ`;
const fmtPct      = (v: number) => `${Number(v).toFixed(2)}%`;
const fmtInt      = (v: number) => Math.round(v).toLocaleString("en-US");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNumIds = (ids: string[]): number[] | undefined => {
  const nums = ids
    .filter((v) => v && v !== "all")
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);
  return nums.length > 0 ? nums : undefined;
};

const buildTimeParams = ({
  year, quarter, month,
  dateRangeFrom, dateRangeTo, isDateRangeApplied,
}: {
  year: string;
  quarter: string;
  month: string;
  dateRangeFrom: string;
  dateRangeTo: string;
  isDateRangeApplied: boolean;
}): Partial<ProductCatalogParams> => {
  const useRange =
    isDateRangeApplied &&
    dateRangeFrom?.length > 0 &&
    dateRangeTo?.length > 0;

  if (useRange) return { fromDate: dateRangeFrom, toDate: dateRangeTo };

  const parsedYear = year ? Number(year) : NaN;
  return {
    ...(parsedYear > 0            ? { years:   [parsedYear]      } : {}),
    ...(quarter && quarter !== "" ? { quarter: [Number(quarter)] } : {}),
    ...(month   && month   !== "" ? { month:   [Number(month)]   } : {}),
  };
};

function mapNode(node: ProductCatalogChild, level: GroupLevel): CatalogRow {
  const isLeaf = LEVEL_CONFIG[level] === null;
  return {
    id:            node.id,
    name:          node.name,
    categoryAr:    node.categoryAr,
    price:         node.price,
    netSalesValue: node.netSalesValue,
    netSalesPct:   node.netSalesPct,
    soldCount:     node.soldCount,
    returnQty:     node.return_product_qty,
    damagedQty:    node.num_of_damaged_products,
    marginPct:     node.marginPct,
    level,
    // Leaves start with [] (no fetch needed); others start with undefined (lazy)
    children: isLeaf ? [] : undefined,
  };
}

function walkAll(rows: CatalogRow[]): CatalogRow[] {
  const out: CatalogRow[] = [];
  const visit = (r: CatalogRow) => {
    out.push(r);
    r.children?.forEach(visit);
  };
  rows.forEach(visit);
  return out;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: GroupLevel }) {
  const { bg, color } = BADGE_STYLE[level];
  return (
    <span style={{
      fontSize: 9, fontWeight: 700,
      padding: "2px 6px", borderRadius: 4,
      background: bg, color,
      letterSpacing: ".3px", whiteSpace: "nowrap",
    }}>
      {LEVEL_LABELS[level]}
    </span>
  );
}

function SkeletonRow({ depth = 0 }: { depth?: number }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      {[360, 160, 140, 160, 160, 140].map((_, i) => (
        <td key={i} style={analyticsTdBaseStyle(i === 0 ? "right" : "center")}>
          <div style={{
            marginRight: i === 0 ? depth * 20 : 0,
            height: 10, width: "60%", borderRadius: 4,
            background: "var(--bg-elevated)",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Expandable Row ───────────────────────────────────────────────────────────

/**
 * CatalogTableRow handles one row and lazily loads its children when expanded.
 *
 * Key API wiring:
 * - On expand, looks up LEVEL_CONFIG[row.level] to get:
 *     childLevel  → becomes group_level in the API call
 *     parentParam → e.g. "group1Ids" or "group2Ids", set to [row.id]
 * - This ensures the backend receives exactly:
 *     group_level=group2&group1=[row.id]   (for a group1 row)
 *     group_level=group3&group2=[row.id]   (for a group2 row)
 */
function CatalogTableRow({
  row,
  depth,
  rowKey,
  maxSoldCount,
  maxMarginPct,
  timeParams,
  branchIds,
}: {
  row: CatalogRow;
  depth: number;
  rowKey: string;
  maxSoldCount: number;
  maxMarginPct: number;
  timeParams: Partial<ProductCatalogParams>;
  branchIds: number[] | undefined;
}) {
  const [isOpen, setIsOpen]       = useState(false);
  const [childRows, setChildRows] = useState<CatalogRow[] | null>(null);

  const levelConfig = LEVEL_CONFIG[row.level]; // null for group3 (leaf)
  const isLeaf      = levelConfig === null;

  /**
   * Build the child query params dynamically:
   *   groupLevel  = childLevel  (e.g. "group2" when expanding a group1 row)
   *   parentParam = [row.id]    (e.g. group1Ids: [row.id])
   *
   * The `parentParam` key changes depending on which level we're expanding,
   * so this computed object always sends the right filter to the backend.
   */
  const childQueryParams = useMemo((): ProductCatalogParams => {
    if (isLeaf || !levelConfig) {
      // Fallback — never actually used because `enabled` is false for leaves
      return { groupLevel: "group1", ...timeParams, branchIds };
    }

    return {
      ...timeParams,
      branchIds,
      groupLevel: levelConfig.childLevel,
      // Dynamically inject e.g. group1Ids: [42] or group2Ids: [99]
      [levelConfig.parentParam]: [row.id],
    };
  }, [isLeaf, levelConfig, timeParams, branchIds, row.id]);

  // Only fetch when: expanded, not a leaf, children not yet cached
  const { data: childData, isLoading: childLoading } = useProductCatalog(
    childQueryParams,
    { enabled: isOpen && !isLeaf && childRows === null },
  );

  // Map and cache children once the API response arrives
  useEffect(() => {
    if (
      childData &&
      Array.isArray(childData) &&
      childRows === null &&
      levelConfig
    ) {
      setChildRows(
        childData.map((c: ProductCatalogChild) =>
          mapNode(c, levelConfig.childLevel)
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childData]);

  const handleToggle = useCallback(() => {
    if (!isLeaf) setIsOpen((prev) => !prev);
  }, [isLeaf]);

  const indent = depth * 20;

  return (
    <>
      <tr
        className={!isLeaf ? "cursor-pointer transition-colors" : undefined}
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: isOpen
            ? ROW_BG[row.level].open
            : ROW_BG[row.level].closed,
        }}
        onClick={handleToggle}
      >
        {/* Name cell */}
        <td style={{ ...analyticsTdBaseStyle("right"), paddingRight: `${indent + 12}px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

            {/* Expand/collapse icon */}
            {!isLeaf ? (
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                background: isOpen ? "rgba(0,229,160,0.11)" : "var(--bg-elevated)",
                transition: "background 0.2s",
              }}>
                {childLoading && isOpen ? (
                  <Loader2
                    size={10}
                    style={{ color: CHEVRON_COLOR[row.level], animation: "spin 1s linear infinite" }}
                  />
                ) : isOpen ? (
                  <ChevronDown size={11} style={{ color: CHEVRON_COLOR[row.level] }} />
                ) : (
                  <ChevronLeft size={11} style={{ color: "var(--text-muted)" }} />
                )}
              </span>
            ) : (
              <span style={{ width: 16, display: "inline-block", flexShrink: 0 }} />
            )}

            <span style={{
              fontSize: 11,
              fontWeight: depth === 0 ? 600 : 500,
              color: LEVEL_TEXT_COLOR[row.level],
              lineHeight: 1.3,
            }}>
              {row.name}
            </span>

            {depth === 0 && <LevelBadge level={row.level} />}
          </div>
        </td>

        {/* Category */}
        <td style={analyticsTdBaseStyle("center")}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)" }}>
            {row.categoryAr ?? "—"}
          </span>
        </td>

        {/* Price */}
        <td style={analyticsTdBaseStyle("center")}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)" }} dir="ltr">
            {row.price != null ? fmtCurrency(row.price) : "—"}
          </span>
        </td>

        {/* Bar cells */}
        <AnalyticsBarCell value={row.netSalesPct}    max={100}          color="#3b82f6" text={fmtPct(row.netSalesPct)}    />
        <AnalyticsBarCell value={row.soldCount}      max={maxSoldCount} color="#22c55e" text={fmtInt(row.soldCount)}       />
        <AnalyticsBarCell value={row.marginPct ?? 0} max={maxMarginPct} color="#a855f7" text={fmtPct(row.marginPct ?? 0)} />
      </tr>

      {/* Loading skeletons while children are fetching */}
      {isOpen && childLoading && !childRows && (
        <>
          <SkeletonRow depth={depth + 1} />
          <SkeletonRow depth={depth + 1} />
          <SkeletonRow depth={depth + 1} />
        </>
      )}

      {/* Empty state */}
      {isOpen && !childLoading && childRows?.length === 0 && (
        <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <td
            colSpan={6}
            style={{
              ...analyticsTdBaseStyle("right"),
              paddingRight: `${indent + 40}px`,
              paddingTop: 8, paddingBottom: 8,
            }}
          >
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>لا توجد عناصر</span>
          </td>
        </tr>
      )}

      {/* Recursive child rows */}
      {isOpen && childRows && childRows.length > 0 &&
        childRows.map((child, ci) => (
          <CatalogTableRow
            key={`${rowKey}-${ci}`}
            row={child}
            depth={depth + 1}
            rowKey={`${rowKey}-${ci}`}
            maxSoldCount={maxSoldCount}
            maxMarginPct={maxMarginPct}
            timeParams={timeParams}
            branchIds={branchIds}
          />
        ))
      }
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductsCatalog = () => {
  const {
    activeBranches,
    year, quarter, month,
    dateRangeFrom, dateRangeTo, isDateRangeApplied,
    productCategory,
    subcategory,
    product: productFilter,
  } = useFilterStore();

  const timeParams = useMemo(
    () => buildTimeParams({ year, quarter, month, dateRangeFrom, dateRangeTo, isDateRangeApplied }),
    [year, quarter, month, dateRangeFrom, dateRangeTo, isDateRangeApplied],
  );

  const branchIds = useMemo(() => toNumIds(activeBranches), [activeBranches]);

  // Root query always starts at group1 — no parent filter needed
  const rootParams = useMemo((): ProductCatalogParams => ({
    ...timeParams,
    groupLevel: "group1",
    branchIds,
    group1Ids: toNumIds(productCategory),
    group2Ids: toNumIds(subcategory),
    group3Ids: toNumIds(productFilter),
  }), [timeParams, branchIds, productCategory, subcategory, productFilter]);

  const { data: rootData, isLoading, isError, error } = useProductCatalog(rootParams);

  const catalogTableData = useMemo(
    () => Array.isArray(rootData)
      ? rootData.map((n: ProductCatalogChild) => mapNode(n, "group1"))
      : [],
    [rootData],
  );

  // Walk all currently-loaded rows to compute bar chart maxes
  const allRows      = useMemo(() => walkAll(catalogTableData),                               [catalogTableData]);
  const maxSoldCount = useMemo(() => Math.max(1, ...allRows.map((r) => r.soldCount)),         [allRows]);
  const maxMarginPct = useMemo(() => Math.max(1, ...allRows.map((r) => r.marginPct ?? 0)),    [allRows]);
  const totalSold    = useMemo(() => catalogTableData.reduce((s, r) => s + r.soldCount, 0),   [catalogTableData]);

  return (
    <AnalyticsTableCard
      title="كتالوج المنتجات"
      flag="green"
      subtitles={
        <>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            الهرم: المجموعة الأولى ← المجموعة الثانية ← المجموعة الثالثة
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            صافي المبيعات كنسبة من الإجمالي • اضغط على أي صف لتحميل المستوى التالي
          </p>
        </>
      }
    >
      <AnalyticsTable
        minWidth="980px"
        headers={[
          { label: "المنتج / المجموعة", align: "right",  width: "360px" },
          { label: "الفئة",              align: "center", width: "160px" },
          { label: "السعر",              align: "center", width: "140px" },
          { label: "صافي المبيعات %",    align: "center", width: "160px" },
          { label: "عدد المباعة",         align: "center", width: "160px" },
          { label: "الهامش %",           align: "center", width: "140px" },
        ]}
      >
        {/* Loading */}
        {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

        {/* Error */}
        {isError && (
          <tr>
            <td colSpan={6} style={{ ...analyticsTdBaseStyle("center"), padding: "32px 0" }}>
              <span style={{ fontSize: 12, color: "var(--accent-red)" }}>
                ⚠ تعذّر تحميل البيانات —{" "}
                {(error as unknown as { message?: string })?.message ?? "خطأ غير متوقع"}
              </span>
            </td>
          </tr>
        )}

        {/* Empty */}
        {!isLoading && !isError && catalogTableData.length === 0 && (
          <tr>
            <td colSpan={6} style={{ ...analyticsTdBaseStyle("center"), padding: "32px 0" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>لا توجد بيانات للفلاتر المحددة</span>
            </td>
          </tr>
        )}

        {/* Data rows */}
        {!isLoading && !isError && catalogTableData.map((row, i) => (
          <CatalogTableRow
            key={`cat-${i}`}
            row={row}
            depth={0}
            rowKey={`cat-${i}`}
            maxSoldCount={maxSoldCount}
            maxMarginPct={maxMarginPct}
            timeParams={timeParams}
            branchIds={branchIds}
          />
        ))}

        {/* Total row */}
        {!isLoading && !isError && catalogTableData.length > 0 && (
          <tr style={{ background: "var(--accent-green-dim)", borderTop: "2px solid rgba(0,229,160,0.3)" }}>
            <td style={analyticsTdBaseStyle("right")}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-green)" }}>الإجمالي — Total</span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)" }}>—</span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)" }} dir="ltr">—</span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)" }} dir="ltr">{fmtPct(100)}</span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)" }} dir="ltr">{fmtInt(totalSold)}</span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)" }} dir="ltr">—</span>
            </td>
          </tr>
        )}
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
};

export default ProductsCatalog;