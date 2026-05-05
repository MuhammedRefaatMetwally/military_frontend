"use client";

import "@/lib/echarts/register-bar-line-pie";
import DrillDownTable from "@/components/ui/DrillDownTable";
import SalesStats from "./components/sales-stats/SalesStats";
import NetProfitAndSalesByDate from "./components/net-profit-and-sales-by-date/NetProfitAndSalesByDate";
import NetProfitAndSalesByClassification from "./components/net-profit-and-sales-by-classification/NetProfitAndSalesByClassification";
// import RevenueWaterfall from "./components/revenue-waterfall/RevenueWaterfall";
import SalesHierarchyAnalysis from "./components/sales-hierarchy-analysis/SalesHierarchyAnalysis";
import DetailedTimeBasedSalesAnalysis from "./components/detailed-time-based-sales-analysis/DetailedTimeBasedSalesAnalysis";
import TransactionsCountWaterfall from "./components/transactions-count-waterfall/TransactionsCountWaterfall";

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <SalesStats />
      <NetProfitAndSalesByDate />
      <div className="">
        <NetProfitAndSalesByClassification />
        {/* <RevenueWaterfall /> */}
      </div>
      <SalesHierarchyAnalysis />
      <DetailedTimeBasedSalesAnalysis />
      <DrillDownTable />
      <TransactionsCountWaterfall />
    </div>
  );
}
