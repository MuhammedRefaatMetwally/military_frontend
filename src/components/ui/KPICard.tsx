"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KPIData } from "@/lib/mockData";

interface KPICardProps {
  data: KPIData;
  delay?: number;
}

export default function KPICard({ data, delay = 0 }: KPICardProps) {
  const TrendIcon =
    data.changeType === "إرتفاع"
      ? TrendingUp
      : data.changeType === "إنخفاض"
        ? TrendingDown
        : Minus;
  const trendColorVar =
    data.changeType === "إرتفاع"
      ? "var(--accent-green)"
      : data.changeType === "إنخفاض"
        ? "var(--accent-red)"
        : "var(--text-muted)";
  const trendBgVar =
    data.changeType === "إرتفاع"
      ? "var(--accent-green-dim)"
      : data.changeType === "إنخفاض"
        ? "rgba(239,68,68,0.1)"
        : "rgba(100,116,139,0.08)";

  const sparklinePoints = data.sparkline
    .map((v, i) => {
      const min = Math.min(...data.sparkline);
      const max = Math.max(...data.sparkline);
      const range = max - min || 1;
      const x = (i / (data.sparkline.length - 1)) * 120;
      const y = 30 - ((v - min) / range) * 28;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="glass-panel glass-panel-hover p-5 cursor-pointer group relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-50 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${trendColorVar}, transparent)`,
        }}
      />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p
            className="text-xs font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            {data.titleAr}
          </p>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
          style={{ background: trendBgVar, color: trendColorVar }}
        >
          <TrendIcon size={12} />
          <span dir="ltr">
            {data.change > 0 ? "+" : ""}
            {data.change}%
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
            dir="ltr"
          >
            {data.formattedValue}
          </span>
          {data.unit && (
            <span
              className="text-xs font-medium mr-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              {data.unit === "JOD" ? "د.أ" : data.unit}
            </span>
          )}
        </div>

        <svg
          width="120"
          height="32"
          className="opacity-30 group-hover:opacity-60 transition-opacity"
        >
          <polyline
            points={sparklinePoints}
            fill="none"
            stroke={trendColorVar}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="mt-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
        الفترة السابقة:{" "}
        <span dir="ltr">{data.previousValue.toLocaleString("en-US")}</span>
      </div>
    </motion.div>
  );
}
