"use client";

import "@/lib/echarts/register-bar-line-pie";
import Header from "./components/header/Header";
import ReportsStats from "./components/reports-stats/ReportsStats";
import Reports from "./components/reports/Reports";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <Header />
      <ReportsStats />
      <Reports />
    </div>
  );
}
