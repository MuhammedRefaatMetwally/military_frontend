import ChartCard from "@/components/ui/chart-card/ChartCard";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useThemeStore } from "@/store/themeStore";
import { useState } from "react";

const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2)}K` : fmt2(n));

const periodData = {
  شهري: {
    labels: Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`),
    values: [
      153000, 118500, 353000, 185000, 206000, 139500, 112000, 404000, 225000,
      178000, 478000, 571000,
    ],
  },
  ربعي: {
    labels: ["الربع الأول", "الربع الثاني", "الربع الثالث", "الربع الرابع"],
    values: [624500, 530500, 741000, 1227000],
  },
  سنوي: {
    labels: ["2021", "2022", "2023", "2024"],
    values: [1850000, 2340000, 2780000, 3123000],
  },
};

const TotalDiscountsOverTime = () => {
  const [discountPeriod, setDiscountPeriod] = useState<
    "شهري" | "ربعي" | "سنوي"
  >("شهري");
  const palette = useResolvedAnalyticsPalette();
  const isDark = useThemeStore((s) => s.mode === "dark");
  const pData = periodData[discountPeriod];

  const discountTrendOption = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#1a2035",
      borderColor: "#1e293b",
      textStyle: { color: "#e2e8f0", fontSize: 11 },
      formatter: (params: { name: string; value: number }[]) =>
        `${params[0].name}<br/>إجمالي الخصومات: <b style="color:${palette.primaryAmber}">${fmtK(params[0].value)}</b>`,
    },
    grid: {
      bottom: "10%",
      top: "8%",
      left: "3%",
      right: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category" as const,
      data: pData.labels,
      axisLabel: { fontSize: 9, color: "#64748b" },
      axisLine: {
        show: true,
        lineStyle: { color: palette.primarySlate, width: 1.5 },
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        formatter: (v: number) => fmtK(v),
        fontSize: 9,
        color: "#64748b",
      },
      axisLine: {
        show: true,
        lineStyle: { color: palette.primarySlate, width: 1.5 },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: isDark ? "#1e293b" : "rgba(100, 116, 139, 0.35)",
        },
      },
    },
    series: [
      {
        type: "line" as const,
        smooth: true,
        showSymbol: true,
        symbolSize: 7,
        data: pData.values,
        lineStyle: { color: palette.primaryAmber, width: 2.5 },
        itemStyle: {
          color: palette.primaryAmber,
          borderColor: "#1a2035",
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(245,158,11,0.25)" },
              { offset: 1, color: "rgba(245,158,11,0.02)" },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="glass-panel overflow-hidden">
      <div
        className="px-5 py-3 border-b flex items-center justify-between flex-wrap gap-2"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div>
          <h3
            className="text-sm font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            إجمالي الخصومات بمرور الوقت
          </h3>
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Total Discounts Over Time
          </p>
        </div>
        <div
          className="flex items-center gap-1 p-0.5 rounded-lg"
          style={{ background: "var(--bg-elevated)" }}
        >
          {(["شهري", "ربعي", "سنوي"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setDiscountPeriod(p)}
              className="px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all"
              style={{
                background:
                  discountPeriod === p
                    ? "rgba(245,158,11,0.15)"
                    : "transparent",
                color: discountPeriod === p ? "#f59e0b" : "var(--text-muted)",
                border:
                  discountPeriod === p
                    ? "1px solid rgba(245,158,11,0.3)"
                    : "1px solid transparent",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <ChartCard title="" option={discountTrendOption} height="260px" />
    </div>
  );
};

export default TotalDiscountsOverTime;
