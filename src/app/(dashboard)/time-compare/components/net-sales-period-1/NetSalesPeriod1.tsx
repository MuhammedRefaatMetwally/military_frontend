import dynamic from "next/dynamic";
import { monthOrdinalAr } from "../../utils/data";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

// ── بيانات الفترة 1 (Feb 2020 → Jan 2021) ──
const p1Dates = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2020, 1 + i, 1);
  const ord = monthOrdinalAr[d.getMonth()] ?? `${d.getMonth() + 1}`;
  return `الشهر ${ord} ${d.getFullYear()}`;
});
const p1Sales = [
  1200, 1400, 2800, 3400, 1800, 2200, 1600, 2000, 1900, 2600, 3000, 2100,
];
const NetSalesPeriod1 = () => {
  const p1Option = {
    tooltip: { trigger: "axis" as const },
    grid: { left: "10%", right: "4%", top: "8%", bottom: "14%" },
    xAxis: {
      type: "category" as const,
      data: p1Dates,
      axisLabel: { fontSize: 8, rotate: 30 },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(1)}K`,
        fontSize: 9,
      },
    },
    series: [
      {
        type: "line" as const,
        data: p1Sales,
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 1.5, color: "#2563eb" },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(37,99,235,0.2)" },
              { offset: 1, color: "rgba(37,99,235,0.01)" },
            ],
          },
        },
      },
    ],
  };
  return (
    <ChartCard
      title="صافي المبيعات — الفترة 1"
      titleFlag="green"
      subtitle="Net Sales Period 1 by Date"
      option={p1Option}
      height="280px"
      delay={1}
    />
  );
};

export default NetSalesPeriod1;
