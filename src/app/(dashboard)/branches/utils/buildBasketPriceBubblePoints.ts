import type { MetricsBubblePoint } from "@/components/ui/MetricsBubblePlot";
import { BRANCH_PRODUCT_ANALYSIS } from "@/lib/branchProductAnalysis";

export function buildBasketPriceBubblePoints(
  basketPriceCategory: string | null,
  basketPriceActiveBranches: string[],
  setBasketPriceCategory: (name: string | null) => void,
): MetricsBubblePoint[] {
  const points: MetricsBubblePoint[] = [];

  if (basketPriceCategory) {
    BRANCH_PRODUCT_ANALYSIS.forEach((b) => {
      if (!basketPriceActiveBranches.includes(b.branch)) return;
      b.cats.forEach((c) => {
        if (c.name !== basketPriceCategory) return;
        c.products.forEach((p) => {
          const basketProfit = Number(
            (p.atv * 0.24 + p.price * p.basket * 0.42).toFixed(2),
          );
          points.push({
            key: `bp_prod_${b.branch}_${c.name}_${p.name}`,
            label: `${p.name} — ${b.branch}`,
            depth: 2,
            xValue: p.vol,
            yValue: p.price,
            hasChildren: false,
            open: false,
            onClick: undefined,
            vol: p.vol,
            price: p.price,
            basket: p.basket,
            atv: p.atv,
            basketProfit,
          });
        });
      });
    });
  } else {
    BRANCH_PRODUCT_ANALYSIS.forEach((b) => {
      if (!basketPriceActiveBranches.includes(b.branch)) return;
      b.cats.forEach((c) => {
        const basketProfit = Number(
          (c.atv * 0.24 + c.price * c.basket * 0.42).toFixed(2),
        );
        points.push({
          key: `bp_cat_${b.branch}_${c.name}`,
          label: c.name,
          depth: 1,
          xValue: c.basket,
          yValue: c.atv,
          hasChildren: true,
          open: false,
          onClick: () => setBasketPriceCategory(c.name),
          vol: c.vol,
          price: c.price,
          basket: c.basket,
          atv: c.atv,
          basketProfit,
        });
      });
    });
  }

  return points;
}
