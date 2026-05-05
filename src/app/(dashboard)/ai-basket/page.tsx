"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-scatter";

import Header from "./components/header/Header";
import AiBasketStats from "./components/ai-basket-stats/AiBasketStats";
import SupportAndLiftingByBasket from "./components/support-and-lifting-by-basket/SupportAndLiftingByBasket";
import RulesOfAssociation from "./components/rules-of-association/RulesOfAssociation";

export default function AIBasketPage() {
  return (
    <div className="space-y-6">
      <Header />
      <AiBasketStats />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SupportAndLiftingByBasket />
        <RulesOfAssociation />
      </div>
    </div>
  );
}
