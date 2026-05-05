import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { getProductData } from "@/lib/mockData";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const products = getProductData();

const yAxis = [
  {
    type: "value" as const,
    name: "الكمية",
    axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
  },
  {
    type: "value" as const,
    name: "د.أ",
    axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
  },
];

const createSalesOverviewSeries = (
  data: typeof products,
  palette: ReturnType<typeof useResolvedAnalyticsPalette>,
) => [
  {
    name: "الكمية المباعة",
    type: "bar",
    data: data.map((p) => p.unitsSold),
    itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] },
    barWidth: 14,
    barGap: "12%",
  },
  {
    name: "قيمة البيع",
    type: "bar",
    yAxisIndex: 1,
    data: data.map((p) => p.revenue),
    itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
    barWidth: 14,
    barGap: "12%",
  },
  {
    name: "الأرباح",
    type: "line",
    yAxisIndex: 1,
    data: data.map((p) => Math.round((p.revenue * p.margin) / 100)),
    lineStyle: { color: palette.primarySlate, width: 2 },
    itemStyle: { color: palette.primarySlate },
  },
];

const legend = {
  data: ["الكمية المباعة", "قيمة البيع", "الأرباح"],
  bottom: 18,
  left: "center",
};

const classificationOptions = [
  { value: "group-1", label: "المجموعة الاولي" },
  { value: "group-2", label: "المجموعة الثانية" },
  { value: "group-3", label: "المجموعة الثالثة" },
] as const;

const NetProfitAndSalesByClassification = () => {
  const palette = useResolvedAnalyticsPalette();
  const [selectedClassification, setSelectedClassification] =
    useState<(typeof classificationOptions)[number]["value"]>("group-2");

  const salesVsProfitSlice = useMemo(() => products.slice(0, 8), []);

  const xAxis = useMemo(
    () => ({
      type: "category" as const,
      data: salesVsProfitSlice.map((product) =>
        product.nameAr.split(" ").slice(0, 2).join(" "),
      ),
      axisLabel: { rotate: 35, fontSize: 10 },
    }),
    [salesVsProfitSlice],
  );

  const salesVsProfitOption = {
    xAxis,
    yAxis,
    series: createSalesOverviewSeries(salesVsProfitSlice, palette),
    legend,
  };

  return (
    <ChartCard
      title="صافي الأرباح والمبيعات حسب التصنيف"
      subtitle="مقارنة حسب التصنيف"
      titleFlag="green"
      titleFlagNumber={2}
      headerExtra={
        <div className="flex items-center gap-0.5 flex-wrap justify-end">
          <span
            className="text-[9px] shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            التصنيف:
          </span>
          <div
            className="flex items-center gap-0.5 flex-wrap"
            role="radiogroup"
            aria-label="التصنيف"
          >
            {classificationOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selectedClassification === option.value}
                onClick={() => setSelectedClassification(option.value)}
                className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
                style={{
                  background:
                    selectedClassification === option.value
                      ? "var(--accent-green-dim)"
                      : "var(--bg-elevated)",
                  color:
                    selectedClassification === option.value
                      ? "var(--accent-green)"
                      : "var(--text-muted)",
                  border: `1px solid ${selectedClassification === option.value ? "var(--accent-green)" : "var(--border-subtle)"}`,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      }
      option={salesVsProfitOption}
      height="340px"
      delay={2}
    />
  );
};

export default NetProfitAndSalesByClassification;
