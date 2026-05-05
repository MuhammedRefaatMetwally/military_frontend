import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
import { categories } from "../../utils/categories";
import { hexToRgba } from "../../utils/hexToRgba";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const DiscountRatesAndGroupSalesVolume = () => {
  const palette = useResolvedAnalyticsPalette();

  const scatterOption = {
    tooltip: {
      trigger: "item" as const,
      backgroundColor: "#1a2035",
      borderColor: "#1e293b",
      textStyle: { color: "#e2e8f0", fontSize: 10 },
      formatter: (p: { data: [number, number, string] }) => {
        const marginPct = p.data[1] / 1000;
        return `<b style="color:#00e5a0">${p.data[2]}</b><br/>نسبة الخصم: ${p.data[0].toFixed(2)}%<br/>نسبة الربح: ${marginPct.toFixed(2)}%<br/>`;
      },
    },
    legend: {
      show: true,
      data: ["نسبة الربح"],
      bottom: 0,
      left: "center",
      itemWidth: 10,
      itemHeight: 10,
      icon: "circle",
      textStyle: { color: "#64748b", fontSize: 9 },
      itemStyle: { color: palette.primaryGreen },
    },
    xAxis: {
      name: "نسبة الخصم %",
      type: "value" as const,
      nameLocation: "middle" as const,
      nameGap: 32,
      nameTextStyle: { color: "#64748b", fontSize: 9 },
      axisLabel: { formatter: "{value}%", fontSize: 9, color: "#64748b" },
      splitLine: { lineStyle: { color: "#1e293b" } },
    },
    yAxis: {
      name: "حجم مبيعات المنتجات",
      type: "value" as const,
      nameLocation: "middle" as const,
      nameGap: 40,
      nameTextStyle: { color: "#64748b", fontSize: 9 },
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        fontSize: 9,
        color: "#64748b",
      },
      splitLine: { lineStyle: { color: "#1e293b" } },
    },
    series: [
      {
        name: "نسبة الربح",
        type: "scatter",
        symbolSize: (_d: number[], params: { dataIndex: number }) => {
          const m = categories[params.dataIndex]?.withMargin ?? 0;
          return Math.max(10, 6 + Math.sqrt(m) * 2.2);
        },
        data: categories.map((c) => [
          c.withSales * 5,
          c.withMargin * 1000,
          c.name,
        ]),
        itemStyle: {
          color: palette.primaryGreen,
          opacity: 0.8,
          borderColor: hexToRgba(palette.primaryGreen, 0.25),
          borderWidth: 1,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            formatter: (p: { data: (number | string)[] }) =>
              String(p.data[2]).split(/[ ،]/)[0],
            fontSize: 9,
            color: "#e2e8f0",
            position: "top" as const,
          },
        },
      },
    ],
    grid: {
      bottom: "22%",
      top: "14%",
      left: "8%",
      right: "5%",
      containLabel: true,
    },
  };

  return (
    <ChartCard
      title="نوع الخصم وحجم مبيعات المجموعات"
      titleFlag="green"
      subtitle="Discount % vs product sales volume; bubble size = profit margin %"
      option={scatterOption}
      height="360px"
      delay={2}
    />
  );
};

export default DiscountRatesAndGroupSalesVolume;
