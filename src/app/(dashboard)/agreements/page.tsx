"use client";

import "@/lib/echarts/register-bar-line-pie";

import Header from "./components/header/Header";
import AgreementStats from "./components/agreements-stats/AgreementStats";
import MaterialsProfitsAndDiscounts from "./components/materials-profits-and-discounts/MaterialsProfitsAndDiscounts";
import ValueByType from "./components/value-by-type/ValueByType";
import ProductGroups from "./components/product-groups/ProductGroups";
import AgreementsGuide from "./components/agreements-guide/AgreementsGuide";

export default function AgreementsPage() {
  return (
    <div className="space-y-6">
      <Header />
      <AgreementStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <MaterialsProfitsAndDiscounts />
        <ValueByType />
        <ProductGroups />
      </div>

      <AgreementsGuide />
    </div>
  );
}
