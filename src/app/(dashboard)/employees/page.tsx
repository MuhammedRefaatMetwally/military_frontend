"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-gauge";

import Header from "./components/Header";
import EmployeesStats from "./components/employees-stats/EmployeesStats";
import CashierSalesTrends from "./components/cashier-sales-trends/CashierSalesTrends";
import AverageOverallPerformance from "./components/average-overall-performance/AverageOverallPerformance";
import ReturnsRatioWithAverageInvoiceValue from "./components/returns-ratio-with-average-invoice-value/ReturnsRatioWithAverageInvoiceValue";
import CashiersRankByPerformanceLevel from "./components/cashiers-rank-by-performance-level/CashiersRankByPerformanceLevel";
import CashiersPerformanceDetails from "./components/cashiers-performance-details/CashiersPerformanceDetails";

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <Header />

      <EmployeesStats />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <CashierSalesTrends />
        </div>
        <AverageOverallPerformance />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ReturnsRatioWithAverageInvoiceValue />
        <CashiersRankByPerformanceLevel />
      </div>

      <CashiersPerformanceDetails />
    </div>
  );
}
