"use client";

import "@/lib/echarts/register-bar-line-pie";
import { useMemo, useState } from "react";

import EnterpriseTable from "@/components/ui/EnterpriseTable";
import { getBranchData } from "@/lib/mockData";
import BranchMap from "@/components/ui/BranchMap";
import { BRANCH_PRODUCT_ANALYSIS } from "@/lib/branchProductAnalysis";
import DrillDownTable from "@/components/ui/DrillDownTable";
import Heading from "./components/heading/Heading";
import BranchesStats from "./components/branches-stats/BranchesStats";
import BranchPerformanceEvaluation from "./components/branch-performance-evaluation/BranchPerformanceEvaluation";
import OverallBranchesPerformance from "./components/overall-branches-performance/OverallBranchesPerformance";
import ProductCategoryPerformanceByBranch from "./components/product-category-performance-by-branch/ProductCategoryPerformanceByBranch";
import BranchBasketPriceBubbleSection from "./components/branch-basket-price-bubble-section/BranchBasketPriceBubbleSection";
import YearOverYearSalesComparison from "./components/year-over-year-sales-comparison/YearOverYearSalesComparison";
import NetProfitByCategory from "./components/net-profit-by-category/NetProfitByCategory";
import NetSalesOverTimeForEachBranch from "./components/net-sales-over-time-for-each-branch/NetSalesOverTimeForEachBranch";
import { getBranchColumns } from "./utils/branchColumns";

export default function BranchesPage() {
  const branches = useMemo(() => getBranchData(), []);
  const branchColumns = useMemo(() => getBranchColumns(branches), [branches]);

  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [basketPriceActiveBranches, setBasketPriceActiveBranches] = useState<
    string[]
  >(() => BRANCH_PRODUCT_ANALYSIS.map((b) => b.branch));
  const [basketPriceCategory, setBasketPriceCategory] = useState<string | null>(
    null,
  );

  // ألوان الفئات (مطابقة لصفحة /products)

  return (
    <div className="space-y-6">
      <Heading />
      <BranchesStats />
      <BranchPerformanceEvaluation />
      <OverallBranchesPerformance />
      <ProductCategoryPerformanceByBranch
        expandedCats={expandedCats}
        setExpandedCats={setExpandedCats}
      />

      {/* ── مقارنة المبيعات: السنة الحالية مقابل السنة السابقة ── */}
      <YearOverYearSalesComparison
        expandedCats={expandedCats}
        setExpandedCats={setExpandedCats}
      />
      {/* ── تحليل المنتجات: حجم المبيعات + متوسط السعر ── */}
      <BranchBasketPriceBubbleSection
        variant="toggles"
        basketPriceCategory={basketPriceCategory}
        setBasketPriceCategory={setBasketPriceCategory}
        basketPriceActiveBranches={basketPriceActiveBranches}
        setBasketPriceActiveBranches={setBasketPriceActiveBranches}
      />

      {/* ── تغير المبيعات حسب السعر + صافي الأرباح حسب الفئة ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <BranchBasketPriceBubbleSection
          variant="dropdown"
          basketPriceCategory={basketPriceCategory}
          setBasketPriceCategory={setBasketPriceCategory}
          basketPriceActiveBranches={basketPriceActiveBranches}
          setBasketPriceActiveBranches={setBasketPriceActiveBranches}
        />
        <NetProfitByCategory />
      </div>

      {/* خريطة الفروع + صافي المبيعات عبر الزمن */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <BranchMap />
        <NetSalesOverTimeForEachBranch />
      </div>

      {/* جدول التحليل التفصيلي — سوق / فئة / منتج */}
      <DrillDownTable />

      <EnterpriseTable
        title="دليل الفروع"
        titleFlag="green"
        columns={branchColumns}
        data={branches}
        pageSize={10}
      />
    </div>
  );
}
