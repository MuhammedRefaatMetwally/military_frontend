"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-scatter";

import Header from "../components/header/Header";
import BasketAnalysisNetowrk from "../components/basket-analysis-network/BasketAnalysisNetowrk";

export default function AIBasketAnalysisPage() {
  return (
    <div className="space-y-6">
      <Header />
      <BasketAnalysisNetowrk />
    </div>
  );
}
