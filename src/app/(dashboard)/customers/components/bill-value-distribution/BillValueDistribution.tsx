import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const BillValueDistribution = () => {
  const greenToRedScale = useMemo(
    () => [
      "#16a34a", // green
      "#84cc16", // lime
      "#facc15", // yellow
      "#fb923c", // orange
      "#ef4444", // red
      "#b91c1c", // dark red
    ],
    [],
  );
  // ── قيمة الفاتورة ──
  const invoiceValueOption = {
    xAxis: {
      type: "category" as const,
      data: ["<20", "20-50", "50-100", "100-200", "200-500", "500+"],
    },
    yAxis: {
      type: "value" as const,
      name: "العملاء",
      axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
    },
    series: [
      {
        type: "bar",
        data: [8000, 22000, 32000, 18000, 9000, 3500].map((v, i) => ({
          value: v,
          itemStyle: {
            color: greenToRedScale[i % greenToRedScale.length],
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barWidth: 32,
      },
    ],
  };

  return (
    <ChartCard
      title="توزيع قيمة الفاتورة"
      subtitle="عدد العملاء حسب قيمة الفاتورة (د.أ)"
      option={invoiceValueOption}
      height="340px"
      delay={4}
    />
  );
};

export default BillValueDistribution;
