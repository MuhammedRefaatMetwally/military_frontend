import dynamic from "next/dynamic";

// ── أسباب المرتجعات حسب المنتج ──
const returnsReasonsOption = {
  xAxis: {
    type: "value" as const,
    name: "عدد المرتجعات",
    nameLocation: "middle" as const,
    nameGap: 32,
  },
  yAxis: {
    type: "category" as const,
    data: [
      "عيب تصنيع",
      "انتهاء صلاحية",
      "خطأ طلب",
      "تلف أثناء النقل",
      "عدم مطابقة",
      "أخرى",
    ],
    inverse: true,
  },
  series: [
    {
      type: "bar",
      data: [1200, 980, 750, 620, 450, 380].map((v, i) => ({
        value: v,
        itemStyle: {
          color: [
            "#dc2626",
            "#d97706",
            "#2563eb",
            "#7c3aed",
            "#0891b2",
            "#64748b",
          ][i],
          borderRadius: [0, 4, 4, 0],
        },
      })),
      barWidth: 16,
    },
  ],
};

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const CausesOfReturns = () => {
  return (
    <ChartCard
      title="أسباب المرتجعات"
      subtitle="تحليل أسباب المرتجعات حسب النوع"
      option={returnsReasonsOption}
      height="320px"
      delay={2}
    />
  );
};

export default CausesOfReturns;
