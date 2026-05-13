// ─── Time constants ───────────────────────────────────────────────────────────
export const CURRENT_YEAR = new Date().getFullYear();
export const YEAR_FROM = 2010;

export const ALL_YEARS = Array.from(
  { length: CURRENT_YEAR - YEAR_FROM + 1 },
  (_, i) => YEAR_FROM + i,
);

// ─── Chart layout constants ───────────────────────────────────────────────────
export const BAR_WIDTH = 36;
export const BAR_GAP = 12;
export const PX_PER_BAR = BAR_WIDTH + BAR_GAP + 24;
export const MIN_CHART_WIDTH = 1000;
export const CHART_HEIGHT = 520;

// ─── Arabic quarter labels ────────────────────────────────────────────────────
export const QUARTER_AR: Record<number, string> = {
  1: "ر1",
  2: "ر2",
  3: "ر3",
  4: "ر4",
};