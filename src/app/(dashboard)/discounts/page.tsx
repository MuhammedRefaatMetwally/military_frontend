"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-scatter";
import { useState } from "react";
import Header from "./components/header/Header";
import DiscountsStats from "./components/discounts-stats/DiscountsStats";
import ProfitMarginByCategoryAndTypeOfDiscount from "./components/profit-margin-by-category-and-type-of-discount/ProfitMarginByCategoryAndTypeOfDiscount";
import DiscountRatesAndGroupSalesVolume from "./components/discount-rates-and-group-sales-volume/DiscountRatesAndGroupSalesVolume";
import NetSalesProfitMarginAndDiscountsByDiscountRange from "./components/net-sales-profit-margin-and-discounts-by-discount-range/NetSalesProfitMarginAndDiscountsByDiscountRange";
import NetSalesAndProfitsWithDiscount from "./components/net-sales-and-profits-with-discount/NetSalesAndProfitsWithDiscount";
import NetSalesAndProfitsWithoutDiscount from "./components/net-sales-and-profits-witout-discount/NetSalesAndProfitsWithoutDiscount";
import ComparisonOfDiscountCategoryPerformance from "./components/comparison-of-discount-category-perofrmance/ComparisonOfDiscountCategoryPerformance";
import TotalDiscountsOverTime from "./components/total-discounts-over-time/TotalDiscountsOverTime";
import DiscountPerformanceDetailsByBranch from "./components/discount-performance-details-by-branch/DiscountPerformanceDetailsByBranch";
import SalesAnalysisByDiscountPercentage from "./components/sales-analysis-by-discount-percentage/SalesAnalysisByDiscountPercentage";

export default function DiscountsPage() {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // ── /time-compare (ported): month vs month (left/right) ──
  const monthOptions = Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`);
  const [tcLeftMonth, setTcLeftMonth] = useState<string>(monthOptions[0] ?? "");
  const [tcRightMonth, setTcRightMonth] = useState<string>(
    monthOptions[1] ?? monthOptions[0] ?? "",
  );

  const toggleCat = (name: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <Header />

      <DiscountsStats />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ProfitMarginByCategoryAndTypeOfDiscount />
        <DiscountRatesAndGroupSalesVolume />
      </div>

      <NetSalesProfitMarginAndDiscountsByDiscountRange />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <NetSalesAndProfitsWithDiscount
          tcLeftMonth={tcLeftMonth}
          setTcLeftMonth={setTcLeftMonth}
          setTcRightMonth={setTcRightMonth}
          tcRightMonth={tcRightMonth}
        />
        <NetSalesAndProfitsWithoutDiscount
          tcLeftMonth={tcLeftMonth}
          setTcLeftMonth={setTcLeftMonth}
          setTcRightMonth={setTcRightMonth}
          tcRightMonth={tcRightMonth}
        />
      </div>

      <ComparisonOfDiscountCategoryPerformance
        expandedCats={expandedCats}
        toggleCat={toggleCat}
      />

      <TotalDiscountsOverTime />

      <DiscountPerformanceDetailsByBranch
        expandedCats={expandedCats}
        toggleCat={toggleCat}
      />

      <SalesAnalysisByDiscountPercentage />
    </div>
  );
}
