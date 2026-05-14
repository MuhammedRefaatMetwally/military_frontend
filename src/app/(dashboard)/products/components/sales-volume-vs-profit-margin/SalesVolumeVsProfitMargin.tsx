"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useCallback } from "react";
import { ChevronRight, Home, Loader2, AlertCircle, Package, RotateCcw } from "lucide-react";

import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useThemeStore } from "@/store/themeStore";
import { useFilterStore } from "@/store/filterStore";
import { productsStandardGrid } from "../../utils/data";

import {
  useInfiniteGroup1,
  useInfiniteGroup2,
  useInfiniteGroup3,
  useInfiniteProducts,
} from "@/hooks/useInfiniteHooks";
import { useSalesVolumeMargin } from "@/hooks/useProductAnalysis";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  { ssr: false, loading: () => <div style={{ height: 320 }}>Loading chart...</div> },
);

// ─── Types ─────────────────────────────────────────────────────────────────────

type DrillLevel = "group1" | "group2" | "group3" | "products";

interface BreadcrumbItem {
  level: DrillLevel;
  label: string;
  ids: number[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmtK = (n: number) =>
  n >= 1_000_000_000
    ? `${(n / 1_000_000_000).toFixed(1)}B`
    : n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}K`
    : String(n);

function useSearchState(debounce = 300) {
  const [raw, setRaw] = useState("");
  const [applied, setApplied] = useState("");
  const set = useCallback(
    (v: string) => {
      setRaw(v);
      setTimeout(() => setApplied(v), debounce);
    },
    [debounce],
  );
  return { raw, applied, set };
}

// ─── Level config ──────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<DrillLevel, string> = {
  group1: "المجموعة الأولى",
  group2: "المجموعة الثانية",
  group3: "المجموعة الثالثة",
  products: "المنتجات",
};

const LEVEL_COLORS: Record<DrillLevel, string> = {
  group1: "var(--accent-amber)",
  group2: "#f59e0b",
  group3: "#ea580c",
  products: "var(--accent-cyan)",
};

// ─── Jitter helper ─────────────────────────────────────────────────────────────
// Nudges overlapping points apart while preserving original values for tooltips.

interface JitterInput {
  x: number;
  y: number;
  xRange: number;
  yRange: number;
}

function applyJitter<T extends JitterInput>(points: T[], minDistFraction = 0.055): T[] {
  const placed: { x: number; y: number }[] = [];
  return points.map((p) => {
    let x = p.x;
    let y = p.y;
    let attempts = 0;
    while (attempts < 80) {
      const tooClose = placed.some((q) => {
        const dx = p.xRange > 0 ? (x - q.x) / p.xRange : 0;
        const dy = p.yRange > 0 ? (y - q.y) / p.yRange : 0;
        return Math.sqrt(dx * dx + dy * dy) < minDistFraction;
      });
      if (!tooClose) break;
      x = p.x + (Math.random() - 0.5) * p.xRange * 0.09;
      y = p.y + (Math.random() - 0.5) * p.yRange * 0.18;
      attempts++;
    }
    placed.push({ x, y });
    return { ...p, x, y };
  });
}

// ─── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({
  trail,
  currentLevel,
  onNavigate,
  onReset,
  isLoading,
  hasData,
}: {
  trail: BreadcrumbItem[];
  currentLevel: DrillLevel;
  onNavigate: (index: number) => void;
  onReset: () => void;
  isLoading: boolean;
  hasData: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "6px 8px",
        width: "100%",
        marginTop: 6,
        padding: "4px 0",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      {/* ── Left: trail ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "4px 0",
          flex: 1,
          minWidth: 0,
        }}
      >
        <button
          onClick={() => onNavigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: trail.length === 0 ? "var(--text-primary)" : "var(--accent-cyan)",
            background: trail.length === 0 ? "var(--bg-elevated)" : "transparent",
            border: trail.length === 0 ? "1px solid var(--border-subtle)" : "none",
            cursor: "pointer",
            padding: "3px 8px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <Home size={10} />
          الكل
        </button>

        {trail.map((item, i) => {
          const isLast = i === trail.length - 1;
          return (
            <span
              key={i}
              style={{ display: "flex", alignItems: "center", flexShrink: isLast ? 1 : 0 }}
            >
              <ChevronRight
                size={11}
                style={{
                  color: "var(--text-muted)",
                  transform: "scaleX(-1)",
                  margin: "0 2px",
                  flexShrink: 0,
                  opacity: 0.5,
                }}
              />
              {isLast ? (
                <span
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    fontSize: 10,
                    padding: "3px 8px",
                    background: "var(--bg-elevated)",
                    border: `1px solid ${LEVEL_COLORS[item.level]}40`,
                    borderRadius: 6,
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                  }}
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate(i)}
                  style={{
                    color: "var(--accent-cyan)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "3px 6px",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={item.label}
                >
                  {item.label}
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* ── Right: level badge + hints + reset ──────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {isLoading && (
          <Loader2 size={11} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        )}
        {!isLoading && hasData && currentLevel !== "products" && (
          <span style={{ fontSize: 9, color: "var(--text-muted)", whiteSpace: "nowrap", opacity: 0.7 }}>
            انقر للتعمق ↓
          </span>
        )}
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: 6,
            background: `${LEVEL_COLORS[currentLevel]}18`,
            color: LEVEL_COLORS[currentLevel],
            border: `1px solid ${LEVEL_COLORS[currentLevel]}40`,
            letterSpacing: ".3px",
            whiteSpace: "nowrap",
          }}
        >
          {LEVEL_LABELS[currentLevel]}
        </span>
        {trail.length > 0 && (
          <button
            onClick={onReset}
            style={{
              fontSize: 9,
              padding: "3px 8px",
              borderRadius: 6,
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 3,
              whiteSpace: "nowrap",
            }}
          >
            <RotateCcw size={9} />
            إعادة
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const SalesVolumeVsProfitMargin = () => {
  // ── Global filters ──────────────────────────────────────────────────────────
  const { activeBranches, region, year, quarter, month } = useFilterStore();

  // ── Drill-down state ────────────────────────────────────────────────────────
  const [level, setLevel] = useState<DrillLevel>("group1");
  const [trail, setTrail] = useState<BreadcrumbItem[]>([]);

  const group1Ids = useMemo(
    () => trail.find((t) => t.level === "group1")?.ids ?? [],
    [trail],
  );
  const group2Ids = useMemo(
    () => trail.find((t) => t.level === "group2")?.ids ?? [],
    [trail],
  );
  const group3Ids = useMemo(
    () => trail.find((t) => t.level === "group3")?.ids ?? [],
    [trail],
  );

  // ── Search states ───────────────────────────────────────────────────────────
  const g1Search      = useSearchState();
  const g2Search      = useSearchState();
  const g3Search      = useSearchState();
  const productSearch = useSearchState();

  // ── Infinite dropdown queries ───────────────────────────────────────────────
  const group1Query   = useInfiniteGroup1({ search: g1Search.applied });
  const group2Query   = useInfiniteGroup2({ search: g2Search.applied, group1: group1Ids[0] });
  const group3Query   = useInfiniteGroup3({ search: g3Search.applied, group2: group2Ids[0] });
  const productsQuery = useInfiniteProducts({
    search: productSearch.applied,
    group3_ids: group3Ids.join(",") || undefined,
  });

  // ── Parse global date filters ───────────────────────────────────────────────
  const parsedYears = useMemo(() => {
    if (!year) return undefined;
    const y = Number(year);
    return isNaN(y) ? undefined : [y];
  }, [year]);

  const parsedQuarters = useMemo(() => {
    if (!quarter) return undefined;
    const q = Number(quarter);
    return isNaN(q) ? undefined : [q];
  }, [quarter]);

  const parsedMonths = useMemo(() => {
    if (!month) return undefined;
    const m = Number(month);
    return isNaN(m) ? undefined : [m];
  }, [month]);

  const parsedRegionIds = useMemo(
    () => (region.length > 0 ? region.map(Number).filter(Boolean) : undefined),
    [region],
  );

  const parsedBranchIds = useMemo(
    () => (activeBranches.length > 0 ? activeBranches.map(Number).filter(Boolean) : undefined),
    [activeBranches],
  );

  // ── API query ───────────────────────────────────────────────────────────────
  const queryParams = useMemo(
    () => ({
      level,
      group1Ids: group1Ids.length > 0 ? group1Ids : undefined,
      group2Ids: group2Ids.length > 0 ? group2Ids : undefined,
      group3Ids: group3Ids.length > 0 ? group3Ids : undefined,
      regionIds: parsedRegionIds,
      branchIds: parsedBranchIds,
      years:     parsedYears,
      quarter:   parsedQuarters,
      month:     parsedMonths,
    }),
    [level, group1Ids, group2Ids, group3Ids, parsedRegionIds, parsedBranchIds, parsedYears, parsedQuarters, parsedMonths],
  );

  const { data, isLoading, isError, error } = useSalesVolumeMargin(queryParams);

  // ── Theme ───────────────────────────────────────────────────────────────────
  const mode           = useThemeStore((s) => s.mode);
  const isDark         = mode === "dark";
  const splitLineColor = isDark ? "rgba(148,163,184,0.22)" : "rgba(100,116,139,0.3)";
  const spineColor     = isDark ? "#64748b" : "#94a3b8";
  const palette        = useResolvedAnalyticsPalette();

  const catColors = useMemo(
    () => [
      palette.primaryGreen,
      palette.primaryCyan,
      palette.primaryBlue,
      palette.primaryIndigo,
      palette.primaryAmber,
      palette.primaryRed,
      "#0d9488",
      "#059669",
      "#7c3aed",
      "#db2777",
    ],
    [palette],
  );

  // ── Drill-down handler ──────────────────────────────────────────────────────
  const handleDrillDown = useCallback(
    (params: unknown) => {
      if (level === "products") return;
      const { data } = params as { data: [number, number, string, number] };
      const [, , name, id] = data;
      const nextLevelMap: Record<DrillLevel, DrillLevel> = {
        group1: "group2",
        group2: "group3",
        group3: "products",
        products: "products",
      };
      setTrail((prev) => [...prev, { level, label: name, ids: [id] }]);
      setLevel(nextLevelMap[level]);
    },
    [level],
  );

  // ── Breadcrumb navigation ───────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setTrail([]);
    setLevel("group1");
  }, []);

  const handleBreadcrumbNavigate = useCallback(
    (index: number) => {
      if (index === -1) {
        handleReset();
      } else {
        const newTrail = trail.slice(0, index + 1);
        const nextLevelMap: Record<DrillLevel, DrillLevel> = {
          group1: "group2",
          group2: "group3",
          group3: "products",
          products: "products",
        };
        setTrail(newTrail);
        setLevel(nextLevelMap[newTrail[newTrail.length - 1].level]);
      }
    },
    [trail, handleReset],
  );

  // ── Chart data with jitter ──────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (!data?.data || data.data.length === 0) return [];

    const raw = data.data;
    const xs = raw.map((d) => d.net_sales);
    const ys = raw.map((d) => d.profit_margin);
    const xRange = Math.max(...xs) - Math.min(...xs) || 1;
    const yRange = Math.max(...ys) - Math.min(...ys) || 1;

    // Build jitter-ready inputs preserving original values
    const inputs = raw.map((item) => ({
      x: item.net_sales,
      y: item.profit_margin,
      origX: item.net_sales,
      origY: item.profit_margin,
      xRange,
      yRange,
      name: item.name,
      id: item.id,
    }));

    const jittered = applyJitter(inputs);

    // ECharts expects [jitteredX, jitteredY, name, id, origX, origY]
    return jittered.map((p) => [p.x, p.y, p.name, p.id, p.origX, p.origY]);
  }, [data]);

  // ── Axis padding — extra breathing room so edge points are never clipped ────
  const axisBounds = useMemo(() => {
    if (chartData.length === 0) return {};
    const xs = chartData.map((d) => d[0] as number);
    const ys = chartData.map((d) => d[1] as number);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const xPad = (xMax - xMin) * 0.2 || 100_000;
    const yPad = (yMax - yMin) * 0.25 || 5;
    return {
      xMin: Math.max(0, xMin - xPad),
      xMax: xMax + xPad,
      yMin: Math.max(0, yMin - yPad),
      yMax: yMax + yPad,
    };
  }, [chartData]);

  // ── Chart option ────────────────────────────────────────────────────────────
  const scatterOption = useMemo(
    () => ({
      tooltip: {
        trigger: "item" as const,
        // Show ORIGINAL (pre-jitter) values in tooltip
        formatter: (p: { data: [number, number, string, number, number, number] }) =>
          `<b>${p.data[2]}</b><br/>صافي المبيعات: ${fmtK(p.data[4] ?? p.data[0])}<br/>هامش الربح: ${(p.data[5] ?? p.data[1]).toFixed(2)}%`,
      },
      xAxis: {
        name: "صافي المبيعات",
        type: "value" as const,
        nameLocation: "middle" as const,
        nameGap: 32,
        nameTextStyle: { fontSize: 9 },
        min: axisBounds.xMin,
        max: axisBounds.xMax,
        axisLabel: { formatter: (v: number) => fmtK(v), fontSize: 9 },
        axisTick: { show: false },
        axisLine: { show: true, lineStyle: { width: 2, color: spineColor } },
        splitLine: {
          show: true,
          lineStyle: { type: "dashed" as const, color: splitLineColor, width: 1 },
        },
      },
      yAxis: {
        name: "هامش الربح %",
        type: "value" as const,
        nameLocation: "middle" as const,
        nameGap: 40,
        nameTextStyle: { fontSize: 9 },
        min: axisBounds.yMin,
        max: axisBounds.yMax,
        axisLabel: { formatter: "{value}%", fontSize: 9 },
        axisTick: { show: false },
        axisLine: { show: true, lineStyle: { width: 2, color: spineColor } },
        splitLine: {
          show: true,
          lineStyle: { type: "dashed" as const, color: splitLineColor, width: 1 },
        },
      },
      series: [
        {
          type: "scatter",
          // Larger symbols so every point is easy to click/see
          symbolSize: 18,
          data: chartData,
          itemStyle: {
            color: (p: { dataIndex: number }) => catColors[p.dataIndex % catColors.length],
            opacity: 0.9,
            borderWidth: level !== "products" ? 1.5 : 0,
            borderColor: "rgba(255,255,255,0.35)",
          },
          cursor: level !== "products" ? "pointer" : "default",
          label: { show: false },
          emphasis: {
            scale: 1.2,
            label: {
              show: true,
              formatter: (p: { data: (number | string)[] }) => {
                const name = String(p.data[2]);
                return name.length > 20 ? name.slice(0, 18) + "…" : name;
              },
              fontSize: 9,
              position: "top" as const,
            },
            itemStyle: { borderWidth: 2, borderColor: "#fff" },
          },
        },
      ],
      grid: { ...productsStandardGrid, left: "6%", containLabel: true },
    }),
    [chartData, catColors, splitLineColor, spineColor, level, axisBounds],
  );

  // ── States ──────────────────────────────────────────────────────────────────
  const isEmpty = !isLoading && !isError && chartData.length === 0;

  // ── Header extra ────────────────────────────────────────────────────────────
  const headerExtra = (
    <Breadcrumb
      trail={trail}
      currentLevel={level}
      onNavigate={handleBreadcrumbNavigate}
      onReset={handleReset}
      isLoading={isLoading}
      hasData={chartData.length > 0}
    />
  );

  // ── Overlays ────────────────────────────────────────────────────────────────
  const overlay = isLoading ? (
    <div
      style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: isDark ? "rgba(15,23,42,0.7)" : "rgba(248,250,252,0.7)",
        backdropFilter: "blur(4px)", borderRadius: 12, gap: 10, zIndex: 10,
      }}
    >
      <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent-cyan)" }} />
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>جارٍ تحميل البيانات…</span>
    </div>
  ) : isError ? (
    <div
      style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, zIndex: 10,
      }}
    >
      <AlertCircle size={28} style={{ color: "var(--accent-red)" }} />
      <span style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
        {(error as unknown as { message?: string })?.message ?? "حدث خطأ أثناء تحميل البيانات"}
      </span>
      <button
        onClick={handleReset}
        style={{
          fontSize: 10, padding: "4px 10px", borderRadius: 6,
          background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
          color: "var(--text-primary)", cursor: "pointer",
        }}
      >
        إعادة المحاولة
      </button>
    </div>
  ) : isEmpty ? (
    <div
      style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, zIndex: 10,
      }}
    >
      <Package size={28} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
        لا توجد بيانات للمستوى المحدد
      </span>
    </div>
  ) : null;

  return (
    <div style={{ position: "relative" }}>
      {overlay}
      <ChartCard
        title="حجم المبيعات مقابل هامش الربح"
        titleFlag="green"
        subtitle="Product Volume & % Profit Margin by Category"
        option={scatterOption}
        onEvents={{ click: handleDrillDown }}
        headerExtra={headerExtra}
        height="320px"
        delay={2}
      />
    </div>
  );
};

export default SalesVolumeVsProfitMargin;