import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const AdvantageOfDiscountsAndCoupons = () => {
  const palette = useResolvedAnalyticsPalette();

  // ── استفادة من الخصومات والكوبونات ──
  const discountUsageOption = {
    xAxis: {
      type: "category" as const,
      data: Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`),
    },
    yAxis: [
      {
        type: "value" as const,
        name: "العملاء",
        axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
      },
      { type: "value" as const, name: "الاستفادة %" },
    ],
    series: [
      {
        name: "مستخدمي الخصومات",
        type: "bar",
        data: [
          12000, 14000, 18000, 15000, 16000, 22000, 20000, 19000, 24000, 21000,
          28000, 35000,
        ].map((v) => ({
          value: v,
          itemStyle: {
            color: palette.primaryGreen,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barWidth: 18,
      },
      {
        name: "نسبة الاستفادة",
        type: "line",
        yAxisIndex: 1,
        data: [13, 15, 19, 16, 17, 24, 22, 21, 26, 23, 30, 38],
        lineStyle: { color: palette.primaryCyan, width: 2 }, // normalized cyan/blue
        itemStyle: { color: palette.primaryCyan },
      },
    ],
    legend: {
      data: ["مستخدمي الخصومات", "نسبة الاستفادة"],
      bottom: 0,
      left: "center",
    },
  };
  return (
    <ChartCard
      title="استفادة من الخصومات والكوبونات"
      titleFlag="green"
      subtitle="عدد المستخدمين ونسبة الاستفادة الشهرية"
      option={discountUsageOption}
      headerExtra={
        <div
          className="mt-2 flex flex-wrap items-center gap-3 text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          <span
            className="font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            الإيضاح:
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block rounded-sm"
              style={{
                width: 14,
                height: 10,
                background: palette.primaryGreen,
                border: "1px solid var(--border-subtle)",
              }}
            />
            <span>عدد المستخدمين (أعمدة)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block rounded-full"
              style={{
                width: 14,
                height: 3,
                background: palette.primaryCyan,
              }}
            />
            <span>النسبة % (خط)</span>
          </span>
        </div>
      }
      height="300px"
      delay={5}
    />
  );
};

export default AdvantageOfDiscountsAndCoupons;
