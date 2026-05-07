/**
 * GroupedAxis - Generic grouped axis visualization for ECharts
 */

"use client";

import { useEffect, useRef, useState } from "react";

interface ParsedItem {
  label: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  month?: number;
  index: number;
}

interface GroupedAxisConfig {
  getGroupKey: (item: ParsedItem) => string;
  getGroupLabel: (key: string, items: ParsedItem[]) => string;
  accentColor: string;
  solidSeparator?: boolean;
}

interface GroupedAxisProps {
  items: ParsedItem[];
  config: GroupedAxisConfig;
  gridLeft: string | number;
  gridRight: string | number;
  labelExtra?: number;
}

interface AxisGroup {
  key: string;
  startIndex: number;
  endIndex: number;
  items: ParsedItem[];
}

function buildGroups(
  items: ParsedItem[],
  getKey: (i: ParsedItem) => string,
): AxisGroup[] {
  const groups: AxisGroup[] = [];
  for (const item of items) {
    const key = getKey(item);
    const last = groups[groups.length - 1];
    if (!last || last.key !== key) {
      groups.push({
        key,
        startIndex: item.index,
        endIndex: item.index,
        items: [item],
      });
    } else {
      last.endIndex = item.index;
      last.items.push(item);
    }
  }
  return groups;
}

/**
 * Renders a generic grouped axis below ECharts with labels and separators
 */
export function GroupedAxis({
  items,
  config,
  gridLeft,
  gridRight,
  labelExtra = 44,
}: GroupedAxisProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setContainerW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Heights for each visual row
  const ROW_LABEL_H = 20;
  const ROW_LINE_H = 10;
  const TOTAL_H = ROW_LABEL_H + ROW_LINE_H;

  if (containerW === 0 || items.length === 0) {
    return <div ref={wrapRef} style={{ width: "100%", height: TOTAL_H }} />;
  }

  // Grid geometry matching ECharts
  const gLeft =
    typeof gridLeft === "string"
      ? containerW * (parseFloat(gridLeft) / 100) + labelExtra
      : gridLeft + labelExtra;
  const gRight =
    typeof gridRight === "string"
      ? containerW * (parseFloat(gridRight) / 100) + labelExtra
      : gridRight + labelExtra;
  const plotW = containerW - gLeft - gRight;
  const n = items.length;
  const slotW = plotW / n;

  // Pixel helpers
  const lx = (i: number) => gLeft + slotW * i;
  const rx = (i: number) => gLeft + slotW * (i + 1);
  const midX = (start: number, end: number) => (lx(start) + rx(end)) / 2;

  // Build groups
  const groups = buildGroups(items, config.getGroupKey);

  const labelY = ROW_LABEL_H / 2 + 1;
  const lineY = ROW_LABEL_H + 4;
  const svgH = TOTAL_H;

  const els: React.ReactNode[] = [];

  groups.forEach((group, gi) => {
    const x1 = lx(group.startIndex);
    const x2 = rx(group.endIndex);
    const mx = midX(group.startIndex, group.endIndex);
    const label = config.getGroupLabel(group.key, group.items);

    // Group label
    els.push(
      <text
        key={`gl-${group.key}`}
        x={mx}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="600"
        fill={config.accentColor}
      >
        {label}
      </text>,
    );

    // Horizontal underline
    els.push(
      <line
        key={`ul-${group.key}`}
        x1={x1 + 6}
        x2={x2 - 6}
        y1={lineY}
        y2={lineY}
        stroke={config.accentColor}
        strokeWidth={1.5}
        strokeOpacity={0.6}
      />,
    );

    // Vertical separator before group (except first)
    if (gi > 0) {
      const sepX = lx(group.startIndex);
      els.push(
        <line
          key={`vs-${group.key}`}
          x1={sepX}
          x2={sepX}
          y1={0}
          y2={svgH}
          stroke={config.solidSeparator ? "#94a3b8" : "#cbd5e1"}
          strokeWidth={config.solidSeparator ? 1.5 : 1}
          strokeDasharray={config.solidSeparator ? undefined : "4 2"}
        />,
      );
    }
  });

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <svg
        width="100%"
        height={svgH}
        style={{ display: "block", overflow: "visible" }}
      >
        {els}
      </svg>
    </div>
  );
}
