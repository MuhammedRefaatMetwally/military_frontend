import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const hours = [
  "6ص",
  "7ص",
  "8ص",
  "9ص",
  "10ص",
  "11ص",
  "12م",
  "1م",
  "2م",
  "3م",
  "4م",
  "5م",
  "6م",
  "7م",
  "8م",
  "9م",
];

const days = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const heatmapData: number[][] = [];
hours.forEach((_, hi) => {
  days.forEach((_, di) => {
    let val = 20 + Math.random() * 30;
    if (hi >= 4 && hi <= 8) val += 40; // 10am-2pm rush
    if (hi >= 11 && hi <= 13) val += 25; // 5pm-7pm rush
    if (di === 4) val -= 15; // Thursday less
    if (di === 5) val *= 0.5; // Friday
    heatmapData.push([hi, di, Math.round(Math.max(5, val))]);
  });
});

const HeatMapPeaksTime = () => {
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
  const heatmapOption = {
    // leave room for the vertical color ruler (visualMap) on the right
    grid: { left: "3%", right: "6%", top: "5%", bottom: "10%" },
    xAxis: {
      type: "category" as const,
      data: hours,
      splitArea: { show: true },
      axisLabel: { fontSize: 10 },
    },
    yAxis: {
      type: "category" as const,
      data: days,
      splitArea: { show: true },
      axisLabel: { fontSize: 10 },
    },
    visualMap: {
      min: 5,
      max: 95,
      calculable: true,
      orient: "vertical" as const,
      right: 0,
      top: "middle",
      itemHeight: 180,
      itemWidth: 14,
      inRange: { color: greenToRedScale },
      textStyle: { color: "var(--text-muted)" },
    },
    series: [
      {
        type: "heatmap",
        data: heatmapData,
        label: { show: true, fontSize: 9 },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.3)" },
        },
      },
    ],
  };
  return (
    <ChartCard
      title="خريطة حرارية — أوقات الذروة"
      titleFlag="green"
      subtitle="كثافة العملاء حسب اليوم والساعة (Heatmap)"
      option={heatmapOption}
      height="340px"
      delay={1}
    />
  );
};

export default HeatMapPeaksTime;
