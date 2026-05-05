import dynamic from "next/dynamic";
import { paymentRows } from "../../utils/data";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const SalesByPaymentMethod = () => {
  const palette = useResolvedAnalyticsPalette();

  const methods = paymentRows.map((r) => r.method);

  const nonInstantData = paymentRows.map((r) =>
    r.paymentType === "دفع غير فوري" ? r.sales : null,
  );

  const instantData = paymentRows.map((r) =>
    r.paymentType === "الدفع الفوري" ? r.sales : null,
  );

  const paymentTypeOption = {
    tooltip: {
      trigger: "axis" as const,
      axisPointer: {
        type: "shadow" as const,
      },
      formatter: (params: any[]) => {
        const active = params.find(
          (p) => p.value !== null && p.value !== undefined,
        );
        if (!active) return "";

        return `
          <div style="min-width:160px;">
            <div style="font-weight:600; margin-bottom:6px;">${active.name}</div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:14px;">
              <div style="display:flex; align-items:center;">
                <span style="display:inline-flex; margin-inline-end:8px;">${active.marker}</span>
                <span>${active.seriesName}</span>
              </div>
              <strong>${Number(active.value).toLocaleString("en-US")}</strong>
            </div>
          </div>
        `;
      },
    },

    legend: {
      top: 0,
      textStyle: {
        color: "#94a3b8",
        fontSize: 11,
      },
    },

    grid: {
      left: 40,
      right: 20,
      top: 45,
      bottom: 40,
    },

    xAxis: {
      type: "category" as const,
      data: methods,
      axisTick: { show: false },
      axisLabel: {
        color: "#94a3b8",
        fontSize: 11,
      },
    },

    yAxis: {
      type: "value" as const,
      name: "المبيعات",
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        color: "#94a3b8",
      },
    },

    series: [
      {
        name: "دفع غير فوري",
        type: "bar" as const,
        data: nonInstantData,
        barWidth: 40,
        itemStyle: {
          color: palette.primaryBlue,
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: "top" as const,
          formatter: (p: any) =>
            p.value ? `${(Number(p.value) / 1000).toFixed(1)}K` : "",
          color: "#94a3b8",
          fontSize: 10,
        },
      },
      {
        name: "الدفع الفوري",
        type: "bar" as const,
        data: instantData,
        barWidth: 40,
        itemStyle: {
          color: palette.primaryGreen,
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: "top" as const,
          formatter: (p: any) =>
            p.value ? `${(Number(p.value) / 1000).toFixed(1)}K` : "",
          color: "#94a3b8",
          fontSize: 10,
        },
      },
    ],
  };

  return (
    <ChartCard
      title="المبيعات حسب طريقة الدفع"
      titleFlag="green"
      titleFlagNumber={4}
      subtitle="Net Sales and Product Sales Volume by Payment Type"
      option={paymentTypeOption}
      height="320px"
      delay={1}
    />
  );
};

export default SalesByPaymentMethod;
