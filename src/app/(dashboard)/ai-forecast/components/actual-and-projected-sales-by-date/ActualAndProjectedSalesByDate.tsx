import dynamic from "next/dynamic";
import { forecastData } from "../../utils/forecastData";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const lineOption = {
  tooltip: { trigger: "axis" as const },
  legend: {
    data: ["المبيعات الفعلية", "المبيعات المتوقعة"],
    top: 4,
    textStyle: { fontSize: 9 },
    itemWidth: 12,
    itemHeight: 8,
  },
  grid: { left: "4%", right: "4%", top: "16%", bottom: "12%" },
  xAxis: {
    type: "category" as const,
    data: forecastData.map((d) => d.date.slice(5)),
    axisLabel: { fontSize: 9, rotate: 20 },
    name: "التاريخ",
    nameLocation: "middle" as const,
    nameGap: 30,
    nameTextStyle: { fontSize: 10 },
  },
  yAxis: {
    type: "value" as const,
    axisLabel: {
      formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
      fontSize: 9,
    },
    name: "المبيعات الفعلية والمتوقعة",
    nameTextStyle: { fontSize: 8 },
  },
  series: [
    {
      name: "المبيعات الفعلية",
      type: "line" as const,
      data: forecastData.map((d) => d.actual),
      lineStyle: { color: "#047857", width: 2 },
      itemStyle: { color: "#047857" },
      symbol: "circle",
      symbolSize: 5,
    },
    {
      name: "المبيعات المتوقعة",
      type: "line" as const,
      data: forecastData.map((d) => d.predicted),
      lineStyle: { color: "#3b82f6", width: 2, type: "dashed" as const },
      itemStyle: { color: "#3b82f6" },
      symbol: "diamond",
      symbolSize: 5,
    },
  ],
};

const ActualAndProjectedSalesByDate = () => {
  return (
    <div className="w-full">
      <ChartCard
        title="المبيعات الفعلية والمتوقعة حسب التاريخ"
        subtitle="Actual Sales and Predicted Sales by Date"
        option={lineOption}
        height="360px"
        aiPowered
        delay={1}
      />
    </div>
  );
};

export default ActualAndProjectedSalesByDate;
