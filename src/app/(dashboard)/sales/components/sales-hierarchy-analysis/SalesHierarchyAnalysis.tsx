"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import { useHierarchicalSales } from "@/hooks/useSalesAnalyses";
import { useFilterStore } from "@/store/filterStore";
import { TreeItem } from "./components/TreeItem";
import AnalyticsLoader from "@/components/ui/analytics-loader";

interface TreeNode {
  id: string;
  label: string;
  value: number; // sales
  profit: number;
}

type AtLevel = "branch" | "group1" | "group2" | "group3" | "product";

interface SelectedLevel {
  at: AtLevel;
  node: TreeNode;
}

const AT_LEVELS: AtLevel[] = [
  "branch",
  "group1",
  "group2",
  "group3",
  "product",
];

const HIERARCHY_TITLES: Record<AtLevel, string> = {
  branch: "الفرع",
  group1: "المجموعة الأولى",
  group2: "المجموعة الثانية",
  group3: "المجموعة الثالثة",
  product: "المنتج",
};

function secondarySalesMetric(node: TreeNode): number {
  return node.profit ?? 0;
}

const normalizeSelections = (values: string[]) =>
  values.filter((v) => v && v !== "all");

const toInt = (s: string): number | undefined => {
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) || s === "" ? undefined : n;
};

function ColumnSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-md p-2 animate-pulse"
          style={{ background: "var(--bg-elevated)", height: 72 }}
        />
      ))}
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

interface ColumnProps {
  at: AtLevel;
  years: number[];
  level: "year" | "quarter" | "month";
  period?: number[];
  branchIds?: string[];
  regionIds?: string[];
  group1Ids?: string[];
  group2Ids?: string[];
  group3Ids?: string[];
  agreementId?: string;
  selectedNodeId?: string;
  onSelect: (node: TreeNode) => void;
  onDeselect: () => void;
  colIdx: number;
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
  const enabled =
    years.length > 0 && (level !== "month" || (period ?? []).length > 0);

  const params = {
    at,
    level,
    years,
    ...(period?.length ? { period } : {}),
    ...(branchIds?.length ? { branchIds } : {}),
    ...(regionIds?.length ? { regionIds } : {}),
    ...(group1Ids?.length ? { group1Ids } : {}),
    ...(group2Ids?.length ? { group2Ids } : {}),
    ...(group3Ids?.length ? { group3Ids } : {}),
    ...(agreementId ? { agreementId } : {}),
    splitByPeriod: false,
  };

  const { data, isFetching, isError } = useHierarchicalSales(params, {
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const nodes: TreeNode[] = React.useMemo(() => {
    if (!data?.data?.length) return [];
    return data.data.map((item) => ({
      id: String(item.id),
      label: item.name,
      value: item.sales,
      profit: item.profit,
    }));
  }, [data]);

  const maxVal = nodes.length ? Math.max(...nodes.map((n) => n.value)) : 1;
  const maxSecVal = nodes.length
    ? Math.max(1, ...nodes.map(secondarySalesMetric))
    : 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: colIdx * 0.05 }}
      className="shrink-0 self-stretch flex flex-col"
      style={{ minWidth: "160px", maxWidth: "160px" }}
    >
      {/* Header */}
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

      {/* Body */}
      <div
        className="overflow-y-auto flex-1 min-h-0"
        style={{ maxHeight: "650px", paddingRight: "2px" }}
      >
        {isFetching && (
          <AnalyticsLoader variant="compact" title="جاري التحميل" />
        )}

        {!isFetching && isError && (
          <p
            className="text-[11px] text-center py-6"
            style={{ color: "var(--accent-red)" }}
          >
            تعذر تحميل البيانات
          </p>
        )}

        {!isFetching && !isError && enabled && nodes.length === 0 && (
          <p
            className="text-[11px] text-center py-6"
            style={{ color: "var(--text-muted)" }}
          >
            لا توجد بيانات
          </p>
        )}

        {!enabled && !isFetching && (
          <p
            className="text-[11px] text-center py-6"
            style={{ color: "var(--text-muted)" }}
          >
            يرجى تحديد سنة
          </p>
        )}

        {!isFetching &&
          !isError &&
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SalesHierarchyAnalysis() {
  const {
    year: storeYear,
    month: storeMonth,
    quarter: storeQuarter,
    activeBranches,
    region,
    productCategory,
    subcategory,
    product: storeProduct,
    agreement,
  } = useFilterStore();

  // Standard level derivation
  const yearNum = toInt(storeYear);
  const monthNum = toInt(storeMonth);
  const quarterNum = toInt(storeQuarter);

  const level: "year" | "quarter" | "month" =
    monthNum !== undefined
      ? "month"
      : quarterNum !== undefined
        ? "quarter"
        : "year";

  const years = yearNum !== undefined ? [yearNum] : [];
  const period =
    level === "month" && monthNum !== undefined
      ? [monthNum]
      : level === "quarter" && quarterNum !== undefined
        ? [quarterNum]
        : undefined;

  // Store-level filters — string[] throughout, matching HierarchicalSalesParams
  const storeBranchIds = normalizeSelections(activeBranches);
  const storeRegionIds = normalizeSelections(region);
  const storeAgreementId = normalizeSelections(agreement)[0];
  const storeG1Ids = normalizeSelections(productCategory);
  const storeG2Ids = normalizeSelections(subcategory);
  const storeG3Ids = normalizeSelections(storeProduct);

  // ── Drill-down path ────────────────────────────────────────────────────────
  const [path, setPath] = useState<SelectedLevel[]>([]);

  // Stable stringified deps to avoid infinite loops
  const branchKey = storeBranchIds.join(",");
  const regionKey = storeRegionIds.join(",");
  const g1Key = storeG1Ids.join(",");

  useEffect(() => {
    setPath([]);
  }, [storeYear, storeMonth, storeQuarter, branchKey, regionKey, g1Key]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [path.length]);

  // Columns: always branch, +1 per path entry up to max depth
  const visibleColumns: AtLevel[] = [AT_LEVELS[0]];
  for (let i = 0; i < path.length && i + 1 < AT_LEVELS.length; i++) {
    visibleColumns.push(AT_LEVELS[i + 1]);
  }

  const getColParams = (colIdx: number) => {
    const selBranchId = path[0]?.node.id;
    const selG1Id = path[1]?.node.id;
    const selG2Id = path[2]?.node.id;
    const selG3Id = path[3]?.node.id;

    if (colIdx === 0) {
      return {
        branchIds: storeBranchIds.length ? storeBranchIds : undefined,
        regionIds: storeRegionIds.length ? storeRegionIds : undefined,
        group1Ids: undefined as string[] | undefined,
        group2Ids: undefined as string[] | undefined,
        group3Ids: undefined as string[] | undefined,
        agreementId: storeAgreementId,
      };
    }

    const effectiveBranchIds: string[] = selBranchId
      ? [selBranchId]
      : storeBranchIds;

    if (colIdx === 1) {
      return {
        branchIds: effectiveBranchIds.length ? effectiveBranchIds : undefined,
        regionIds: storeRegionIds.length ? storeRegionIds : undefined,
        group1Ids: storeG1Ids.length ? storeG1Ids : undefined,
        group2Ids: undefined as string[] | undefined,
        group3Ids: undefined as string[] | undefined,
        agreementId: storeAgreementId,
      };
    }

    const effectiveG1Ids = selG1Id
      ? [selG1Id]
      : storeG1Ids.length
        ? storeG1Ids
        : undefined;

    if (colIdx === 2) {
      return {
        branchIds: effectiveBranchIds.length ? effectiveBranchIds : undefined,
        regionIds: storeRegionIds.length ? storeRegionIds : undefined,
        group1Ids: effectiveG1Ids,
        group2Ids: storeG2Ids.length ? storeG2Ids : undefined,
        group3Ids: undefined as string[] | undefined,
        agreementId: storeAgreementId,
      };
    }

    const effectiveG2Ids = selG2Id
      ? [selG2Id]
      : storeG2Ids.length
        ? storeG2Ids
        : undefined;

    if (colIdx === 3) {
      return {
        branchIds: effectiveBranchIds.length ? effectiveBranchIds : undefined,
        regionIds: storeRegionIds.length ? storeRegionIds : undefined,
        group1Ids: effectiveG1Ids,
        group2Ids: effectiveG2Ids,
        group3Ids: storeG3Ids.length ? storeG3Ids : undefined,
        agreementId: storeAgreementId,
      };
    }

    const effectiveG3Ids = selG3Id
      ? [selG3Id]
      : storeG3Ids.length
        ? storeG3Ids
        : undefined;

    return {
      branchIds: effectiveBranchIds.length ? effectiveBranchIds : undefined,
      regionIds: storeRegionIds.length ? storeRegionIds : undefined,
      group1Ids: effectiveG1Ids,
      group2Ids: effectiveG2Ids,
      group3Ids: effectiveG3Ids,
      agreementId: storeAgreementId,
    };
  };

  const handleSelect = (colIdx: number, node: TreeNode) => {
    setPath((prev) => [
      ...prev.slice(0, colIdx),
      { at: visibleColumns[colIdx], node },
    ]);
  };

  const handleDeselect = (colIdx: number) => {
    setPath((prev) => prev.slice(0, colIdx));
  };

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

      <AnimatePresence>
  {path.length > 0 && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="border-b overflow-hidden"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="px-5 py-2.5 flex items-center gap-1.5 flex-wrap" dir="rtl">

        {/* Static root crumb */}
        <button
          onClick={() => setPath([])}
          className="text-[11px] transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          الكل
        </button>

        {path.map((lvl, i) => {
          const isLast = i === path.length - 1;
          return (
            <React.Fragment key={lvl.node.id}>
              {/* Chevron separator */}
              <span style={{ color: "var(--text-muted)", fontSize: 10, opacity: 0.4 }}>
                ‹
              </span>
              {isLast ? (
                /* Active crumb — pill style */
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{
                    background: "rgba(37,99,235,0.12)",
                    border: "1px solid rgba(37,99,235,0.25)",
                    color: "var(--accent-blue)",
                  }}
                >
                  <span style={{ color: "var(--text-muted)", fontSize: "9px", fontWeight: 400 }}>
                    {HIERARCHY_TITLES[lvl.at]}
                  </span>
                  {lvl.node.label}
                  <button
                    onClick={() => handleDeselect(i)}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                    style={{ lineHeight: 1 }}
                  >
                    <X size={9} />
                  </button>
                </span>
              ) : (
                /* Ancestor crumb — plain clickable text */
                <button
                  onClick={() => handleDeselect(i + 1)}
                  className="text-[11px] transition-opacity hover:opacity-70 max-w-[100px] truncate"
                  style={{ color: "var(--text-muted)" }}
                  title={lvl.node.label}
                >
                  {lvl.node.label}
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
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex w-max me-auto gap-2 items-stretch" dir="ltr">
          {visibleColumns.map((at, colIdx) => {
            const p = getColParams(colIdx);
            return (
              <HierarchyColumn
                key={`${at}-${colIdx}`}
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
