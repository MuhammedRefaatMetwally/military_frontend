"use client";

import { MapPin } from "lucide-react";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import { ChevronLeft } from "lucide-react";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import MetricsBubblePlot from "@/components/ui/MetricsBubblePlot";
import { BRANCH_PRODUCT_ANALYSIS } from "@/lib/branchProductAnalysis";
import {
  buildBasketPriceBubblePoints,
  type DrillPath,
} from "../../utils/buildBasketPriceBubblePoints";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";

const BUBBLE_PLOT_PROPS = {
  xLabel: "حجم المبيعات",
  yLabel: "متوسط قيمة الفاتورة",
  variant: "blue" as const,
  plotHeight: 420,
  bubbleSizing: "basketProfit" as const,
  detailLabels: {
    vol: "حجم المبيعات",
    price: "متوسط السعر",
  },
};

// Depth labels for breadcrumb and detail panel
const DEPTH_LABELS = ["الأسواق", "الفئات", "المنتجات"] as const;
const ENTITY_SUBTITLE = ["سوق", "فئة", "منتج"] as const;

type Props = {
  variant: "toggles" | "dropdown";
  drillPath?: DrillPath;
  setDrillPath: Dispatch<SetStateAction<DrillPath>>;
  basketPriceActiveBranches: string[];
  setBasketPriceActiveBranches: Dispatch<SetStateAction<string[]>>;
};

export default function BranchBasketPriceBubbleSection({
  variant,
  drillPath = [],
  setDrillPath,
  basketPriceActiveBranches,
  setBasketPriceActiveBranches,
}: Props) {
  const points = useMemo(
    () =>
      buildBasketPriceBubblePoints(
        drillPath,
        basketPriceActiveBranches,
        (path) => setDrillPath(path),
      ),
    [drillPath, basketPriceActiveBranches, setDrillPath],
  );

  const entitySubtitle = (d: 0 | 1 | 2) => ENTITY_SUBTITLE[d];

  // Breadcrumb: "الأسواق / سوق المنارة / منتجات غذائية"
  const breadcrumbItems = [
    { label: DEPTH_LABELS[0], path: [] as DrillPath },
    ...drillPath.map((segment, i) => ({
      label: segment,
      path: drillPath.slice(0, i + 1) as DrillPath,
    })),
  ];

  const breadcrumb = (
    <div className="flex items-center gap-1 flex-wrap" dir="rtl">
      {breadcrumbItems.map((item, i) => {
        const isLast = i === breadcrumbItems.length - 1;
        return (
          <div key={item.label} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronLeft
                size={10}
                style={{ color: "var(--text-muted)", opacity: 0.5 }}
              />
            )}
            <button
              type="button"
              onClick={() => !isLast && setDrillPath(item.path)}
              className="text-[10px] font-medium transition-colors"
              style={{
                color: isLast ? "var(--accent-blue)" : "var(--text-muted)",
                cursor: isLast ? "default" : "pointer",
                textDecoration: !isLast ? "underline" : "none",
                textUnderlineOffset: 2,
              }}
            >
              {item.label}
            </button>
          </div>
        );
      })}
    </div>
  );

  const titleBlock = (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-2">
        <ChartTitleFlagBadge flag="green" size="sm" />
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          تغير المبيعات حسب السعر
        </h3>
      </div>
      {breadcrumb}
      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
        {drillPath.length === 0
          ? "انقر على سوق لعرض فئاته • حجم الدائرة يمثل الربح التقديري"
          : drillPath.length === 1
            ? "انقر على فئة لعرض منتجاتها"
            : "عرض المنتجات — انقر على الدائرة لتفاصيلها"}
      </p>
    </div>
  );

  if (variant === "toggles") {
    return (
      <div className="glass-panel p-0 overflow-hidden w-full">
        <div
          className="flex items-center justify-between px-5 py-3 border-b gap-4"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {titleBlock}
          {/* Branch toggles only shown at root level */}
          {drillPath.length === 0 && (
            <div className="overflow-x-auto overflow-y-hidden flex items-center gap-1.5 text-[10px] px-2 whitespace-nowrap shrink-0 max-w-[50%]">
              {BRANCH_PRODUCT_ANALYSIS.map((b) => {
                const on = basketPriceActiveBranches.includes(b.branch);
                return (
                  <button
                    key={b.branch}
                    type="button"
                    onClick={() => {
                      setBasketPriceActiveBranches((prev) => {
                        if (prev.length === BRANCH_PRODUCT_ANALYSIS.length) {
                          return [b.branch];
                        }
                        const set = new Set(prev);
                        if (set.has(b.branch)) {
                          if (set.size <= 1) return prev;
                          set.delete(b.branch);
                        } else {
                          set.add(b.branch);
                        }
                        return Array.from(set);
                      });
                    }}
                    className="px-2 py-0.5 rounded-full border transition-colors shrink-0 whitespace-nowrap"
                    style={{
                      borderColor: on
                        ? "var(--accent-green)"
                        : "var(--border-subtle)",
                      background: on
                        ? "rgba(34,197,94,0.12)"
                        : "var(--bg-elevated)",
                      color: on ? "var(--accent-green)" : "var(--text-muted)",
                    }}
                  >
                    {b.branch}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <MetricsBubblePlot
          points={points}
          {...BUBBLE_PLOT_PROPS}
          entitySubtitle={entitySubtitle}
        />
      </div>
    );
  }

  return (
    <div className="glass-panel p-0 w-full">
      <div
        className="flex items-center gap-4 px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {titleBlock}
        {drillPath.length === 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] shrink-0">
            <MultiSelectDropdown
              icon={MapPin}
              label="الأسواق"
              selectedValues={
                basketPriceActiveBranches.length ===
                BRANCH_PRODUCT_ANALYSIS.length
                  ? []
                  : basketPriceActiveBranches
              }
              options={[
                { value: "all", label: "كل الأسواق" },
                ...BRANCH_PRODUCT_ANALYSIS.map((b) => ({
                  value: b.branch,
                  label: b.branch,
                })),
              ]}
              onChange={(values) => {
                if (values.length === 0) {
                  setBasketPriceActiveBranches(
                    BRANCH_PRODUCT_ANALYSIS.map((b) => b.branch),
                  );
                } else {
                  setBasketPriceActiveBranches(values);
                }
              }}
              accent="var(--accent-green)"
              manyLabel={(n) => `${n} أسواق`}
            />
          </div>
        )}
      </div>
      <div style={{ overflow: "hidden" }}>
        <MetricsBubblePlot
          points={points}
          {...BUBBLE_PLOT_PROPS}
          entitySubtitle={entitySubtitle}
        />
      </div>
    </div>
  );
}