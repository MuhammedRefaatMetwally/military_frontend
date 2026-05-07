/**
 * Utility functions for building chart data and mark lines
 */

import { LevelType, QuarterType } from "./date-based-sales.constants";


export interface ParsedItem {
  label: string;
  year: number;
  quarter: QuarterType;
  month?: number;
  index: number;
}

export interface GroupedChartData {
  items: ParsedItem[];
  flatLabels: string[];
  flatSales: number[];
  flatProfits: number[];
  totalItems: number;
}

/**
 * Transform raw chart data into grouped format for rendering
 */
export function buildChartData(
  chartData: any[],
  level: LevelType,
): GroupedChartData {
  if (chartData.length === 0)
    return {
      items: [],
      flatLabels: [],
      flatSales: [],
      flatProfits: [],
      totalItems: 0,
    };

  if (level === "year") {
    const sorted = [...chartData].sort((a, b) => a.year - b.year);
    const items: ParsedItem[] = sorted.map((d, i) => ({
      label: String(d.year),
      year: d.year,
      quarter: 1 as QuarterType,
      index: i,
    }));
    return {
      items,
      flatLabels: items.map((x) => x.label),
      flatSales: sorted.map((d) => d.sales),
      flatProfits: sorted.map((d) => d.profit),
      totalItems: sorted.length,
    };
  }

  if (level === "quarter") {
    const sorted = [...chartData].sort((a, b) =>
      a.year !== b.year ? a.year - b.year : (a.quarter ?? 0) - (b.quarter ?? 0),
    );
    const items: ParsedItem[] = sorted.map((d, i) => ({
      label: `Q${d.quarter}`,
      year: d.year,
      quarter: (d.quarter ?? 1) as QuarterType,
      index: i,
    }));
    return {
      items,
      flatLabels: items.map((x) => x.label),
      flatSales: sorted.map((d) => d.sales),
      flatProfits: sorted.map((d) => d.profit),
      totalItems: sorted.length,
    };
  }

  // month level
  const sorted = [...chartData].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : (a.month ?? 0) - (b.month ?? 0),
  );
  const items: ParsedItem[] = sorted.map((d, i) => ({
    label: `شهر ${d.month ?? i + 1}`,
    year: d.year,
    quarter: Math.ceil((d.month ?? 1) / 3) as QuarterType,
    month: d.month,
    index: i,
  }));
  return {
    items,
    flatLabels: items.map((x) => x.label),
    flatSales: sorted.map((d) => d.sales),
    flatProfits: sorted.map((d) => d.profit),
    totalItems: sorted.length,
  };
}

/**
 * Build vertical separator mark lines between groups
 */
export function buildMarkLines(
  items: ParsedItem[],
  level: LevelType,
): object[] {
  if (level === "year" || items.length === 0) return [];

  const result: object[] = [];
  for (let i = 1; i < items.length; i++) {
    if (items[i].year !== items[i - 1].year) {
      result.push({
        xAxis: i - 0.5,
        lineStyle: { color: "#94a3b8", width: 1.5, type: "solid" },
        label: { show: false },
      });
    } else if (level === "month" && items[i].quarter !== items[i - 1].quarter) {
      result.push({
        xAxis: i - 0.5,
        lineStyle: { color: "#cbd5e1", width: 1, type: "dashed" },
        label: { show: false },
      });
    }
  }
  return result;
}
