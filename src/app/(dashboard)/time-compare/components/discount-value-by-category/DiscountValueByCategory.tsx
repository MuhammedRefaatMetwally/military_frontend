import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const categories = [
  "أجهزة",
  "العناية",
  "غير مصنف",
  "فرفاشية",
  "أعمال",
  "منزلية",
  "غذائية",
  "ورقية",
  "منظفات",
];
const catNetP1 = [1400, 4200, 8500, 100, 350, 5200, 15000, 3800, 3400];
const catNetP2 = [3200, 12500, 22000, 300, 1200, 14800, 57500, 8400, 9100];

const DiscountValueByCategory = () => {
  const discCatOption = {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: ["الفترة 1", "الفترة 2"],
      top: 4,
      textStyle: { fontSize: 9 },
    },
    grid: { left: "8%", right: "4%", top: "18%", bottom: "14%" },
    xAxis: {
      type: "category" as const,
      data: categories,
      axisLabel: { fontSize: 8, rotate: 25 },
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
        barWidth: 14,
        data: catNetP1.map((v) => ({
          value: v,
          itemStyle: { color: "#047857", borderRadius: [3, 3, 0, 0] },
        })),
      },
      {
        name: "الفترة 2",
        type: "bar" as const,
        barWidth: 14,
        data: catNetP2.map((v) => ({
          value: v,
          itemStyle: { color: "#3b82f6", borderRadius: [3, 3, 0, 0] },
        })),
      },
    ],
  };
  return (
    <ChartCard
      title="قيمة الخصم حسب الفئة"
      titleFlag="green"
      subtitle="Discount Value by Category & Period"
      option={discCatOption}
      height="300px"
      delay={2}
    />
  );
};

export default DiscountValueByCategory;
