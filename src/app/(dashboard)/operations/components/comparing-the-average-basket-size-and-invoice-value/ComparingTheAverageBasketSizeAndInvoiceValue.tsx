import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import MetricsBubblePlot, {
  MetricsBubblePoint,
} from "@/components/ui/MetricsBubblePlot";
import { BRANCH_PRODUCT_ANALYSIS } from "@/lib/branchProductAnalysis";
import { useState } from "react";

const ComparingTheAverageBasketSizeAndInvoiceValue = () => {
  const [activeBubbleBranches, setActiveBubbleBranches] = useState<string[]>(
    () => BRANCH_PRODUCT_ANALYSIS.map((b) => b.branch),
  );

  const categoryPoints: MetricsBubblePoint[] = [];

  BRANCH_PRODUCT_ANALYSIS.forEach((b, bi) => {
    if (!activeBubbleBranches.includes(b.branch)) return;
    b.cats.forEach((c, ci) => {
      categoryPoints.push({
        key: `bs_cat_${bi}_${ci}`,
        label: c.name,
        depth: 1,
        xValue: c.basket,
        yValue: c.atv,
        hasChildren: false,
        open: false,
        onClick: undefined,
        vol: c.vol,
        price: c.price,
        basket: c.basket,
        atv: c.atv,
      });
    });
  });

  return (
    <div className="glass-panel p-0 overflow-hidden w-full">
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <ChartTitleFlagBadge flag="green" size="sm" />
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            مقارنة متوسط حجم السلة وقيمة الفاتورة
          </h3>
        </div>
        <p
          className="text-[10px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          الفئات الرئيسية فقط • المحور الأفقي: متوسط حجم السلة • العمودي: متوسط
          قيمة الفاتورة (ATV)
        </p>
      </div>
      <MetricsBubblePlot
        points={categoryPoints}
        xLabel="متوسط السلة"
        yLabel="ATV"
        variant="green"
        plotHeight={420}
      />
      {/* فلاتر الأسواق */}
      <div className="px-5 pb-4 pt-0">
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          {BRANCH_PRODUCT_ANALYSIS.map((b) => {
            const on = activeBubbleBranches.includes(b.branch);
            return (
              <button
                key={b.branch}
                type="button"
                onClick={() => {
                  setActiveBubbleBranches((prev) => {
                    // إذا كانت كلها مفعّلة ونقرنا على واحد → فعّل هذا فقط
                    if (prev.length === BRANCH_PRODUCT_ANALYSIS.length) {
                      return [b.branch];
                    }
                    const set = new Set(prev);
                    if (set.has(b.branch)) {
                      // لا تسمح بإلغاء آخر سوق لتفادي فراغ الرسم
                      if (set.size <= 1) return prev;
                      set.delete(b.branch);
                    } else {
                      set.add(b.branch);
                    }
                    return Array.from(set);
                  });
                }}
                className="px-2 py-0.5 rounded-full border transition-colors"
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
    </div>
  );
};

export default ComparingTheAverageBasketSizeAndInvoiceValue;
