"use client";

import "@/lib/echarts/register-bar-line-pie";
import Header from "./components/header/Header";
import SalesMethodStats from "./components/sales-method-stats/SalesMethodStats";
import SalesByPaymentMethod from "./components/sales-by-payment-method/SalesByPaymentMethod";
import SalesByTypeOfSale from "./components/sales-by-type-of-sale/SalesByTypeOfSale";
import PaymentMethodDetails from "./components/payment-method-details/PaymentMethodDetails";
import DetailsOfTypeOfSale from "./components/details-of-type-of-sale/DetailsOfTypeOfSale";
import PaymentMethodsTrend from "./components/payment-methods-trend/PaymentMethodsTrend";
import SellingTypeTrend from "./components/selling-type-trend/SellingTypeTrend";

export default function SalesMethodPage() {
  // ── الإيرادات والهامش حسب الطريقة ──
  // const profitByMethodOption = {
  //   xAxis: {
  //     type: "category" as const,
  //     data: ["نقدي", "فيزا/ماستركارد", "كوبون / قسيمة", "دفع لاحق", "آجل"],
  //   },
  //   yAxis: [
  //     {
  //       type: "value" as const,
  //       name: "الإيرادات",
  //       axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
  //     },
  //     { type: "value" as const, name: "الهامش %" },
  //   ],
  //   series: [
  //     {
  //       name: "الإيرادات",
  //       type: "bar",
  //       data: [10300000, 6900000, 1200000, 2500000, 800000].map((v) => ({
  //         value: v,
  //         itemStyle: { color: "#22c55e", borderRadius: [4, 4, 0, 0] },
  //       })),
  //       barWidth: 36,
  //     },
  //     {
  //       name: "هامش الربح",
  //       type: "line",
  //       yAxisIndex: 1,
  //       data: [22.1, 19.5, 14.3, 15.3, 12.7],
  //       lineStyle: { color: "#f59e0b", width: 2 },
  //       itemStyle: { color: "#f59e0b" },
  //     },
  //   ],
  //   legend: { data: ["الإيرادات", "هامش الربح"], bottom: 0, left: "center" },
  // };

  return (
    <div className="space-y-6">
      <Header />

      {/* KPIs */}
      <SalesMethodStats />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SalesByPaymentMethod />
        <SalesByTypeOfSale />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <PaymentMethodDetails />
        <DetailsOfTypeOfSale />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <PaymentMethodsTrend />
        <SellingTypeTrend />
      </div>

      {/* الإيرادات والهامش */}
      {/* <ChartCard
        title="الإيرادات وهامش الربح حسب طريقة الدفع"
        subtitle="مقارنة الإيرادات مع هامش الربح لكل طريقة"
        option={profitByMethodOption}
        height="300px"
        delay={5}
      /> */}
    </div>
  );
}
