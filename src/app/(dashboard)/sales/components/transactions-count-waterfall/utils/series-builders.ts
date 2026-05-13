import type { WaterfallYearEntry, WaterfallPeriod } from "@/api/sales-analyses/types";
import { QUARTER_AR } from "./constants";
import { fmtShort } from "./formatters";
import type { BarDataItem, MarketEntry, SeriesData } from "../types";

// ─── Palette subset used by builders ─────────────────────────────────────────
type Palette = { primaryBlue: string; primaryGreen: string; primaryRed: string };

// ─── Shared helpers ───────────────────────────────────────────────────────────

function makeTotalBar(value: number, palette: Palette): BarDataItem {
  return {
    value,
    itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] },
    label: {
      show: true,
      position: "top",
      formatter: fmtShort(value),
      color: palette.primaryBlue,
      fontSize: 10,
      fontWeight: 600,
    },
  };
}

function makeIncBar(value: number, palette: Palette): BarDataItem {
  return { value, itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] } };
}

function makeDecBar(value: number, palette: Palette): BarDataItem {
  return { value: Math.abs(value), itemStyle: { color: palette.primaryRed, borderRadius: [4, 4, 0, 0] } };
}

// ─── Year series ──────────────────────────────────────────────────────────────

function buildSingleYearSeries(entry: WaterfallYearEntry, palette: Palette): SeriesData {
  const xLabels: string[] = [];
  const helperData: (number | null)[] = [];
  const incData: (BarDataItem | null)[] = [];
  const decData: (BarDataItem | null)[] = [];
  const totalData: (BarDataItem | null)[] = [];

  // First column: total
  xLabels.push(`إجمالي ${entry.year}`);
  helperData.push(null);
  incData.push(null);
  decData.push(null);
  totalData.push(makeTotalBar(entry.total, palette));

  // Market breakdown columns sorted by absolute value
  const markets = ((entry.markets as MarketEntry[] | undefined) ?? [])
    .slice()
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  let running = entry.total;
  for (const m of markets) {
    const isIncrease = m.value > 0;
    xLabels.push(m.name);
    helperData.push(isIncrease ? running : running + m.value);
    incData.push(isIncrease ? makeIncBar(m.value, palette) : null);
    decData.push(!isIncrease ? makeDecBar(m.value, palette) : null);
    totalData.push(null);
    running += m.value;
  }

  return { xLabels, helperData, incData, decData, totalData, connectorPoints: [] };
}

function buildMultiYearSeries(entries: WaterfallYearEntry[], palette: Palette): SeriesData {
  const xLabels: string[] = [];
  const helperData: (number | null)[] = [];
  const incData: (BarDataItem | null)[] = [];
  const decData: (BarDataItem | null)[] = [];
  const totalData: (BarDataItem | null)[] = [];
  const connectorPoints: { index: number; value: number }[] = [];

  for (let entryIdx = 0; entryIdx < entries.length; entryIdx++) {
    const entry = entries[entryIdx]!;
    const markets = ((entry.markets as MarketEntry[] | undefined) ?? [])
      .slice()
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

    // First entry: only a total column
    if (entryIdx === 0) {
      xLabels.push(`إجمالي ${entry.year}`);
      helperData.push(null);
      incData.push(null);
      decData.push(null);
      totalData.push(makeTotalBar(entry.total, palette));
      connectorPoints.push({ index: 0, value: entry.total });
      continue;
    }

    const prevTotal = entries[entryIdx - 1]!.total;
    let running = prevTotal;

    if (markets.length === 0) {
      // No breakdown — single delta bar
      const delta = entry.total - prevTotal;
      const isIncrease = delta >= 0;
      xLabels.push(String(entry.year));
      helperData.push(isIncrease ? running : running + delta);
      incData.push(isIncrease ? makeIncBar(delta, palette) : null);
      decData.push(!isIncrease ? makeDecBar(delta, palette) : null);
      totalData.push(null);
    } else {
      // Market breakdown
      for (const m of markets) {
        const isIncrease = m.value >= 0;
        xLabels.push(m.name);
        helperData.push(isIncrease ? running : running + m.value);
        incData.push(isIncrease ? makeIncBar(m.value, palette) : null);
        decData.push(!isIncrease ? makeDecBar(m.value, palette) : null);
        totalData.push(null);
        connectorPoints.push({
          index: xLabels.length - 1,
          value: running + (isIncrease ? m.value : 0),
        });
        running += m.value;
      }
    }

    // Close each year with a total column
    xLabels.push(`إجمالي ${entry.year}`);
    helperData.push(null);
    incData.push(null);
    decData.push(null);
    totalData.push(makeTotalBar(entry.total, palette));
    connectorPoints.push({ index: xLabels.length - 1, value: entry.total });
  }

  return { xLabels, helperData, incData, decData, totalData, connectorPoints };
}

export function buildYearSeries(entries: WaterfallYearEntry[], palette: Palette): SeriesData {
  return entries.length === 1
    ? buildSingleYearSeries(entries[0]!, palette)
    : buildMultiYearSeries(entries, palette);
}

// ─── Quarter series ───────────────────────────────────────────────────────────

export function buildQuarterSeries(periods: WaterfallPeriod[], palette: Palette): SeriesData {
  if (periods.length === 0) {
    return { xLabels: [], helperData: [], incData: [], decData: [], totalData: [], connectorPoints: [] };
  }

  const xLabels: string[] = [];
  const helperData: (number | null)[] = [];
  const incData: (BarDataItem | null)[] = [];
  const decData: (BarDataItem | null)[] = [];
  const totalData: (BarDataItem | null)[] = [];
  const connectorPoints: { index: number; value: number }[] = [];

  for (let i = 0; i < periods.length; i++) {
    const p = periods[i]!;
    const qLabel = `${p.year} ${QUARTER_AR[p.quarter] ?? `Q${p.quarter}`}`;

    // First period with no previous — render as total
    if (p.previous_transaction_count === null) {
      xLabels.push(qLabel);
      helperData.push(null);
      incData.push(null);
      decData.push(null);
      totalData.push(makeTotalBar(p.transaction_count, palette));
      connectorPoints.push({ index: 0, value: p.transaction_count });
      continue;
    }

    const delta = p.delta ?? 0;
    const isIncrease = p.change_type === "increase";
    const bridgeLow = p.bridge_low ?? Math.min(p.previous_transaction_count, p.transaction_count);

    xLabels.push(qLabel);
    helperData.push(bridgeLow);
    incData.push(isIncrease ? { value: Math.abs(delta), itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] } } : null);
    decData.push(!isIncrease ? { value: Math.abs(delta), itemStyle: { color: palette.primaryRed, borderRadius: [4, 4, 0, 0] } } : null);
    totalData.push(null);
    connectorPoints.push({ index: xLabels.length - 1, value: p.transaction_count });

    // Final period gets a closing total column
    if (i === periods.length - 1) {
      xLabels.push("إجمالي");
      helperData.push(null);
      incData.push(null);
      decData.push(null);
      totalData.push(makeTotalBar(p.transaction_count, palette));
      connectorPoints.push({ index: xLabels.length - 1, value: p.transaction_count });
    }
  }

  return { xLabels, helperData, incData, decData, totalData, connectorPoints };
}