import type { MetricsBubblePoint } from "@/components/ui/MetricsBubblePlot";
import { BRANCH_PRODUCT_ANALYSIS } from "@/lib/branchProductAnalysis";

/**
 * 3-level drill-down:
 *   Level 0 — Branches   (all سوق entries)
 *   Level 1 — Categories (cats inside selected branch)
 *   Level 2 — Products   (products inside selected category)
 *
 * drillPath is a stack of selected keys:
 *   []                                → show all branches
 *   ["سوق المنارة"]                   → show cats for that branch
 *   ["سوق المنارة", "منتجات غذائية"]  → show products for that cat
 */
export type DrillPath = string[];

export function buildBasketPriceBubblePoints(
  drillPath: DrillPath | undefined | null,
  activeBranches: string[] | undefined | null,
  onDrill: (path: DrillPath) => void,
): MetricsBubblePoint[] {
  const points: MetricsBubblePoint[] = [];

  // Guard: if called before state is initialised, return empty
  const path: DrillPath = drillPath ?? [];
  const branches: string[] =
    activeBranches ?? BRANCH_PRODUCT_ANALYSIS.map((b) => b.branch);

  // ── Level 0: Branches ─────────────────────────────────────────────────────
  if (path.length === 0) {
    BRANCH_PRODUCT_ANALYSIS.filter((b) =>
      branches.includes(b.branch),
    ).forEach((b) => {
      const basketProfit = Number(
        (b.atv * 0.24 + b.price * b.basket * 0.42).toFixed(2),
      );
      points.push({
        key: `branch_${b.branch}`,
        label: b.branch,
        depth: 0,
        xValue: b.vol,
        yValue: b.atv,
        hasChildren: true,
        open: false,
        onClick: () => onDrill([b.branch]),
        vol: b.vol,
        price: b.price,
        basket: b.basket,
        atv: b.atv,
        basketProfit,
      });
    });
    return points;
  }

  // ── Level 1: Categories inside selected branch ────────────────────────────
  if (path.length === 1) {
    const branch = BRANCH_PRODUCT_ANALYSIS.find(
      (b) => b.branch === path[0],
    );
    if (!branch) return points;
    branch.cats.forEach((c) => {
      const basketProfit = Number(
        (c.atv * 0.24 + c.price * c.basket * 0.42).toFixed(2),
      );
      points.push({
        key: `cat_${branch.branch}_${c.name}`,
        label: c.name,
        depth: 1,
        xValue: c.vol,
        yValue: c.atv,
        hasChildren: true,
        open: false,
        onClick: () => onDrill([branch.branch, c.name]),
        vol: c.vol,
        price: c.price,
        basket: c.basket,
        atv: c.atv,
        basketProfit,
      });
    });
    return points;
  }

  // ── Level 2: Products inside selected category ────────────────────────────
  if (path.length === 2) {
    const branch = BRANCH_PRODUCT_ANALYSIS.find(
      (b) => b.branch === path[0],
    );
    const cat = branch?.cats.find((c) => c.name === path[1]);
    if (!cat) return points;
    cat.products.forEach((p) => {
      const basketProfit = Number(
        (p.atv * 0.24 + p.price * p.basket * 0.42).toFixed(2),
      );
      points.push({
        key: `prod_${branch!.branch}_${cat.name}_${p.name}`,
        label: p.name,
        depth: 2,
        xValue: p.vol,
        yValue: p.atv,
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
    return points;
  }

  return points;
}