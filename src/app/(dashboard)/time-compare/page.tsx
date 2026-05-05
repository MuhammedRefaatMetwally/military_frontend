"use client";

import "@/lib/echarts/register-bar-line-pie";
import Header from "./components/Header/Header";
import TimeCompareStats from "./components/time-compare-stats/TimeCompareStats";
import NetSalesPeriod1 from "./components/net-sales-period-1/NetSalesPeriod1";
import NetSalesPeriod2 from "./components/net-sales-period-2/NetSalesPeriod2";
import AtvByPeriod from "./components/ATV-by-period/AtvByPeriod";
import NetSalesByBranchAndPeriod from "./components/net-sales-by-branch-and-period/NetSalesByBranchAndPeriod";
import ProfitValueByBranchAndPeriod from "./components/profit-value-by-branch-and-period/ProfitValueByBranchAndPeriod";
import DiscountValueByPeriod from "./components/discount-value-by-period/DiscountValueByPeriod";
import DiscountValueByBranch from "./components/discount-value-by-branch/DiscountValueByBranch";
import DiscountValueByCategory from "./components/discount-value-by-category/DiscountValueByCategory";
import NumberOfInvoicesByPeriod from "./components/number-of-invoices-by-period/NumberOfInvoicesByPeriod";

export default function TimeComparePage() {
  return (
    <div className="space-y-6">
      <Header />
      <TimeCompareStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <NetSalesPeriod1 />
        <NetSalesPeriod2 />
        <AtvByPeriod />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <NetSalesByBranchAndPeriod />
        <ProfitValueByBranchAndPeriod />
        <DiscountValueByPeriod />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <DiscountValueByBranch />
        <DiscountValueByCategory />
        <NumberOfInvoicesByPeriod />
      </div>
    </div>
  );
}
