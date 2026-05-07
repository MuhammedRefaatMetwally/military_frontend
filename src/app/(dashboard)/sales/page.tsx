"use client";

import { motion } from "motion/react";
import "@/lib/echarts/register-bar-line-pie";
import DrillDownTable from "@/components/ui/DrillDownTable";
import SalesStats from "./components/sales-stats/SalesStats";
import NetProfitAndSalesByDate from "./components/net-profit-and-sales-by-date/NetProfitAndSalesByDate";
import NetProfitAndSalesByClassification from "./components/net-profit-and-sales-by-classification/NetProfitAndSalesByClassification";
import SalesHierarchyAnalysis from "./components/sales-hierarchy-analysis/SalesHierarchyAnalysis";
import DetailedTimeBasedSalesAnalysis from "./components/detailed-time-based-sales-analysis/DetailedTimeBasedSalesAnalysis";
import TransactionsCountWaterfall from "./components/transactions-count-waterfall/TransactionsCountWaterfall";

const sections = [
  SalesStats,
  NetProfitAndSalesByDate,
  NetProfitAndSalesByClassification,
  SalesHierarchyAnalysis,
  DetailedTimeBasedSalesAnalysis,
  DrillDownTable,
  TransactionsCountWaterfall,
];

export default function SalesPage() {
  return (
    <div className="space-y-6">
      {sections.map((Section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Section />
        </motion.div>
      ))}
    </div>
  );
}