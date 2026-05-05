"use client";

import React, { useId, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export type MetricsBubblePoint = {
  key: string;
  label: string;
  depth: 0 | 1 | 2;
  xValue: number;
  yValue: number;
  hasChildren: boolean;
  open?: boolean;
  onClick?: () => void;
  vol: number;
  price: number;
  basket: number;
  atv: number;
  /** متوسط ربح السلة (وحدة تجريبية) — يُستخدم عند `bubbleSizing="basketProfit"` لتحديد حجم الدائرة */
  basketProfit?: number;
};

function fk(v: number) {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`;
}

function normalizeAxis(values: number[], pad: number) {
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  if (mx === mn) {
    return {
      min: mn,
      max: mx,
      toXPct: () => 50,
      toYPct: () => 50,
    };
  }
  const norm = (v: number) => (v - mn) / (mx - mn);
  return {
    min: mn,
    max: mx,
    toXPct: (v: number) => pad + norm(v) * (100 - 2 * pad),
    toYPct: (v: number) => pad + (1 - norm(v)) * (100 - 2 * pad),
  };
}

function depthColor(depth: 0 | 1 | 2, variant: "blue" | "green") {
  if (variant === "blue") {
    if (depth === 0) return "#2563eb";
    if (depth === 1) return "#3b82f6";
    return "#60a5fa";
  }
  if (depth === 0) return "#00e5a0";
  if (depth === 1) return "#34d399";
  return "#6ee7b7";
}

function baseSize(depth: 0 | 1 | 2) {
  if (depth === 0) return 18;
  if (depth === 1) return 14;
  return 10;
}

const AXIS_TICK_COUNT = 5;

function axisTickValues(min: number, max: number): number[] {
  if (min === max) return [min];
  return Array.from(
    { length: AXIS_TICK_COUNT },
    (_, i) => min + ((max - min) * i) / (AXIS_TICK_COUNT - 1),
  );
}

/** Tick text: K for large volumes, else compact decimal (matches bar-chart style labels). */
function formatYTick(v: number) {
  const a = Math.abs(v);
  if (a >= 1000) return fk(v);
  if (a >= 100) return Math.round(v).toLocaleString("en-US");
  return Number.isInteger(v) ? `${v}` : v.toFixed(1);
}

export type MetricsBubbleDetailLabels = {
  vol?: string;
  price?: string;
  basket?: string;
  atv?: string;
  basketProfit?: string;
};

export type MetricsBubblePlotProps = {
  points: MetricsBubblePoint[];
  xLabel: string;
  yLabel: string;
  /** Dot / accent palette */
  variant: "blue" | "green";
  plotHeight?: number;
  /** Override Arabic labels in the side detail panel (defaults: الحجم، م. السعر، السلة، ATV). */
  detailLabels?: MetricsBubbleDetailLabels;
  /** When false, hide the فرع / فئة / منتج legend row (e.g. flat cashier view). */
  showDepthLegend?: boolean;
  /** Subtitle under the selected name (default: فرع / فئة / منتج by depth). */
  entitySubtitle?: (depth: 0 | 1 | 2) => string;
  /** Format the «price» metric in the detail panel (default: one decimal). */
  formatPrice?: (n: number) => string;
  /**
   * `depth`: bubble size by hierarchy level (default).
   * `volume`: scale radius by `basket` (min–max across points).
   * `basketProfit`: scale radius by `basketProfit` (متوسط ربح السلة).
   */
  bubbleSizing?: "depth" | "volume" | "basketProfit";
  /** Min/max labels under the X axis (defaults to same compact rules as Y). */
  formatXTick?: (v: number) => string;
  /** Tighter padding below plot + x-axis rows (e.g. when legend rows are hidden). */
  compactBottom?: boolean;
};

const defaultEntitySubtitle = (depth: 0 | 1 | 2) =>
  depth === 0 ? "فرع" : depth === 1 ? "فئة" : "منتج";

export default function MetricsBubblePlot({
  points,
  xLabel,
  yLabel,
  variant,
  plotHeight = 400,
  detailLabels,
  showDepthLegend = true,
  entitySubtitle = defaultEntitySubtitle,
  formatPrice = (n: number) => n.toFixed(1),
  bubbleSizing = "depth",
  formatXTick,
  compactBottom = false,
}: MetricsBubblePlotProps) {
  const dl = {
    vol: detailLabels?.vol ?? "الحجم",
    price: detailLabels?.price ?? "م. السعر",
    basket: detailLabels?.basket ?? "السلة",
    atv: detailLabels?.atv ?? "ATV",
    basketProfit: detailLabels?.basketProfit ?? "متوسط ربح السلة",
  };
  const fmtX = formatXTick ?? formatYTick;
  const uid = useId().replace(/:/g, "");
  const gridId = `mbp-grid-${uid}`;
  const [selected, setSelected] = useState<MetricsBubblePoint | null>(null);

  const { positioned, xAxisMeta, yAxisMeta, yScale, xScale } = useMemo(() => {
    if (points.length === 0) {
      return {
        positioned: [] as (MetricsBubblePoint & {
          leftPct: number;
          topPct: number;
        })[],
        xAxisMeta: { min: 0, max: 0 },
        yAxisMeta: { min: 0, max: 0 },
        yScale: normalizeAxis([0, 0], 12),
        xScale: normalizeAxis([0, 0], 10),
      };
    }
    const xs = points.map((p) => p.xValue);
    const ys = points.map((p) => p.yValue);
    const xAxis = normalizeAxis(xs, 10);
    const yAxis = normalizeAxis(ys, 12);
    const xAxisMeta = { min: Math.min(...xs), max: Math.max(...xs) };
    const yAxisMeta = { min: Math.min(...ys), max: Math.max(...ys) };
    return {
      positioned: points.map((p) => ({
        ...p,
        leftPct: xAxis.toXPct(p.xValue),
        topPct: yAxis.toYPct(p.yValue),
      })),
      xAxisMeta,
      yAxisMeta,
      yScale: yAxis,
      xScale: xAxis,
    };
  }, [points]);

  const yTicks = useMemo(
    () => axisTickValues(yAxisMeta.min, yAxisMeta.max),
    [yAxisMeta.min, yAxisMeta.max],
  );
  const xTicks = useMemo(
    () => axisTickValues(xAxisMeta.min, xAxisMeta.max),
    [xAxisMeta.min, xAxisMeta.max],
  );

  const scaleRange = useMemo(() => {
    if (points.length === 0 || bubbleSizing === "depth")
      return { min: 0, max: 1 };
    const vals =
      bubbleSizing === "basketProfit"
        ? points.map((p) => p.basketProfit ?? 0)
        : points.map((p) => p.basket);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [points, bubbleSizing]);

  const bubbleRadius = (p: MetricsBubblePoint, isSel: boolean) => {
    const extra = isSel ? 4 : 0;
    if (bubbleSizing === "depth") {
      return baseSize(p.depth) + extra;
    }
    const v =
      bubbleSizing === "basketProfit" ? (p.basketProfit ?? 0) : p.basket;
    const { min, max } = scaleRange;
    const span = max - min;
    const t = span <= 0 ? 0.5 : (v - min) / span;
    const base = 12 + t * 22;
    return Math.max(10, base) + extra;
  };

  const handlePointClick = (p: MetricsBubblePoint) => {
    if (p.hasChildren && p.onClick) p.onClick();
    setSelected(p);
  };

  return (
    <div className="w-full h-full overflow-hidden">
      <div
        className="relative h-full xl:flex-row"
        style={{ minHeight: plotHeight }}
      >
        <div className="relative flex-1 overflow-hidden h-full pb-4" dir="ltr">
          {/* Y axis title — LTR row so axis stays on the physical left under page RTL */}
          <div
            className="flex items-center justify-center pointer-events-none z-5 absolute top-0 left-0 bottom-0"
            style={{ width: 22, height: "100%", color: "var(--text-muted)" }}
          >
            <span
              className="text-[9px] font-semibold whitespace-nowrap"
              style={{ transform: "rotate(-90deg)" }}
            >
              {yLabel}
            </span>
          </div>

          <div
            className="grid flex-1 min-w-0 min-h-0"
            style={{
              height: "100%",
              paddingTop: compactBottom ? 16 : 8,
              paddingBottom: compactBottom ? 0 : 10,
              paddingRight: 8,
              gridTemplateColumns: "auto 1fr",
              gridTemplateRows: "minmax(0, 1fr) auto auto",
            }}
          >
            {/* Y-axis tick column — row 1 only, same height as plot */}
            <div
              className="relative w-9 min-h-0"
              style={{ gridColumn: 1, gridRow: 1 }}
            >
              {yTicks.map((t) => {
                const yPct = yScale.toYPct(t);
                return (
                  <div
                    key={`yl-${t}`}
                    className="absolute text-[8px] font-medium tabular-nums pointer-events-none left-0 right-0 pr-0.5"
                    style={{
                      color: "var(--text-muted)",
                      top: `${yPct}%`,
                      transform: "translateY(-50%)",
                      textAlign: "right",
                      lineHeight: 1,
                    }}
                    dir="ltr"
                  >
                    {formatYTick(t)}
                  </div>
                );
              })}
            </div>

            {/* Plot area: grid, horizontal + vertical guides, bubbles */}
            <div
              className="relative min-h-0 min-w-0"
              style={{
                gridColumn: 2,
                gridRow: 1,
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.03) 0%, transparent 70%)",
              }}
            >
              <svg
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  opacity: 0.07,
                  zIndex: 0,
                }}
              >
                <defs>
                  <pattern
                    id={gridId}
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${gridId})`} />
              </svg>

              <svg
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                  pointerEvents: "none",
                }}
                preserveAspectRatio="none"
              >
                {yTicks.map((t) => {
                  const yPct = yScale.toYPct(t);
                  return (
                    <line
                      key={`y-${t}`}
                      x1="0%"
                      y1={`${yPct}%`}
                      x2="100%"
                      y2={`${yPct}%`}
                      stroke="var(--border-subtle)"
                      strokeWidth={1}
                      strokeOpacity={0.95}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
                {xTicks.map((t) => {
                  const xPct = xScale.toXPct(t);
                  return (
                    <line
                      key={`x-${t}`}
                      x1={`${xPct}%`}
                      y1="0%"
                      x2={`${xPct}%`}
                      y2="100%"
                      stroke="var(--border-subtle)"
                      strokeWidth={1}
                      strokeOpacity={0.95}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
                {/* Y-axis spine (left) + X-axis spine (bottom) — main axes for the plot */}
                <line
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                  stroke="var(--text-muted)"
                  strokeWidth={1.25}
                  strokeOpacity={0.55}
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1="0%"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="var(--text-muted)"
                  strokeWidth={1.25}
                  strokeOpacity={0.55}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <svg
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  opacity: 0.05,
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              >
                {[50, 100, 150].map((r) => (
                  <circle
                    key={r}
                    cx="50%"
                    cy="50%"
                    r={r}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}
              </svg>

              {positioned.map((p) => {
                const isSel = selected?.key === p.key;
                const color = depthColor(p.depth, variant);
                const sz = bubbleRadius(p, isSel);

                return (
                  <div
                    key={p.key}
                    style={{
                      position: "absolute",
                      left: `${p.leftPct}%`,
                      top: `${p.topPct}%`,
                      transform: "translate(-50%, -50%)",
                      cursor: p.hasChildren ? "pointer" : "pointer",
                      zIndex: isSel ? 30 : 15,
                    }}
                    onClick={() => handlePointClick(p)}
                  >
                    {isSel && (
                      <motion.div
                        animate={{
                          scale: [1, 1.8, 1],
                          opacity: [0.45, 0, 0.45],
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{
                          position: "absolute",
                          width: sz,
                          height: sz,
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%,-50%)",
                          borderRadius: "50%",
                          background: color,
                        }}
                      />
                    )}

                    <motion.div
                      animate={{ width: sz, height: sz }}
                      transition={{ type: "spring", stiffness: 300 }}
                      style={{
                        width: sz,
                        height: sz,
                        borderRadius: "50%",
                        background: color,
                        border: isSel
                          ? "3px solid white"
                          : p.open
                            ? `2px dashed rgba(255,255,255,0.85)`
                            : `2px solid ${color}`,
                        boxShadow: `0 0 ${isSel ? 14 : 6}px ${color}55`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {isSel && (
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "white",
                          }}
                        />
                      )}
                    </motion.div>

                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        marginTop: 4,
                        maxWidth: 120,
                        textAlign: "center",
                        fontSize: 8,
                        fontWeight: 600,
                        color: isSel ? color : "var(--text-muted)",
                        background: "var(--bg-surface)",
                        padding: "1px 4px",
                        borderRadius: 3,
                        border: isSel ? `1px solid ${color}44` : "none",
                        lineHeight: 1.2,
                      }}
                    >
                      {p.label.length > 26
                        ? `${p.label.slice(0, 24)}…`
                        : p.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis tick row — column 2, under plot */}
            <div
              className={`relative shrink-0 w-full min-w-0 ${compactBottom ? "h-3.5" : "h-5.5"}`}
              style={{ gridColumn: 2, gridRow: 2 }}
              dir="ltr"
            >
              {xTicks.map((t) => {
                const xPct = xScale.toXPct(t);
                return (
                  <div
                    key={`xl-${t}`}
                    className="absolute text-[8px] font-medium tabular-nums pointer-events-none top-0.5"
                    style={{
                      color: "var(--text-muted)",
                      left: `${xPct}%`,
                      transform: "translateX(-50%)",
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtX(t)}
                  </div>
                );
              })}
            </div>

            {/* X axis title (under tick marks) */}
            <div
              className={`relative flex justify-center items-center px-1 ${compactBottom ? "text-[9px] leading-none py-0" : "text-[9px] py-0.5"}`}
              style={{ gridColumn: 2, gridRow: 3, color: "var(--text-muted)" }}
              dir="ltr"
            >
              <span className="font-semibold">{xLabel}</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 24, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 232 }}
              exit={{ opacity: 0, x: 24, width: 0 }}
              className="shrink-0 border-t xl:border-t-0 xl:border-s overflow-hidden"
              style={{
                borderColor: "var(--border-subtle)",
                background: "var(--bg-surface)",
              }}
            >
              <div
                style={{ width: 232, minHeight: 200 }}
                className="flex flex-col"
              >
                <div
                  className="flex items-start justify-between gap-2 px-3 py-2.5 border-b"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-xs font-bold leading-tight"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {selected.label}
                    </p>
                    <p
                      className="text-[9px] mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {entitySubtitle(selected.depth)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="shrink-0 p-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="px-3 py-2 space-y-2 text-[11px]">
                  <div className="flex justify-between gap-2">
                    <span style={{ color: "var(--text-muted)" }}>{dl.vol}</span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                      dir="ltr"
                    >
                      {fk(selected.vol)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span style={{ color: "var(--text-muted)" }}>
                      {dl.price}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--accent-blue)" }}
                      dir="ltr"
                    >
                      {formatPrice(selected.price)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span style={{ color: "var(--text-muted)" }}>
                      {dl.basket}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                      dir="ltr"
                    >
                      {Number.isInteger(selected.basket)
                        ? selected.basket.toLocaleString("en-US")
                        : selected.basket.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span style={{ color: "var(--text-muted)" }}>{dl.atv}</span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--accent-green)" }}
                      dir="ltr"
                    >
                      {selected.atv.toFixed(1)}
                    </span>
                  </div>
                  {selected.basketProfit != null && (
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--text-muted)" }}>
                        {dl.basketProfit}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--accent-amber)" }}
                        dir="ltr"
                      >
                        {selected.basketProfit.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                {selected.hasChildren && (
                  <p
                    className="px-3 pb-2 text-[9px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    انقر على الدائرة لتوسيع أو طي المستوى
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(showDepthLegend ||
        bubbleSizing === "volume" ||
        bubbleSizing === "basketProfit") && (
        <div
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 border-t text-[9px]"
          style={{
            borderColor: "var(--border-subtle)",
            color: "var(--text-muted)",
          }}
        >
          {showDepthLegend ? (
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                المستوى:
              </span>
              {(
                [
                  { label: "فرع", d: 0 as const },
                  { label: "فئة", d: 1 as const },
                  { label: "منتج", d: 2 as const },
                ] as const
              ).map(({ label, d }) => {
                const dot = bubbleSizing === "depth" ? 8 + d * 2 : 10;
                return (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      style={{
                        width: dot,
                        height: dot,
                        borderRadius: "50%",
                        background: depthColor(d, variant),
                      }}
                    />
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div />
          )}

          {(bubbleSizing === "volume" || bubbleSizing === "basketProfit") && (
            <div className="flex flex-wrap items-center gap-2" dir="rtl">
              <span
                className="font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                دليل الحجم:
              </span>
              {bubbleSizing === "volume" ? (
                <>
                  <span>الدائرة الأكبر = أكبر عدد للمواد الملغات</span>
                  <span className="opacity-70">(عدد المواد الملغات)</span>
                </>
              ) : (
                <>
                  <span>حجم الدائرة يتناسب مع متوسط ربح السلة</span>
                  <span className="opacity-70">
                    (أكبر دائرة = أعلى ربح سلة)
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
