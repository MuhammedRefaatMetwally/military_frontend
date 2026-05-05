import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const branches = ["سوق المنارة", "سوق سلاح الجو"];
const branchProfitP1 = [14000, 8500];
const branchProfitP2 = [51000, 31000];
const ProfitValueByBranchAndPeriod = () => {
  const branchProfitOption = {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: ["الفترة 1", "الفترة 2"],
      top: 4,
      textStyle: { fontSize: 9 },
    },
    grid: { left: "8%", right: "4%", top: "18%", bottom: "14%" },
    xAxis: {
      type: "category" as const,
      data: branches,
      axisLabel: { fontSize: 9 },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        fontSize: 9,
      },
    },
    series: [
      {
        name: "الفترة 1",
        type: "bar" as const,
        barWidth: 28,
        data: branchProfitP1.map((v) => ({
          value: v,
          itemStyle: { color: "#047857", borderRadius: [4, 4, 0, 0] },
        })),
      },
      {
        name: "الفترة 2",
        type: "bar" as const,
        barWidth: 28,
        data: branchProfitP2.map((v) => ({
          value: v,
          itemStyle: { color: "#3b82f6", borderRadius: [4, 4, 0, 0] },
        })),
      },
    ],
  };
  return (
    <ChartCard
      title="قيمة الربح حسب الفرع والفترة"
      titleFlag="green"
      subtitle="Profit Value by Branch & Period"
      option={branchProfitOption}
      height="300px"
      delay={2}
    />
  );
};

export default ProfitValueByBranchAndPeriod;
