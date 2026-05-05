import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

type AxisTooltipParam = {
  axisValueLabel?: string;
  marker?: string;
  seriesName?: string;
  value?: number | string;
};

function seededNoise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function formatAxisTooltip(params: AxisTooltipParam | AxisTooltipParam[]) {
  const items = Array.isArray(params) ? params : [params];
  const title = items[0]?.axisValueLabel ?? "";
  const rows = items
    .map(
      (item) => `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:14px;">
          <div style="display:flex; align-items:center;">
            <span style="display:inline-flex; margin-inline-end:8px;">${item.marker ?? ""}</span>
            <span>${item.seriesName ?? ""}</span>
          </div>
          <strong>${Number(item.value ?? 0).toLocaleString("en-US")}</strong>
        </div>`,
    )
    .join("");

  return `
    <div style="display:flex; flex-direction:column; gap:8px; min-width:160px;">
      <div style="font-weight:700;">${title}</div>
      ${rows}
    </div>`;
}
const days = Array.from({ length: 90 }, (_, i) => `يوم ${i + 1}`);

const ImpactOfOutageOnTransactionVolume = () => {
  const holidayData = useMemo(
    () =>
      days.map((_, i) => {
        const base = 1800 + Math.sin(i * 0.15) * 400;
        const spike = [14, 28, 42, 58, 72, 85].includes(i)
          ? 4000 + seededNoise(i + 101) * 3000
          : 0;
        return Math.round(base + spike + seededNoise(i + 202) * 300);
      }),
    [],
  );

  const holidayDates = useMemo(() => {
    const start = new Date(2025, 0, 1); // 2025-01-01
    const pad2 = (n: number) => String(n).padStart(2, "0");
    return Array.from({ length: 90 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = pad2(d.getMonth() + 1);
      const dd = pad2(d.getDate());
      return `${yyyy}-${mm}-${dd}`;
    });
  }, []);

  const holidayOption = {
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: AxisTooltipParam | AxisTooltipParam[]) =>
        formatAxisTooltip(params),
    },
    grid: { left: "8%", right: "4%", top: "8%", bottom: "10%" },
    xAxis: {
      type: "category" as const,
      data: holidayDates,
      axisLabel: {
        show: true,
        fontSize: 9,
        rotate: 45,
        interval: 9, // show every ~10th day for readability
      },
      splitLine: { show: false },
    },
    yAxis: { type: "value" as const, axisLabel: { fontSize: 9 } },
    series: [
      {
        type: "line" as const,
        data: holidayData,
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 1.5, color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.20)" },
              { offset: 1, color: "rgba(59,130,246,0.02)" },
            ],
          },
        },
      },
    ],
    dataZoom: [{ type: "inside" as const, start: 0, end: 100 }],
  };
  return (
    <ChartCard
      title="تأثير العطل على حجم المعاملات"
      subtitle="Holiday Impact on Transaction Volume"
      option={holidayOption}
      height="320px"
      delay={1}
    />
  );
};

export default ImpactOfOutageOnTransactionVolume;
