"use client";

import { MapPin } from "lucide-react";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import MetricsBubblePlot from "@/components/ui/MetricsBubblePlot";
import { BRANCH_PRODUCT_ANALYSIS } from "@/lib/branchProductAnalysis";
import { buildBasketPriceBubblePoints } from "../../utils/buildBasketPriceBubblePoints";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";

const BUBBLE_PLOT_PROPS = {
  xLabel: "عدد المنتجات المباعة",
  yLabel: "متوسط اسعار المنتجات",
  variant: "blue" as const,
  plotHeight: 420,
  bubbleSizing: "basketProfit" as const,
  detailLabels: {
    vol: "عدد المنتجات المباعة",
    price: "متوسط اسعار المنتجات",
  },
};

type Props = {
  variant: "toggles" | "dropdown";
  basketPriceCategory: string | null;
  setBasketPriceCategory: (v: string | null) => void;
  basketPriceActiveBranches: string[];
  setBasketPriceActiveBranches: Dispatch<SetStateAction<string[]>>;
};

export default function BranchBasketPriceBubbleSection({
  variant,
  basketPriceCategory,
  setBasketPriceCategory,
  basketPriceActiveBranches,
  setBasketPriceActiveBranches,
}: Props) {
  const points = useMemo(
    () =>
      buildBasketPriceBubblePoints(
        basketPriceCategory,
        basketPriceActiveBranches,
        setBasketPriceCategory,
      ),
    [basketPriceCategory, basketPriceActiveBranches, setBasketPriceCategory],
  );

  const backButton = basketPriceCategory && (
    <button
      type="button"
      className="mt-1 text-[9px] underline"
      style={{ color: "var(--accent-blue)" }}
      onClick={() => setBasketPriceCategory(null)}
    >
      الرجوع إلى عرض الفئات
    </button>
  );

  const titleBlock = (
    <div>
      <div className="flex items-center gap-2">
        <ChartTitleFlagBadge flag="green" size="sm" />
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          تغير المبيعات حسب السعر
        </h3>
      </div>
      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
        الفئات حسب الأسواق • انقر على فئة لعرض المواد المرتبطة بها • حجم الدائرة
        يمثل الربح التقديري
      </p>
    </div>
  );

  if (variant === "toggles") {
    return (
      <div className="glass-panel p-0 overflow-hidden w-full">
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {titleBlock}
          <div className="mt-2 overflow-x-auto overflow-y-hidden max-w-[70%] flex items-center gap-1.5 text-[10px] px-2 whitespace-nowrap">
            {backButton}
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
        </div>
        <MetricsBubblePlot
          points={points}
          {...BUBBLE_PLOT_PROPS}
          entitySubtitle={(d) => (d === 2 ? "منتج" : "فئة")}
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
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
          {backButton}
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
      </div>
      <div style={{ overflow: "hidden" }}>
        <MetricsBubblePlot
          points={points}
          {...BUBBLE_PLOT_PROPS}
          entitySubtitle={(d) => (d === 2 ? "منتج" : "فئة")}
        />
      </div>
    </div>
  );
}
