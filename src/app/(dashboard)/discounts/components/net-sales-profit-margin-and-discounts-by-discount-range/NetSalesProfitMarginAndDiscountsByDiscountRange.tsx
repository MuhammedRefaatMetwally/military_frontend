import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const discountRanges = [
  {
    range: "0%",
    netSales: 352410,
    profitValue: 155520,
    totalDiscount: 0,
    avgRate: 0.0,
  },
  {
    range: "1-2%",
    netSales: 4830,
    profitValue: 1240,
    totalDiscount: 2146.83,
    avgRate: 1.01,
  },
  {
    range: "2-5%",
    netSales: 12147,
    profitValue: 3210,
    totalDiscount: 41022.07,
    avgRate: 3.06,
  },
  {
    range: "5-10%",
    netSales: 38321,
    profitValue: 9870,
    totalDiscount: 43122.97,
    avgRate: 6.15,
  },
  {
    range: "11-25%",
    netSales: 80000,
    profitValue: 22100,
    totalDiscount: 82855.13,
    avgRate: 14.68,
  },
];
const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2)}K` : fmt2(n));

type AxisTooltipParam = {
  axisValueLabel?: string;
  marker?: string;
  seriesName?: string;
  value?: number | string;
};

function formatAxisTooltip(params: AxisTooltipParam | AxisTooltipParam[]) {
  const items = Array.isArray(params) ? params : [params];
  const title = items[0]?.axisValueLabel ?? "";
  const rows = items
    .map(
      (item) => `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:14px;">
          <div style="display:flex; align-items:center;">
            <span style="display:inline-flex; margin-inline-end:8px;">${item.marker ?? ""}</span>
            <span>${item.seriesName ?? ""}</span>
          </div>
          <strong>${
            typeof item.value === "number" ? fmtK(item.value) : (item.value ?? "")
          }</strong>
        </div>`,
    )
    .join("");

  return `
    <div style="display:flex; flex-direction:column; gap:8px; min-width:160px;">
      <div style="font-weight:700;">${title}</div>
      ${rows}
    </div>`;
}

const NetSalesProfitMarginAndDiscountsByDiscountRange = () => {
  const palette = useResolvedAnalyticsPalette();

  const rangeBarOption = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#1a2035",
      borderColor: "#1e293b",
      textStyle: { color: "#e2e8f0", fontSize: 10 },
      formatter: (params: AxisTooltipParam | AxisTooltipParam[]) =>
        formatAxisTooltip(params),
    },
    legend: {
      data: ["صافي المبيعات", "قيمة الربح", "إجمالي الخصومات"],
      bottom: 0,
      textStyle: { color: "#64748b", fontSize: 9 },
    },
    grid: {
      bottom: "18%",
      top: "10%",
      left: "3%",
      right: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category" as const,
      data: discountRanges.map((r) => r.range),
      axisLabel: { fontSize: 10, color: "#64748b" },
      axisLine: { lineStyle: { color: "#334155" } },
    },
    yAxis: [
      {
        type: "value" as const,
        name: "اجمالي المبيعات",
        nameLocation: "end" as const,
        nameGap: 10,
        nameTextStyle: { color: "#64748b", fontSize: 12 },
        axisLabel: {
          formatter: (v: number) => fmtK(v),
          fontSize: 9,
          color: "#64748b",
        },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      {
        type: "value" as const,
        name: "معدل الخصم %",
        nameLocation: "end" as const,
        nameGap: 10,
        nameTextStyle: { color: "#64748b", fontSize: 12 },
        axisLabel: { formatter: "{value}%", fontSize: 9, color: "#64748b" },
      },
    ],
    series: [
      {
        name: "صافي المبيعات",
        type: "bar",
        data: discountRanges.map((r) => ({
          value: r.netSales,
          itemStyle: {
            color: palette.primaryGreen,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 32,
      },
      {
        name: "قيمة الربح",
        type: "bar",
        data: discountRanges.map((r) => ({
          value: r.profitValue,
          itemStyle: { color: palette.primaryCyan, borderRadius: [4, 4, 0, 0] },
        })),
        barMaxWidth: 32,
      },
      {
        name: "إجمالي الخصومات",
        type: "bar",
        data: discountRanges.map((r) => ({
          value: r.totalDiscount,
          itemStyle: {
            color: palette.primaryAmber,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 32,
      },
      {
        name: "معدل الخصم %",
        type: "line",
        yAxisIndex: 1,
        data: discountRanges.map((r) => r.avgRate),
        lineStyle: { color: palette.primaryRed, width: 2 },
        itemStyle: { color: palette.primaryRed },
        smooth: true,
      },
    ],
  };

  return (
    <ChartCard
      title="صافي المبيعات وقيمة الربح والخصومات حسب نطاق الخصم"
      subtitle="Net Sales, Profit Value, Total Applied Discounts & Average Discount Rate by Discount Range"
      option={rangeBarOption}
      height="320px"
      delay={1}
    />
  );
};

export default NetSalesProfitMarginAndDiscountsByDiscountRange;
