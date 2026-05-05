"use client";

import "@/lib/echarts/register-bar-line-pie";
import { useMemo } from "react";
import { motion } from "framer-motion";
import KPICard from "@/components/ui/KPICard";

import { getKPIData } from "@/lib/mockData";
import Overview from "./components/overview/Overview";
import OverviewStats from "./components/overview-stats/OverviewStats";
import RevenueTrend from "./components/revenue-trend/RevenueTrend";
import ClassDistribution from "./components/class-distribution/ClassDistribution";
import BestPerformingBranches from "./components/best-performing-branches/BestPerformingBranches";
import RegionalPerformance from "./components/regional-performance/RegionalPerformance";
import LatestActivities from "./components/latest-activities/LatestActivities";

export default function DashboardPage() {
  const kpiData = useMemo(() => getKPIData(), []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <Overview />
        <OverviewStats />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, i) => (
          <KPICard key={kpi.id} data={kpi} delay={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <RevenueTrend />
        <ClassDistribution />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <BestPerformingBranches />
        <RegionalPerformance />
      </div>

      <LatestActivities />
    </div>
  );
}
