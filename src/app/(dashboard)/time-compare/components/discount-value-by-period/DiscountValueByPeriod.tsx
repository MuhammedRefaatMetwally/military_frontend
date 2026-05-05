import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const DiscountValueByPeriod = () => {
  const discountPieOption = {
    tooltip: { trigger: "item" as const, formatter: "{b}: {c} ({d}%)" },
    legend: {
      data: ["الفترة 1", "الفترة 2"],
      bottom: 0,
      textStyle: { fontSize: 9 },
    },
    series: [
      {
        type: "pie" as const,
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        label: { show: true, formatter: "{c}K\n({d}%)", fontSize: 9 },
        data: [
          { value: 12.2, name: "الفترة 1", itemStyle: { color: "#047857" } },
          { value: 100.87, name: "الفترة 2", itemStyle: { color: "#3b82f6" } },
        ],
      },
    ],
  };
  return (
    <ChartCard
      title="قيمة الخصم حسب الفترة"
      titleFlag="green"
      subtitle="Discount Value by Period"
      option={discountPieOption}
      height="300px"
      delay={3}
    />
  );
};

export default DiscountValueByPeriod;
