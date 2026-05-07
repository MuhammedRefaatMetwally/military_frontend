/**
 * Constants for Net Profit and Sales By Date component
 */

export type LevelType = "year" | "quarter" | "month";
export type IndicatorType = "both" | "sales" | "profit";
export type QuarterType = 1 | 2 | 3 | 4;

// ─── Month and Quarter Labels ─────────────────────────────────────────────

export const ARABIC_MONTHS_SHORT = [
  "يناير",
  "فبراير",
  "مارس",
  "إبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export const QUARTER_MONTHS: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
};

export const QUARTER_LABELS: Record<QuarterType, string> = {
  1: "الربع الأول",
  2: "الربع الثاني",
  3: "الربع الثالث",
  4: "الربع الرابع",
};

export const QUARTER_SHORT: Record<QuarterType, string> = {
  1: "Q1",
  2: "Q2",
  3: "Q3",
  4: "Q4",
};

// ─── UI Button Configurations ────────────────────────────────────────────

export const indicatorButtons: { value: IndicatorType; label: string }[] = [
  { value: "sales", label: "المبيعات" },
  { value: "profit", label: "الأرباح" },
  { value: "both", label: "كلاهما" },
];

export const levelButtons: { value: LevelType; label: string }[] = [
  { value: "year", label: "سنوي" },
  { value: "quarter", label: "ربع سنوي" },
  { value: "month", label: "شهري" },
];

// ─── Y-Axis Definitions ──────────────────────────────────────────────────

export const salesYAxis = {
  type: "value" as const,
  name: "المبيعات",
  position: "left" as const,
  min: 0,
  axisLine: { show: true, onZero: false },
  axisTick: { show: true },
  splitLine: { show: true },
  axisLabel: { formatter: (v: number) => `${(v / 1_000_000).toFixed(1)}M` },
  nameLocation: "end" as const,
  nameGap: 12,
};

export const profitYAxis = {
  type: "value" as const,
  name: "الأرباح",
  position: "right" as const,
  min: 0,
  axisLine: { show: true, onZero: false },
  axisTick: { show: true },
  splitLine: { show: false },
  axisLabel: { formatter: (v: number) => `${(v / 1_000_000).toFixed(1)}M` },
  nameLocation: "end" as const,
  nameGap: 12,
};

// ─── Empty Chart State ───────────────────────────────────────────────────

export const EMPTY_OPTION = {
  xAxis: { type: "category" as const, data: [] },
  yAxis: { type: "value" as const },
  series: [],
};

// ─── Utility Functions ───────────────────────────────────────────────────

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

/**
 * Dynamically calculate chart height based on item count
 */
export function getChartHeight(itemCount: number): string {
  if (itemCount <= 6) return "260px";
  if (itemCount <= 12) return "300px";
  if (itemCount <= 20) return "340px";
  if (itemCount <= 30) return "380px";
  return "420px";
}

/**
 * Dynamically calculate bar width based on item count
 */
export function getBarWidth(itemCount: number): number {
  if (itemCount <= 6) return 48;
  if (itemCount <= 12) return 40;
  if (itemCount <= 18) return 28;
  if (itemCount <= 24) return 20;
  if (itemCount <= 36) return 14;
  return 10;
}
