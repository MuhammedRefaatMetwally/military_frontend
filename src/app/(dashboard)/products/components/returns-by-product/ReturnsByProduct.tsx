import { getProductData } from "@/lib/mockData";
import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const products = getProductData();

const ReturnsByProduct = () => {
  const returnsOption = {
    tooltip: { trigger: "axis" as const },
    xAxis: {
      type: "category" as const,
      data: products
        .slice(0, 8)
        .map((p) => p.nameAr.split(" ").slice(0, 2).join(" ")),
      axisLabel: { rotate: 30, fontSize: 9 },
      splitLine: { show: false },
    },
    yAxis: { type: "value" as const, axisLabel: { fontSize: 9 } },
    series: [
      {
        name: "المرتجعات",
        type: "bar",
        data: [320, 180, 420, 150, 95, 210, 110, 280].map((v) => ({
          value: v,
          itemStyle: { color: "#dc2626", borderRadius: [4, 4, 0, 0] },
        })),
        barWidth: 20,
      },
    ],
    grid: { bottom: "16%", top: "10%", containLabel: true },
  };
  return (
    <ChartCard
      title="المرتجعات حسب المنتج"
      titleFlag="green"
      subtitle="عدد المرتجعات مع نسبة الإرجاع"
      option={returnsOption}
      height="480px"
      delay={2}
    />
  );
};

export default ReturnsByProduct;
