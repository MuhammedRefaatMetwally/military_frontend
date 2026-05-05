import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const branches = ["سوق المنارة", "سوق سلاح الجو"];
const branchNetSalesP1 = [42000, 26000];
const branchNetSalesP2 = [177000, 89000];
const NetSalesByBranchAndPeriod = () => {
  const branchSalesOption = {
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
        data: branchNetSalesP1.map((v) => ({
          value: v,
          itemStyle: { color: "#047857", borderRadius: [4, 4, 0, 0] },
        })),
      },
      {
        name: "الفترة 2",
        type: "bar" as const,
        barWidth: 28,
        data: branchNetSalesP2.map((v) => ({
          value: v,
          itemStyle: { color: "#3b82f6", borderRadius: [4, 4, 0, 0] },
        })),
      },
    ],
  };
  return (
    <ChartCard
      title="صافي المبيعات حسب الفرع والفترة"
      titleFlag="green"
      subtitle="Net Sales by Branch & Period"
      option={branchSalesOption}
      height="300px"
      delay={1}
    />
  );
};

export default NetSalesByBranchAndPeriod;
