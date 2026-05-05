import { BarChart3, Target, TrendingUp, X } from "lucide-react";
import { forecastData } from "../../utils/forecastData";
import dynamic from "next/dynamic";
import VerticalIndicatorCard from "./VerticalIndicatorCard";

const accuracy = 99.03;

const gaugeOption = {
  grid: {
    show: false,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  xAxis: {
    show: false,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { show: false },
  },

  yAxis: {
    show: false,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { show: false },
  },
  series: [
    {
      type: "gauge" as const,
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      radius: "90%",
      center: ["50%", "54%"],
      pointer: { show: false },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: { color: "#3b82f6" },
      },
      axisLine: {
        show: false,
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        show: true,
        fontSize: 8,
        distance: 20,
        formatter: (v: number) => (v === 0 ? "0%" : v === 100 ? "100%" : ""),
      },
      title: {
        show: true,
        offsetCenter: [0, "20%"],
        fontSize: 10,
        color: "var(--text-muted)",
      },
      detail: {
        fontSize: 20,
        fontWeight: "bold" as const,
        offsetCenter: [0, "-10%"],
        formatter: "{value}%",
        color: "#3b82f6",
      },
      data: [{ value: accuracy, name: "متوسط الدقة" }],
    },
  ],
};
const fmtK = (n: number) => `${(n / 1000).toFixed(2)}K`;
const totalActual = forecastData.reduce((a, b) => a + b.actual, 0);
const totalPredicted = forecastData.reduce((a, b) => a + b.predicted, 0);
const indicators = [
  {
    icon: BarChart3,
    iconOrbBackground: "rgba(4,120,87,0.1)",
    iconColor: "var(--accent-green)",
    titleAr: "إجمالي المبيعات الفعلية",
    titleEn: "Actual Sales (Total)",
    value: fmtK(totalActual),
    valueColor: "var(--accent-green)",
  },
  {
    icon: Target,
    iconOrbBackground: "rgba(37,99,235,0.1)",
    iconColor: "var(--accent-blue)",
    titleAr: "إجمالي المبيعات المتوقعة",
    titleEn: "Predicted Sales (Total)",
    value: fmtK(totalPredicted),
    valueColor: "var(--accent-blue)",
  },
  {
    icon: TrendingUp,
    iconOrbBackground: "rgba(8,145,178,0.1)",
    iconColor: "var(--accent-cyan)",
    titleAr: "متوسط الانحراف المطلق",
    titleEn: "Mean Absolute Deviation (MAD)",
    value: "0.01",
    valueColor: "var(--accent-cyan)",
  },
];

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const VerticalIndicators = () => {
  return (
    <div className="grid grid-cols-4 gap-4 w-full">
      {indicators.map((item, index) => (
        <VerticalIndicatorCard key={index} {...item} />
      ))}

      <div>
        <ChartCard
          title="متوسط الدقة"
          subtitle="Average of Accuracy"
          option={gaugeOption}
          height="180px"
          aiPowered
          delay={2}
        />
      </div>
    </div>
  );
};

export default VerticalIndicators;
