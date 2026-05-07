/**
 * ChartFooter - Composed footer with legend and grouped axis
 */

import { useMemo } from "react";
import {
  type LevelType,
  type IndicatorType,
  type QuarterType,
  QUARTER_LABELS,
} from "../utils/date-based-sales.constants";
import { GroupedAxis } from "./GroupedAxis";
import { HtmlLegend } from "./HtmlLegend";

interface ParsedItem {
  label: string;
  year: number;
  quarter: QuarterType;
  month?: number;
  index: number;
}

interface LegendItem {
  color: string;
  name: string;
}

interface GroupedAxisConfig {
  getGroupKey: (item: ParsedItem) => string;
  getGroupLabel: (key: string, items: ParsedItem[]) => string;
  accentColor: string;
  solidSeparator?: boolean;
}

interface ChartFooterProps {
  level: LevelType;
  items: ParsedItem[];
  seriesMode: IndicatorType;
  palette: { primaryGreen: string; primaryCyan: string };
}

/**
 * Renders the chart footer with legend and optional grouped axes
 */
export function ChartFooter({
  level,
  items,
  seriesMode,
  palette,
}: ChartFooterProps) {
  // ─── Legend items ─────────────────────────────────────────────────────

  const legendItems: LegendItem[] = useMemo(() => {
    const out: LegendItem[] = [];
    if (seriesMode === "sales" || seriesMode === "both")
      out.push({ color: palette.primaryGreen, name: "المبيعات" });
    if (seriesMode === "profit" || seriesMode === "both")
      out.push({ color: palette.primaryCyan, name: "الأرباح" });
    return out;
  }, [seriesMode, palette.primaryGreen, palette.primaryCyan]);

  // ─── Grouped axis configs ─────────────────────────────────────────────

  const axisConfig = useMemo((): GroupedAxisConfig | null => {
    if (level === "year") return null;
    if (level === "month") return null;

    if (level === "quarter") {
      return {
        getGroupKey: (item) => String(item.year),
        getGroupLabel: (key) => key,
        accentColor: palette.primaryGreen,
        solidSeparator: true,
      };
    }

    return null;
  }, [level, palette.primaryGreen]);

  const quarterAxisConfig = useMemo((): GroupedAxisConfig | null => {
    if (level !== "month") return null;
    return {
      getGroupKey: (item) => `${item.year}-${item.quarter}`,
      getGroupLabel: (_key, groupItems) =>
        QUARTER_LABELS[groupItems[0].quarter],
      accentColor: "#64748b",
      solidSeparator: false,
    };
  }, [level]);

  const yearAxisConfig = useMemo((): GroupedAxisConfig | null => {
    if (level !== "month") return null;
    return {
      getGroupKey: (item) => String(item.year),
      getGroupLabel: (key) => key,
      accentColor: palette.primaryGreen,
      solidSeparator: true,
    };
  }, [level, palette.primaryGreen]);

  // ECharts grid settings
  const GRID_LEFT = "5%";
  const GRID_RIGHT = "6%";

  return (
    <div style={{ width: "100%", paddingBottom: 8 }}>
      {/* Quarter level: one year-grouping row */}
      {axisConfig && items.length > 0 && (
        <GroupedAxis
          items={items}
          config={axisConfig}
          gridLeft={GRID_LEFT}
          gridRight={GRID_RIGHT}
        />
      )}

      {/* Month level: quarter tier then year tier */}
      {quarterAxisConfig && yearAxisConfig && items.length > 0 && (
        <>
          <GroupedAxis
            items={items}
            config={quarterAxisConfig}
            gridLeft={GRID_LEFT}
            gridRight={GRID_RIGHT}
          />
          <GroupedAxis
            items={items}
            config={yearAxisConfig}
            gridLeft={GRID_LEFT}
            gridRight={GRID_RIGHT}
          />
        </>
      )}

      {/* Legend always at bottom */}
      <HtmlLegend items={legendItems} />
    </div>
  );
}
