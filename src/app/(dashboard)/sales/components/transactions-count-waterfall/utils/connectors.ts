import type { BarDataItem, MarkLineItem } from "../types";

/** Returns the y-value at the top of the bar at index i */
function getBarTop(
  i: number,
  helperData: (number | null)[],
  incData: (BarDataItem | null)[],
  decData: (BarDataItem | null)[],
  totalData: (BarDataItem | null)[],
): number | null {
  const total = totalData[i];
  if (total && typeof total === "object" && total.value !== null) return total.value;

  const helper = helperData[i];
  if (helper === null) return null;

  const incVal = incData[i] && typeof incData[i] === "object" && incData[i]!.value !== null ? incData[i]!.value! : 0;
  const decVal = decData[i] && typeof decData[i] === "object" && decData[i]!.value !== null ? decData[i]!.value! : 0;
  return helper + incVal + decVal;
}

/**
 * Builds L-shaped connector lines between adjacent waterfall bars.
 * Each connector is 3 segments: horizontal → vertical → horizontal.
 */
export function buildConnectorMarkLines(
  xLabels: string[],
  helperData: (number | null)[],
  incData: (BarDataItem | null)[],
  decData: (BarDataItem | null)[],
  totalData: (BarDataItem | null)[],
): Array<[MarkLineItem, MarkLineItem]> {
  const lines: Array<[MarkLineItem, MarkLineItem]> = [];

  for (let i = 0; i < xLabels.length - 1; i++) {
    const currTop = getBarTop(i, helperData, incData, decData, totalData);
    const nextTop = getBarTop(i + 1, helperData, incData, decData, totalData);

    if (currTop === null || nextTop === null) continue;

    // Skip total → total transitions (no connector needed)
    const currIsTotal = totalData[i] && typeof totalData[i] === "object" && (totalData[i] as BarDataItem).value !== null;
    const nextIsTotal = totalData[i + 1] && typeof totalData[i + 1] === "object" && (totalData[i + 1] as BarDataItem).value !== null;
    if (currIsTotal && nextIsTotal) continue;

    const mid = i + 0.5; // midpoint between two category indices

    // Segment 1: horizontal at currTop level
    lines.push([{ xAxis: i, yAxis: currTop }, { xAxis: mid as unknown as number, yAxis: currTop }]);
    // Segment 2: vertical bridge between levels
    lines.push([{ xAxis: mid as unknown as number, yAxis: currTop }, { xAxis: mid as unknown as number, yAxis: nextTop }]);
    // Segment 3: horizontal at nextTop level
    lines.push([{ xAxis: mid as unknown as number, yAxis: nextTop }, { xAxis: i + 1, yAxis: nextTop }]);
  }

  return lines;
}