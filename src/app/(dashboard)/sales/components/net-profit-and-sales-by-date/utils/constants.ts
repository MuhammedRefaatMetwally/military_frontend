export const DRILL_YEARS = ["2023", "2024", "2025"] as const;
export type DrillYear = (typeof DRILL_YEARS)[number];

export const yearRevenueMultipliers: Record<DrillYear, number> = {
  "2023": 0.82,
  "2024": 0.92,
  "2025": 1,
};

export const YEAR_SEP_LINE_WIDTH = 1;
export const YEAR_SEP_COLOR = "rgba(148, 163, 184, 0.55)";
