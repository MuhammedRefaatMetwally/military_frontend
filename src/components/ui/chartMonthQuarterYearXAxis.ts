/**
 * ECharts: three stacked category x-axes for month drill — months, then 4 quarters
 * (each band aligns with 3 months), then a single year band centered on the full width.
 */
export type BuildMonthQuarterYearXAxesParams = {
  months: string[];
  year: string;
  quarterLabels?: readonly [string, string, string, string];
};

export function buildMonthQuarterYearXAxes(
  params: BuildMonthQuarterYearXAxesParams,
): Record<string, unknown>[] {
  const q =
    params.quarterLabels ??
    (["الربع 1", "الربع 2", "الربع 3", "الربع 4"] as const);
  return [
    {
      type: "category",
      position: "bottom",
      data: params.months,
      axisLabel: { interval: 0, fontSize: 10 },
      axisTick: { alignWithLabel: true },
    },
    {
      type: "category",
      position: "bottom",
      offset: 28,
      data: [...q],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { interval: 0, fontSize: 10, fontWeight: 500 },
    },
    {
      type: "category",
      position: "bottom",
      offset: 52,
      data: [params.year],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { interval: 0, fontSize: 10, fontWeight: 600 },
    },
  ];
}

const QUARTER_NAMES_VALUE_AXIS: readonly [string, string, string, string] = [
  "الربع الأول",
  "الربع الثاني",
  "الربع الثالث",
  "الربع الرابع",
];

/**
 * Value x-axis for month drill: same visual as stacked category axes, but fractional
 * markLine (11.5, 23.5) lands between bars — category markLine snaps 11.5 → month 12.
 */
export type BuildThreeYearMonthValueXAxesParams = {
  monthNames: string[];
  years: readonly [string, string, string];
  xMax: number;
  fullYear: boolean;
  sortedMonthIndices: number[];
  yearSeparatorPositions?: number[];
  yearSeparatorColor?: string;
  yearSeparatorWidth?: number;
};

export function buildThreeYearMonthValueXAxes(
  params: BuildThreeYearMonthValueXAxesParams,
): Record<string, unknown>[] {
  const {
    monthNames,
    years,
    xMax,
    fullYear,
    sortedMonthIndices,
    yearSeparatorPositions = [],
    yearSeparatorColor = "rgba(148, 163, 184, 0.55)",
    yearSeparatorWidth = 1,
  } = params;
  const xMin = -0.5;
  const xMaxBound = xMax + 0.5;

  const toIndex = (v: string | number): number | null => {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return null;
    const i = Math.round(n);
    if (Math.abs(n - i) > 1e-5) return null;
    if (i < 0 || i > xMax) return null;
    return i;
  };

  const tickValues = Array.from({ length: xMax + 1 }, (_, i) => i);

  /**
   * Value axis: labels are built from axisLabel.customValues (see echarts axisTickLabelBuilder).
   * customValues on axisTick alone does NOT drive labels — without this, makeRealNumberLabels
   * auto-thins to ~6 ticks (sparse months / missing quarter & year rows).
   */
  const labelShowAll = {
    customValues: tickValues,
    hideOverlap: false,
    showMinLabel: true,
    showMaxLabel: true,
  };

  const fmtMonth = (v: string | number) => {
    const i = toIndex(v);
    if (i === null) return "";
    if (fullYear) {
      return monthNames[i % 12] ?? "";
    }
    const mi = sortedMonthIndices[Math.floor(i / 3)];
    if (mi === undefined) return "";
    return monthNames[mi] ?? "";
  };

  /** Aligns with 12 quarter bands on 36 months (3 months per band); 12 labels total. */
  const fmtQuarter = (v: string | number) => {
    const i = toIndex(v);
    if (i === null) return "";
    if (fullYear) {
      const mod = i % 12;
      if (mod !== 1 && mod !== 4 && mod !== 7 && mod !== 10) return "";
      const mIdx = i % 12;
      return QUARTER_NAMES_VALUE_AXIS[Math.floor(mIdx / 3)] ?? "";
    }
    const mi = sortedMonthIndices[Math.floor(i / 3)];
    if (mi === undefined) return "";
    return QUARTER_NAMES_VALUE_AXIS[Math.floor(mi / 3)] ?? "";
  };

  /** One label per year band (centered like 3-wide category row). */
  const fmtYear = (v: string | number) => {
    const i = toIndex(v);
    if (i === null) return "";
    if (fullYear) {
      if (i % 12 !== 5) return "";
      return years[Math.floor(i / 12)] ?? "";
    }
    return years[i % 3] ?? "";
  };

  const baseAxis = {
    type: "value" as const,
    min: xMin,
    max: xMaxBound,
    position: "bottom" as const,
    boundaryGap: [0, 0] as [number, number],
    splitLine: { show: false },
    axisTick: {
      show: true,
      alignWithLabel: true,
      customValues: tickValues,
    },
  };

  return [
    {
      ...baseAxis,
      axisLabel: {
        ...labelShowAll,
        formatter: fmtMonth,
        fontSize: 9,
        rotate: 32,
        margin: 8,
      },
    },
    {
      ...baseAxis,
      offset: 32,
      axisLine: { show: false },
      axisTick: {
        show: true,
        alignWithLabel: true,
        customValues: tickValues,
        length: 0,
      },
      axisLabel: {
        ...labelShowAll,
        formatter: fmtQuarter,
        fontSize: 9,
        fontWeight: 500,
        margin: 2,
      },
    },
    {
      ...baseAxis,
      offset: 54,
      // Keep the year labels axis "line-less"; we'll render a divider *below*
      // the labels using a dedicated axis after it.
      axisLine: { show: false },
      axisTick: {
        show: true,
        alignWithLabel: true,
        customValues: tickValues,
        length: 0,
      },
      axisLabel: {
        ...labelShowAll,
        formatter: fmtYear,
        fontSize: 10,
        fontWeight: 600,
        margin: 2,
      },
    },
    // Extend the year separators from the plot area through the label bands.
    {
      ...baseAxis,
      axisLine: { show: false },
      axisTick: {
        show: yearSeparatorPositions.length > 0,
        alignWithLabel: true,
        customValues: yearSeparatorPositions,
        length: 74,
        lineStyle: {
          color: yearSeparatorColor,
          width: yearSeparatorWidth,
        },
      },
      axisLabel: { ...labelShowAll, formatter: () => "" },
    },
    // Divider line under the drill-year labels (no labels/ticks).
    {
      ...baseAxis,
      offset: 74,
      axisLine: { show: true, onZero: false },
      axisTick: { show: false },
      axisLabel: { ...labelShowAll, formatter: () => "" },
    },
  ];
}
