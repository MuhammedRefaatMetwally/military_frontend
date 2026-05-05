import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

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
          <strong>${Number(item.value ?? 0).toLocaleString("en-US")}</strong>
        </div>`,
    )
    .join("");

  return `
    <div style="display:flex; flex-direction:column; gap:8px; min-width:160px;">
      <div style="font-weight:700;">${title}</div>
      ${rows}
    </div>`;
}

const years = ["2020", "2021", "2022"];
const yearData = [
  {
    year: "2020",
    branches: [
      { name: "سوق المنارة", val: 20257 },
      { name: "سوق سلاح الجو", val: 18400 },
      { name: "سوق العساكرة", val: 12300 },
    ],
  },
  {
    year: "2021",
    branches: [
      { name: "سوق المنارة", val: 14137 },
      { name: "سوق سلاح الجو", val: 16200 },
      { name: "سوق العساكرة", val: 10800 },
    ],
  },
  {
    year: "2022",
    branches: [
      { name: "سوق المنارة", val: 28000 },
      { name: "سوق سلاح الجو", val: 21000 },
      { name: "سوق العساكرة", val: 15500 },
    ],
  },
];

const NumberOfInvoicesByYearAndBranch = () => {
  const palette = useResolvedAnalyticsPalette();

  const allBranchNames = ["سوق المنارة", "سوق سلاح الجو", "سوق العساكرة"];
  const branchColors = useMemo(
    // Distinct, high-contrast colors (avoid close hues like cyan vs blue)
    () => [palette.primaryGreen, palette.primaryAmber, palette.primaryBlue],
    [palette],
  );
  const waterfallOption = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "var(--bg-panel)",
      borderColor: "var(--border-subtle)",
      textStyle: { color: "var(--text-primary)", fontSize: 11 },
      formatter: (params: AxisTooltipParam | AxisTooltipParam[]) =>
        formatAxisTooltip(params),
    },
    legend: {
      data: allBranchNames,
      bottom: 0,
      left: "center",
      type: "scroll" as const,
      textStyle: { fontSize: 10, color: "var(--text-muted)" },
      itemWidth: 14,
      itemHeight: 10,
      pageIconSize: 10,
    },
    grid: { left: "8%", right: "4%", top: "12%", bottom: "18%" },
    xAxis: {
      type: "category" as const,
      data: years,
      axisLabel: { fontSize: 12, fontWeight: "bold" },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value" as const,
      min: 0,
      max: 30000,
      interval: 5000,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        fontSize: 10,
      },
      splitLine: {
        lineStyle: { color: "var(--border-subtle)", type: "dashed" as const },
      },
    },
    series: allBranchNames.map((br, bi) => ({
      name: br,
      type: "bar" as const,
      barWidth: 32,
      barGap: "15%",
      itemStyle: {
        color: branchColors[bi],
        borderRadius: [6, 6, 0, 0],
      },
      data: yearData.map(
        (yd) => yd.branches.find((b) => b.name === br)?.val || 0,
      ),
      label: {
        show: false,
      },
    })),
  };
  return (
    <ChartCard
      title="عدد الفواتير حسب السنة والفرع"
      subtitle="Count of Transactions by Year & Branch Location"
      option={waterfallOption}
      height="320px"
      delay={2}
    />
  );
};

export default NumberOfInvoicesByYearAndBranch;
