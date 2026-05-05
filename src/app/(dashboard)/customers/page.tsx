"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-heatmap";
import "@/lib/echarts/register-scatter";

import CustomerInsightsTable from "@/components/ui/CustomerInsightsTable";
import Header from "./components/header/Header";
import CustomersStats from "./components/customers-stats/CustomersStats";
import CustomersDataTable from "./components/customers-datatable/CustomersDataTable";
import HeatMapPeaksTime from "./components/heat-map-peaks-time/HeatMapPeaksTime";
import AverageBasketSizePerMarket from "./components/average-basket-size-per-market/AverageBasketSizePerMarket";
import PaymentMethod from "./components/payment-method/PaymentMethod";
import BillValueDistribution from "./components/bill-value-distribution/BillValueDistribution";
import AdvantageOfDiscountsAndCoupons from "./components/advantage-of-discounts-and-coupons/AdvantageOfDiscountsAndCoupons";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <Header />
      <CustomersStats />
      <CustomersDataTable />
      <HeatMapPeaksTime />
      <AverageBasketSizePerMarket />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <PaymentMethod />
        <BillValueDistribution />
      </div>
      <AdvantageOfDiscountsAndCoupons />
      <CustomerInsightsTable />
    </div>
  );
}
