import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const AtvByPeriod = () => {
  const atvOption = {
    tooltip: { trigger: "axis" as const },
    grid: { left: "4%", right: "8%", top: "8%", bottom: "14%" },
    xAxis: {
      type: "value" as const,
      axisLabel: { fontSize: 9 },
      max: 100,
      name: "%",
      nameLocation: "end" as const,
    },
    yAxis: {
      type: "category" as const,
      data: ["ATV (كامل الفترة)", "ATV الفترة 1", "ATV الفترة 2"],
      inverse: true,
      axisLabel: { fontSize: 9 },
    },
    series: [
      {
        type: "bar" as const,
        barWidth: 18,
        data: [
          {
            value: 28.36,
            itemStyle: { color: "#047857", borderRadius: [0, 4, 4, 0] },
          },
          {
            value: 2.44,
            itemStyle: { color: "#3b82f6", borderRadius: [0, 4, 4, 0] },
          },
          {
            value: 15.1,
            itemStyle: { color: "#3b82f6", borderRadius: [0, 4, 4, 0] },
          },
        ],
        label: {
          show: true,
          position: "right" as const,
          fontSize: 10,
          fontWeight: "bold" as const,
          formatter: "{c}",
        },
      },
    ],
  };
  return (
    <ChartCard
      title="ATV حسب الفترة"
      titleFlag="green"
      subtitle="متوسط قيمة المعاملة"
      option={atvOption}
      height="280px"
      delay={3}
    />
  );
};

export default AtvByPeriod;
