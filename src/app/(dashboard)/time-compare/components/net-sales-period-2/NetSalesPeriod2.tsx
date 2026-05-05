import dynamic from "next/dynamic";
import { monthOrdinalAr } from "../../utils/data";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const p2Dates = Array.from({ length: 22 }, (_, i) => {
  const d = new Date(2021, 10 + i, 1);
  const ord = monthOrdinalAr[d.getMonth()] ?? `${d.getMonth() + 1}`;
  return `الشهر ${ord} ${d.getFullYear()}`;
});
const p2Sales = [
  3200, 3800, 4200, 5400, 4800, 5200, 4000, 3600, 6200, 5800, 7200, 8400, 6800,
  5600, 7800, 8200, 9400, 7600, 8800, 6400, 7000, 9800,
];

const NetSalesPeriod2 = () => {
  const p2Option = {
    tooltip: { trigger: "axis" as const },
    grid: { left: "10%", right: "4%", top: "8%", bottom: "14%" },
    xAxis: {
      type: "category" as const,
      data: p2Dates,
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
        data: p2Sales,
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
      title="صافي المبيعات — الفترة 2"
      titleFlag="green"
      subtitle="Net Sales Period 2 by Date"
      option={p2Option}
      height="280px"
      delay={2}
    />
  );
};

export default NetSalesPeriod2;
