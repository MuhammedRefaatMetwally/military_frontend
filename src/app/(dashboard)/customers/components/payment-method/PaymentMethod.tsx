import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const PaymentMethod = () => {
  const palette = useResolvedAnalyticsPalette();

  const paymentMethodOption = {
    xAxis: {
      show: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      show: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    tooltip: {
      trigger: "item" as const,
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}: <b>${p.percent.toFixed(0)}%</b>`,
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "45%"],
        data: [
          {
            name: "كاش",
            value: 38,
            itemStyle: { color: palette.primaryGreen },
          }, // green
          {
            name: "ذمم",
            value: 14,
            itemStyle: { color: "#f59e0b" },
          }, // amber
          { name: "فيزا", value: 24, itemStyle: { color: "#0ea5e9" } }, // cyan/blue
          {
            name: "كوبون",
            value: 10,
            itemStyle: { color: "#6366f1" },
          }, // indigo
          {
            name: "طلبات",
            value: 14,
            itemStyle: { color: "#94a3b8" },
          }, // muted slate
        ],
        label: {
          color: "#94a3b8",
          fontSize: 11,
          formatter: "{b}\n{d}%",
        },
        labelLine: { lineStyle: { color: "#334155" } },
      },
    ],
  };
  return (
    <ChartCard
      title="طريقة الدفع"
      subtitle="توزيع طرق الدفع للمستهلكين"
      option={paymentMethodOption}
      height="340px"
      delay={3}
    />
  );
};

export default PaymentMethod;
