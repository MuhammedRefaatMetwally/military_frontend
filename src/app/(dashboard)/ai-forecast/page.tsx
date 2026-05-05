"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-gauge";

import Header from "./components/header/Header";
import ActualAndProjectedSalesByDate from "./components/actual-and-projected-sales-by-date/ActualAndProjectedSalesByDate";
import VerticalIndicators from "./components/vertical-indicators/VerticalIndicators";
import DailyForecastDetails from "./components/daily-forecast-details/DailyForecastDetails";

export default function AIForecastPage() {
  return (
    <div className="space-y-6">
      <Header />

      <div className="flex flex-col items-start w-full gap-4">
        <VerticalIndicators />
        <ActualAndProjectedSalesByDate />
      </div>

      <DailyForecastDetails />
    </div>
  );
}
