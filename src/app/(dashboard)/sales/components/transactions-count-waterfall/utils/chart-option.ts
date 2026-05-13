import { BAR_WIDTH } from "./constants";
import { fmt, fmtShort } from "./formatters";
import type { BarDataItem, MarkLineItem } from "../types";

type Palette = { primaryBlue: string; primaryGreen: string; primaryRed: string };

// ─── Tooltip formatter ────────────────────────────────────────────────────────

function tooltipFormatter(
  params: Array<{ seriesName: string; data: number | BarDataItem | null; axisValueLabel?: string }>,
  palette: Palette,
): string {
  const label = params[0]?.axisValueLabel ?? "";

  const totalVal = (() => {
    const p = params.find((p) => p.seriesName === "إجمالي");
    if (!p) return null;
    if (p.data && typeof p.data === "object") return (p.data as BarDataItem).value;
    if (typeof p.data === "number") return p.data;
    return null;
  })();

  if (typeof totalVal === "number") {
    return `
    <div style="text-align:right;direction:rtl">
      <div style="font-size:12px;color:#9ca3af;margin-bottom:4px">${label}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:2px">إجمالي المعاملات</div>
      <div style="font-size:15px;font-weight:700;color:${palette.primaryBlue}">${fmt(totalVal)}</div>
    </div>`;;;
  }

  const incVal = (() => {
    const p = params.find((p) => p.seriesName === "ارتفاع");
    return p?.data && typeof p.data === "object" ? ((p.data as BarDataItem).value ?? 0) : 0;
  })();
  const decVal = (() => {
    const p = params.find((p) => p.seriesName === "انخفاض");
    return p?.data && typeof p.data === "object" ? ((p.data as BarDataItem).value ?? 0) : 0;
  })();

  const delta = (Number(incVal) || 0) - (Number(decVal) || 0);
  const color = delta >= 0 ? palette.primaryGreen : palette.primaryRed;
  const sign = delta >= 0 ? "+" : "–";

  return`
  <div style="text-align:right;direction:rtl">
    <div style="font-size:12px;color:#9ca3af;margin-bottom:4px">${label}</div>
    <div style="font-size:12px;color:#6b7280;margin-bottom:2px">التغيير في المعاملات</div>
    <div style="font-size:15px;font-weight:700;color:${color}">${sign}${fmt(Math.abs(delta))}</div>
  </div>`;
}

// ─── Background series (hover highlight) ─────────────────────────────────────

function buildBgSeries(
  xLabels: string[],
  helperData: (number | null)[],
  incData: (BarDataItem | null)[],
  decData: (BarDataItem | null)[],
  totalData: (BarDataItem | null)[],
) {
  return {
    name: "bg",
    type: "bar",
    data: xLabels.map((_, i) => {
      const total = totalData[i];
      const isTotal = total && typeof total === "object" && total.value !== null;
      const isInc = incData[i] && typeof incData[i] === "object" && (incData[i] as BarDataItem).value !== null;
      const isDec = decData[i] && typeof decData[i] === "object" && (decData[i] as BarDataItem).value !== null;

      const hoverColor = isInc
        ? "rgba(22, 163, 74, 0.12)"
        : isDec
          ? "rgba(239, 68, 68, 0.12)"
          : "rgba(37, 99, 235, 0.12)";

      const topValue = (() => {
        if (isTotal) return (total as BarDataItem).value;
        const h = helperData[i];
        if (h === null) return 0;
        const incV = incData[i] && typeof incData[i] === "object" ? ((incData[i] as BarDataItem).value ?? 0) : 0;
        const decV = decData[i] && typeof decData[i] === "object" ? ((decData[i] as BarDataItem).value ?? 0) : 0;
        return (h as number) + incV + decV;
      })();

      return {
        value: topValue,
        itemStyle: { color: "transparent" },
        emphasis: { itemStyle: { color: hoverColor } },
      };
    }),
    itemStyle: { color: "transparent" },
    emphasis: { itemStyle: { color: "transparent" } },
    barWidth: BAR_WIDTH,
    barGap: "-100%",
    z: 1,
    silent: false,
    padding: [10, 12],
    tooltip: { show: true },
  };
}

// ─── Main option builder ──────────────────────────────────────────────────────

interface BuildOptionParams {
  xLabels: string[];
  helperData: (number | null)[];
  incData: (BarDataItem | null)[];
  decData: (BarDataItem | null)[];
  totalData: (BarDataItem | null)[];
  maxValue: number | undefined;
  connectorMarkLines: Array<[MarkLineItem, MarkLineItem]>;
  palette: Palette;
  isSinglePeriod: boolean;
}

export function buildChartOption({
  xLabels,
  helperData,
  incData,
  decData,
  totalData,
  maxValue,
  connectorMarkLines,
  palette,
  isSinglePeriod,
}: BuildOptionParams) {
  const hasData = xLabels.length > 0;

  return {
    // ── Tooltip ───────────────────────────────────────────────────────────────
    tooltip: {
      show: true,
      trigger: "axis" as const,
      axisPointer: { type: "none" },
      backgroundColor: "#ffffff",
      borderColor: "#f0f0f0",
      borderWidth: 1,
      borderRadius: 12,
      padding: [16, 20],
      textStyle: { color: "#1f2937", fontSize: 12, fontFamily: "inherit" },
      formatter: (params: Array<{ seriesName: string; data: number | BarDataItem | null; axisValueLabel?: string }>) =>
        tooltipFormatter(params, palette),
    },

    // ── Legend ────────────────────────────────────────────────────────────────
    legend: {
      data: ["ارتفاع", "انخفاض", "إجمالي"],
      bottom: 8,
      left: "center",
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 24,
      textStyle: { color: "#6b7280", fontSize: 11 },
    },

    // ── Grid ──────────────────────────────────────────────────────────────────
    grid: { top: 50, bottom: 90, left: 90, right: 50, containLabel: false },

    // ── Axes ──────────────────────────────────────────────────────────────────
    xAxis: {
      type: "category" as const,
      data: xLabels,
      axisLabel: {
        fontSize: 10,
        color: "#6b7280",
        interval: 0,
        rotate: 45,
        overflow: "truncate" as const,
        width: 90,
        margin: 14,
      },
      axisLine: { lineStyle: { color: "#e5e7eb" } },
      axisTick: { show: false },
    },

    yAxis: {
      type: "value" as const,
      max: maxValue,
      name: "المعاملات",
      nameLocation: "middle" as const,
      nameGap: 60,
      nameTextStyle: { color: "#6b7280", fontSize: 11, fontWeight: 500 },
      axisLabel: {
        fontSize: 10,
        color: "#6b7280",
        formatter: (val: number) => fmtShort(val),
      },
      splitLine: { lineStyle: { color: "#f3f4f6", type: "dashed" as const } },
      axisLine: { show: false },
      axisTick: { show: false },
    },

    // ── Series ────────────────────────────────────────────────────────────────
    series: hasData
      ? [
          // 1. Hover background (transparent → colored on hover)
          buildBgSeries(xLabels, helperData, incData, decData, totalData),

          // 2. Invisible spacer for stacked waterfall positioning
          {
            name: "helper",
            type: "bar",
            stack: "waterfall",
            data: helperData,
            itemStyle: { color: "transparent", borderColor: "transparent" },
            emphasis: { disabled: true },
            silent: true,
            tooltip: { show: false },
            barWidth: BAR_WIDTH,
            barGap: "-100%",
          },

          // 3. Increase bars (green)
          {
            name: "ارتفاع",
            type: "bar",
            stack: "waterfall",
            data: incData,
            itemStyle: { color: palette.primaryGreen, borderRadius: [3, 3, 0, 0] },
            emphasis: { itemStyle: { color: "rgba(22, 163, 74, 0.60)", borderRadius: [3, 3, 0, 0] } },
            barWidth: BAR_WIDTH,
            barGap: "-100%",
            z: 8,
          },

          // 4. Decrease bars (red)
          {
            name: "انخفاض",
            type: "bar",
            stack: "waterfall",
            data: decData,
            itemStyle: { color: palette.primaryRed, borderRadius: [3, 3, 0, 0] },
            emphasis: { itemStyle: { color: "rgba(239, 68, 68, 0.50)", borderRadius: [3, 3, 0, 0] } },
            barWidth: BAR_WIDTH,
            barGap: "-100%",
            z: 8,
          },

          // 5. Total bars (blue) with top labels
          {
            name: "إجمالي",
            type: "bar",
            data: totalData,
            itemStyle: { color: palette.primaryBlue, borderRadius: [3, 3, 0, 0] },
            emphasis: { itemStyle: { opacity: 0.85 } },
            barWidth: BAR_WIDTH,
            barGap: "-100%",
            z: 10,
            label: {
              show: true,
              position: "top" as const,
              color: palette.primaryBlue,
              fontSize: 11,
              fontWeight: 600,
              formatter: (params: { value: BarDataItem | null }) => {
                const v = params.value;
                return v && typeof v === "object" && v.value !== null ? fmtShort(v.value) : "";
              },
            },
          },

          // 6. L-shaped connector lines between bars
          {
            name: "connectors",
            type: "line",
            data: [],
            symbol: "none",
            silent: true,
            tooltip: { show: false },
            z: 3,
            markLine: {
              symbol: "none",
              silent: true,
              animation: false,
              label: { show: false },
              lineStyle: { color: "#C9CED6", width: 1, type: "solid" as const },
              data: connectorMarkLines,
            },
          },
        ]
      : [],
  };
}