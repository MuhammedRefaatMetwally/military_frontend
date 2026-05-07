/**
 * Constants for Net Profit and Sales By Classification component
 */

export const GROUP_OPTIONS = [
  { value: 1, label: "المجموعة الأولى" },
  { value: 2, label: "المجموعة الثانية" },
  { value: 3, label: "المجموعة الثالثة" },
] as const;

export type GroupLevel = (typeof GROUP_OPTIONS)[number]["value"];

export const EMPTY_OPTION = {
  xAxis: { type: "category" as const, data: [] },
  yAxis: [
    { type: "value" as const, name: "الكمية" },
    { type: "value" as const, name: "د.أ" },
  ],
  series: [],
};

export const CHART_LEGEND = {
  data: ["الكمية المباعة", "قيمة البيع", "الأرباح"],
  bottom: 18,
  left: "center" as const,
  textStyle: { color: "#94a3b8", fontSize: 11 },
};

export const CHART_GRID = {
  left: "4%",
  right: "5%",
  top: "14%",
  bottom: "22%",
  containLabel: true,
};

export const CHART_Y_AXIS = [
  {
    type: "value" as const,
    name: "الكمية",
    position: "left" as const,
    axisLine: { show: true, onZero: false },
    axisTick: { show: true },
    splitLine: { show: true },
    axisLabel: { formatter: (v: number) => `${(v / 1_000).toFixed(0)}K` },
    nameLocation: "end" as const,
    nameGap: 12,
  },
  {
    type: "value" as const,
    name: "د.أ",
    position: "right" as const,
    axisLine: { show: true, onZero: false },
    axisTick: { show: true },
    splitLine: { show: false },
    axisLabel: { formatter: (v: number) => `${(v / 1_000_000).toFixed(1)}M` },
    nameLocation: "end" as const,
    nameGap: 12,
  },
];

export const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];

/**
 * Normalize string selections: filter out empty values and "all"
 */
export function normalizeSelections(values: string[]): string[] {
  return values.filter((v) => v && v !== "all");
}

/**
 * Parse string to integer, return undefined if invalid
 */
export function toInt(s: string): number | undefined {
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) || s === "" ? undefined : n;
}
