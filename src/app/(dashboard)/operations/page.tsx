"use client";

import "@/lib/echarts/register-bar-line-pie";

import Header from "./components/header/Header";
import OperationsStats from "./components/operations-stats/OperationsStats";
import CausesOfReturns from "./components/causes-of-returns/CausesOfReturns";
import ShoppingBasketAnalysis from "./components/shopping-basket-analysis/ShoppingBasketAnalysis";
import NumberOfSalesAndMonetaryValue from "./components/number-of-sales-and-monetary-value/NumberOfSalesAndMonetaryValue";
import ComparingTheAverageBasketSizeAndInvoiceValue from "./components/comparing-the-average-basket-size-and-invoice-value/ComparingTheAverageBasketSizeAndInvoiceValue";

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <Header />
      <OperationsStats />
      {/* <CausesOfReturns /> */}
      <ShoppingBasketAnalysis />
      <NumberOfSalesAndMonetaryValue />
      <ComparingTheAverageBasketSizeAndInvoiceValue />
    </div>
  );
}
