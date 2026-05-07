/**
 * Constants for Sales Hierarchy Analysis component
 */

export type AtLevel = "branch" | "group1" | "group2" | "group3" | "product";

export const AT_LEVELS: AtLevel[] = [
  "branch",
  "group1",
  "group2",
  "group3",
  "product",
];

export const HIERARCHY_TITLES: Record<AtLevel, string> = {
  branch: "الفرع",
  group1: "المجموعة الأولى",
  group2: "المجموعة الثانية",
  group3: "المجموعة الثالثة",
  product: "المنتج",
};

/**
 * Extract secondary metric (profit) from a tree node
 */
export function secondarySalesMetric(node: { profit?: number }): number {
  return node.profit ?? 0;
}

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
