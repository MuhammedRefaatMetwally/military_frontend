"use client";

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  memo,
} from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { createPortal } from "react-dom";
import {
  ChartTitleFlagBadge,
  type ChartCardTitleFlag,
} from "../ChartTitleFlagBadge";
import FullScreenChart from "./FullScreenChart";

export type { ChartCardTitleFlag };

interface ChartCardProps {
  title: string;
  subtitle?: string;
  titleLeading?: React.ReactNode;
  titleFlag?: ChartCardTitleFlag;
  titleFlagNumber?: number;
  headerExtra?: React.ReactNode;
  className?: string;
  /** Allow scrolling inside the plot area only. */
  plotOverflowY?: "hidden" | "auto" | "visible";
  /** Override the inner ECharts canvas height (enables plot scrolling). */
  innerChartHeight?: string;
  option: Record<string, unknown>;
  height?: string;
  /** Optional inner chart width for horizontal scrolling without stretching the card. */
  width?: string;
  /** Controls the horizontal scroll container direction when the chart is wider than the card. */
  scrollViewportDir?: "ltr" | "rtl";
  delay?: number;
  aiPowered?: boolean;
}

function buildMergedTooltip({
  baseTheme,
  option,
  isDark,
}: {
  baseTheme: Record<string, unknown>;
  option: Record<string, unknown>;
  isDark: boolean;
}): Record<string, unknown> {
  const chartTooltip = (option.tooltip || {}) as Record<string, unknown>;
  const lightTooltipExtra =
    "z-index: 100002; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border-radius: 8px;";

  const optExtra =
    typeof chartTooltip.extraCssText === "string"
      ? chartTooltip.extraCssText.trim()
      : "";

  if (isDark) {
    const baseTooltip = (baseTheme.tooltip || {}) as Record<string, unknown>;
    const baseExtra =
      typeof baseTooltip.extraCssText === "string"
        ? baseTooltip.extraCssText
        : "";
    const extra = optExtra
      ? baseExtra
        ? `${baseExtra}; ${optExtra}`
        : optExtra
      : baseExtra;
    return {
      ...baseTooltip,
      ...chartTooltip,
      ...(extra ? { extraCssText: extra } : {}),
    };
  }

  return {
    ...chartTooltip,
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    textStyle: { color: "#0f172a", fontSize: 12 },
    extraCssText: optExtra
      ? `${optExtra}; ${lightTooltipExtra}`
      : lightTooltipExtra,
  };
}

function ensureAnimationDefault(
  merged: Record<string, unknown>,
): Record<string, unknown> {
  if (merged.animation !== undefined) return merged;
  return { ...merged, animation: false };
}

type EChartsAxis =
  | Record<string, unknown>
  | Array<Record<string, unknown>>
  | undefined;

function mapAxis<A extends EChartsAxis>(
  axis: A,
  mapOne: (ax: Record<string, unknown>) => Record<string, unknown>,
): A {
  if (!axis) return axis;
  if (Array.isArray(axis)) return axis.map(mapOne) as A;
  return mapOne(axis) as A;
}

function normalizeAxisSplitLine(
  merged: Record<string, unknown>,
): Record<string, unknown> {
  const killSplit = (ax: Record<string, unknown>) => {
    const sl = ax.splitLine as { show?: boolean } | undefined;
    if (sl?.show === true) return ax;
    return { ...ax, splitLine: { show: false } };
  };

  const nextXAxis = mapAxis(merged.xAxis as EChartsAxis, killSplit);
  const nextYAxis = mapAxis(merged.yAxis as EChartsAxis, killSplit);
  return { ...merged, xAxis: nextXAxis, yAxis: nextYAxis };
}

function applyLightAxisStyle(
  merged: Record<string, unknown>,
): Record<string, unknown> {
  const lightAxisStyle = {
    axisLine: { lineStyle: { color: "#e2e8f0" } },
    axisTick: { show: false },
    splitLine: { show: false },
  };
  const applyLightAxis = (ax: Record<string, unknown>) => {
    const existingAxisLabel = (ax.axisLabel || {}) as Record<string, unknown>;
    const existingAxisLine = (ax.axisLine || {}) as Record<string, unknown>;
    const existingLineStyle = (existingAxisLine.lineStyle || {}) as Record<
      string,
      unknown
    >;
    const hasFontSize = existingAxisLabel.fontSize != null;
    const axisLineShow = existingAxisLine.show === false ? false : true;
    return {
      ...lightAxisStyle,
      ...ax,
      axisLine: {
        ...existingAxisLine,
        show: axisLineShow,
        lineStyle: { color: "#e2e8f0", ...existingLineStyle },
      },
      axisLabel: {
        ...existingAxisLabel,
        color: "#64748b",
        ...(hasFontSize ? {} : { fontSize: 11 }),
      },
    };
  };
  const applyLightYAxis = (ax: Record<string, unknown>) => {
    const base = applyLightAxis(ax);
    return {
      ...base,
      splitLine: { show: false },
    };
  };

  const nextXAxis = mapAxis(merged.xAxis as EChartsAxis, applyLightAxis);
  const nextYAxis = mapAxis(merged.yAxis as EChartsAxis, applyLightYAxis);
  return { ...merged, xAxis: nextXAxis, yAxis: nextYAxis };
}

function fixLightSeriesLabels(
  merged: Record<string, unknown>,
): Record<string, unknown> {
  if (!merged.series) return merged;
  const nextLabelColor = (
    seriesType: string | undefined,
    currentColor: unknown,
  ): string | undefined => {
    const c = typeof currentColor === "string" ? currentColor : undefined;

    // Most light-mode fixes are just "avoid near-white labels".
    if (seriesType === "bar" || seriesType === "line") {
      if (c === "#fff" || c === "#e2e8f0") return "#475569";
      return undefined;
    }

    const isGraphLike =
      seriesType === "graph" ||
      seriesType === "pie" ||
      seriesType === "treemap";
    if (isGraphLike) {
      if (c === "#e2e8f0") return "#0f172a";
      return c ?? "#475569";
    }

    if (seriesType === "heatmap") {
      if (c === "#e2e8f0") return "#0f172a";
      return c ?? "#0f172a";
    }

    return undefined;
  };

  const series = merged.series as Record<string, unknown>[];
  const nextSeries = series.map((s: Record<string, unknown>) => {
    const type = s.type as string | undefined;
    const label = (s.label || {}) as Record<string, unknown>;
    const color = nextLabelColor(type, label.color);
    if (!color) return s;
    return { ...s, label: { ...label, color } };
  });
  return { ...merged, series: nextSeries };
}

function tweakLightGaugeSeries(
  merged: Record<string, unknown>,
): Record<string, unknown> {
  if (!merged.series) return merged;
  const nextSeries = (merged.series as Record<string, unknown>[]).map((s) => {
    const ser = s as {
      type?: string;
      axisLine?: Record<string, unknown>;
      detail?: Record<string, unknown>;
    };
    if (ser.type !== "gauge") return s;
    const axisLine = ser.axisLine || {};
    const lineStyle = (axisLine.lineStyle || {}) as Record<string, unknown>;
    return {
      ...s,
      axisLine: {
        ...axisLine,
        lineStyle: { ...lineStyle, color: [[1, "#e2e8f0"]] },
      },
      detail: { ...ser.detail, color: ser.detail?.color },
    };
  });
  return { ...merged, series: nextSeries };
}

function tweakLightRadar(
  merged: Record<string, unknown>,
): Record<string, unknown> {
  if (!merged.radar) return merged;
  const radar = merged.radar as Record<string, unknown>;
  const axisName = (radar.axisName || {}) as Record<string, unknown>;
  return {
    ...merged,
    radar: {
      ...radar,
      axisName: { ...axisName, color: "#475569" },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      splitArea: {
        areaStyle: { color: ["rgba(0,0,0,0.02)", "rgba(0,0,0,0)"] },
      },
    },
  };
}

function tweakLightVisualMap(
  merged: Record<string, unknown>,
): Record<string, unknown> {
  if (!merged.visualMap) return merged;
  const vm = merged.visualMap as Record<string, unknown>;
  return { ...merged, visualMap: { ...vm, textStyle: { color: "#475569" } } };
}

function hasCartesianSeries(series: unknown): boolean {
  const list: Record<string, unknown>[] = !series
    ? []
    : Array.isArray(series)
      ? (series as Record<string, unknown>[])
      : [series as Record<string, unknown>];
  return list.some((s) => s.type === "bar" || s.type === "line");
}

function enhanceAxisLine(
  ax: Record<string, unknown>,
  spineColor: string,
): Record<string, unknown> {
  const existingLine = (ax.axisLine || {}) as Record<string, unknown>;
  const existingLS = (existingLine.lineStyle || {}) as Record<string, unknown>;
  const showSpine = existingLine.show === false ? false : true;
  return {
    ...ax,
    axisLine: {
      ...existingLine,
      lineStyle: { width: 2, color: spineColor, ...existingLS },
      show: showSpine,
    },
  };
}

function enhanceAxisTicks(
  ax: Record<string, unknown>,
  spineColor: string,
): Record<string, unknown> {
  const tickIn = ax.axisTick as Record<string, unknown> | undefined;
  const forceHideTicks = tickIn && tickIn.show === false;
  if (forceHideTicks) return { ...ax, axisTick: { show: false, ...tickIn } };
  const tickLS = (tickIn?.lineStyle || {}) as Record<string, unknown>;
  return {
    ...ax,
    axisTick: {
      show: true,
      length: 5,
      ...tickIn,
      lineStyle: { color: spineColor, width: 1, ...tickLS },
    },
  };
}

function addSplitLines(
  ax: Record<string, unknown>,
  splitLineColor: string,
): Record<string, unknown> {
  if (ax.type !== "value") return ax;
  const al = ax.axisLine as Record<string, unknown> | undefined;
  if (al && al.show === false) return ax;
  const prev = (ax.splitLine || {}) as Record<string, unknown>;
  if (prev.show === false) return ax;
  const prevLs = (prev.lineStyle || {}) as Record<string, unknown>;
  return {
    ...ax,
    splitLine: {
      ...prev,
      show: true,
      lineStyle: {
        type: "dashed",
        color: splitLineColor,
        width: 1,
        ...prevLs,
      },
    },
  };
}

function enhanceCartesianAxes(
  merged: Record<string, unknown>,
  isDark: boolean,
): Record<string, unknown> {
  if (!hasCartesianSeries(merged.series)) return merged;

  const spineColor = isDark ? "#64748b" : "#94a3b8";
  const splitLineColor = isDark
    ? "rgba(148,163,184,0.22)"
    : "rgba(100,116,139,0.3)";

  const enhanceAxis = (ax: Record<string, unknown>) => {
    const t = ax.type as string | undefined;
    if (!ax || (t !== "category" && t !== "value" && t !== "log")) return ax;
    const al = ax.axisLine as Record<string, unknown> | undefined;
    if (al && al.show === false) return ax;

    let next = enhanceAxisLine(ax, spineColor);
    next = enhanceAxisTicks(next, spineColor);
    next = addSplitLines(next, splitLineColor);
    return next;
  };

  const nextXAxis = mapAxis(merged.xAxis as EChartsAxis, enhanceAxis);
  const nextYAxis = mapAxis(merged.yAxis as EChartsAxis, enhanceAxis);
  return { ...merged, xAxis: nextXAxis, yAxis: nextYAxis };
}

function postProcessMergedOption({
  merged,
  isDark,
}: {
  merged: Record<string, unknown>;
  isDark: boolean;
}): Record<string, unknown> {
  let next = ensureAnimationDefault(merged);
  next = normalizeAxisSplitLine(next);

  if (!isDark) {
    next = fixLightSeriesLabels(next);
    next = applyLightAxisStyle(next);
    next = tweakLightGaugeSeries(next);
    next = tweakLightRadar(next);
    next = tweakLightVisualMap(next);
  }

  next = enhanceCartesianAxes(next, isDark);
  return next;
}

function buildMergedOption({
  baseTheme,
  option,
  isDark,
}: {
  baseTheme: Record<string, unknown>;
  option: Record<string, unknown>;
  isDark: boolean;
}): Record<string, unknown> {
  const mergedTooltip = buildMergedTooltip({ baseTheme, option, isDark });
  const baseGrid = (baseTheme.grid ?? {}) as Record<string, unknown>;
  const optGrid = (option.grid ?? {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = {
    ...baseTheme,
    ...option,
    tooltip: mergedTooltip,
    grid: { ...baseGrid, ...optGrid },
    legend: {
      ...(baseTheme as { legend: Record<string, unknown> }).legend,
      ...(((option as { legend?: Record<string, unknown> }).legend ||
        {}) as Record<string, unknown>),
    },
  };

  return postProcessMergedOption({ merged, isDark });
}

function ChartCard({
  title,
  subtitle,
  titleLeading,
  titleFlag,
  titleFlagNumber,
  headerExtra,
  className = "flex",
  plotOverflowY = "hidden",
  innerChartHeight,
  option,
  height = "320px",
  width = "100%",
  scrollViewportDir,
  delay = 0,
  aiPowered = false,
}: ChartCardProps) {
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenChartRef =
    useRef<React.ElementRef<typeof ReactEChartsCore>>(null);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const resizeFullscreenChart = useCallback(() => {
    fullscreenChartRef.current?.getEchartsInstance?.()?.resize();
  }, []);

  const baseTheme = useMemo(
    () => ({
      backgroundColor: "transparent",
      textStyle: {
        color: isDark ? "#94a3b8" : "#475569",
        fontFamily: "'Noto Sans Arabic', 'Inter', sans-serif",
      },
      legend: {
        textStyle: { color: isDark ? "#94a3b8" : "#475569", fontSize: 11 },
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 8,
        top: "auto",
        bottom: 8,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "18%",
        top: "10%",
        containLabel: true,
      },
      tooltip: {
        backgroundColor: isDark ? "#1a2035" : "#ffffff",
        borderColor: isDark ? "#334155" : "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: isDark ? "#e2e8f0" : "#0f172a", fontSize: 12 },
        extraCssText: `z-index: 100002; box-shadow: ${isDark ? "0 8px 30px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.12)"}; border-radius: 8px;`,
      },
      xAxis: {
        axisLine: { lineStyle: { color: isDark ? "#1e293b" : "#e2e8f0" } },
        axisTick: { lineStyle: { color: isDark ? "#1e293b" : "#e2e8f0" } },
        axisLabel: { color: isDark ? "#64748b" : "#64748b", fontSize: 11 },
        splitLine: { show: false },
      },
      yAxis: {
        axisLine: { lineStyle: { color: isDark ? "#1e293b" : "#e2e8f0" } },
        axisTick: { show: false },
        axisLabel: { color: isDark ? "#64748b" : "#64748b", fontSize: 11 },
        splitLine: { show: false },
      },
    }),
    [isDark],
  );

  const mergedOption = useMemo(() => {
    return buildMergedOption({ baseTheme, option, isDark });
  }, [option, baseTheme, isDark]);

  // useEffect(() => {
  //   if (!isFullscreen) return;
  //   const run = () => resizeFullscreenChart();
  //   const raf = requestAnimationFrame(run);
  //   const t1 = window.setTimeout(run, 80);
  //   const t2 = window.setTimeout(run, 400);
  //   return () => {
  //     cancelAnimationFrame(raf);
  //     window.clearTimeout(t1);
  //     window.clearTimeout(t2);
  //   };
  // }, [isFullscreen, resizeFullscreenChart, mergedOption]);

  useEffect(() => {
    if (!isFullscreen) return;
    const onWinResize = () => resizeFullscreenChart();
    window.addEventListener("resize", onWinResize);
    return () => window.removeEventListener("resize", onWinResize);
  }, [isFullscreen, resizeFullscreenChart]);

  const chartEl = useCallback(
    (extraHeight?: string, forFullscreen?: boolean) => (
      <ReactEChartsCore
        ref={forFullscreen ? fullscreenChartRef : undefined}
        echarts={echarts}
        option={mergedOption}
        style={{ height: extraHeight || "100%", width: "100%" }}
        opts={{ renderer: "canvas" }}
        notMerge={true}
      />
    ),
    [mergedOption],
  );

  const inlineChartNode = useMemo(
    () => chartEl(innerChartHeight),
    [chartEl, innerChartHeight],
  );
  const fullscreenChartNode = useMemo(() => chartEl("100%", true), [chartEl]);

  const showTitleBlock = Boolean(title || subtitle);
  /** Tall inner canvas + plotOverflowY auto: inner wrapper must expand so the plot container can scroll. */
  const plotScrollsWithInnerHeight =
    plotOverflowY === "auto" && Boolean(innerChartHeight);
  const hasCustomChartWidth = width !== "100%";

  const chartShell = (
    <>
      <div
        className={`${className} px-5 pt-4 pb-2 gap-3 ${showTitleBlock ? "justify-between" : "justify-end"}`}
      >
        {showTitleBlock && (
          <div className="min-w-0 flex items-center gap-2 justify-between w-full">
            <div className="w-full">
              <div className="flex items-center gap-2">
                {titleLeading}
                {titleFlag && (
                  <ChartTitleFlagBadge
                    flag={titleFlag}
                    flagNumber={titleFlagNumber}
                    size="sm"
                  />
                )}
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {title}
                </h3>
              </div>
              {subtitle && (
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md transition-all hover:scale-110 self-start"
              style={{ color: "var(--text-muted)" }}
              title="تكبير الشارت"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 mb-5">
          {headerExtra}
          {aiPowered && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: "var(--accent-cyan-dim)",
                color: "var(--accent-cyan)",
                border: "1px solid rgba(0,212,255,0.2)",
              }}
            >
              AI
            </span>
          )}
        </div>
      </div>
      <div
        className={
          hasCustomChartWidth
            ? "overflow-x-auto"
            : "overflow-x-auto sm:overflow-x-hidden"
        }
        dir={scrollViewportDir}
        style={{
          height,
          width: "100%",
          overflowY: plotOverflowY,
        }}
      >
        <div
          className={`min-w-230 sm:min-w-0 ${plotScrollsWithInnerHeight ? "" : "h-full"}`}
          style={{
            width,
            minWidth: hasCustomChartWidth ? width : undefined,
            overflow: plotScrollsWithInnerHeight ? "visible" : "hidden",
          }}
        >
          {inlineChartNode}
        </div>
      </div>
    </>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay * 0.1 }}
        className={`glass-panel overflow-visible ${aiPowered ? "ai-module glow-cyan" : ""}`}
      >
        {chartShell}
      </motion.div>

      {typeof window !== "undefined" &&
        isFullscreen &&
        createPortal(
          <FullScreenChart
            isDark={isDark}
            toggleFullscreen={toggleFullscreen}
            showTitleBlock={showTitleBlock}
            titleLeading={titleLeading}
            titleFlag={titleFlag}
            titleFlagNumber={titleFlagNumber}
            title={title}
            subtitle={subtitle}
            headerExtra={headerExtra}
            setIsFullscreen={setIsFullscreen}
            chartEl={fullscreenChartNode}
          />,
          document.body,
        )}
    </>
  );
}

export default memo(ChartCard);
