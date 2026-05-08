"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useCallback } from "react";
import { Layers, Package, ChevronRight, Home, Loader2, AlertCircle } from "lucide-react";

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
import { InfiniteDropdown } from "@/components/ui/Infinitedropdown";

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

// ─── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({
  trail,
  onNavigate,
}: {
  trail: BreadcrumbItem[];
  onNavigate: (index: number) => void;
}) {
  if (trail.length === 0) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap" style={{ fontSize: 10 }}>
      <button
        onClick={() => onNavigate(-1)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          color: "var(--accent-cyan)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "2px 4px",
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        <Home size={10} />
        الكل
      </button>
      {trail.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ChevronRight size={10} style={{ color: "var(--text-muted)", transform: "scaleX(-1)" }} />
          {i < trail.length - 1 ? (
            <button
              onClick={() => onNavigate(i)}
              style={{
                color: "var(--accent-cyan)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px 4px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </button>
          ) : (
            <span
              style={{
                color: "var(--text-primary)",
                fontWeight: 700,
                padding: "2px 4px",
                background: "var(--bg-elevated)",
                borderRadius: 4,
                maxWidth: 150,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

// ─── Level Label ───────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<DrillLevel, string> = {
  group1: "المجموعة الأولى",
  group2: "المجموعة الثانية",
  group3: "المجموعة الثالثة",
  products: "المنتجات",
};

// ─── Main Component ────────────────────────────────────────────────────────────

const SalesVolumeVsProfitMargin = () => {
  // ── Global filters ──────────────────────────────────────────────────────────
  const {
    activeBranches,
    region,
    year,
    quarter,
    month,
  } = useFilterStore();

  // ── Drill-down state ────────────────────────────────────────────────────────
  const [level, setLevel] = useState<DrillLevel>("group1");
  // Each entry in the trail represents a completed drill step
  const [trail, setTrail] = useState<BreadcrumbItem[]>([]);

  // IDs passed as parent filters at each level
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

  // ── Search states for infinite dropdowns (local filters) ───────────────────
  const g1Search = useSearchState();
  const g2Search = useSearchState();
  const g3Search = useSearchState();
  const productSearch = useSearchState();

  // ── Infinite dropdown queries (local drill-filter only — not used for chart) ─
  const group1Query = useInfiniteGroup1({ search: g1Search.applied });
  const group2Query = useInfiniteGroup2({
    search: g2Search.applied,
    group1: group1Ids[0],
  });
  const group3Query = useInfiniteGroup3({
    search: g3Search.applied,
    group2: group2Ids[0],
  });
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
    () =>
      activeBranches.length > 0
        ? activeBranches.map(Number).filter(Boolean)
        : undefined,
    [activeBranches],
  );

  // ── API query ───────────────────────────────────────────────────────────────
  const queryParams = useMemo(() => ({
    level,
    group1Ids: group1Ids.length > 0 ? group1Ids : undefined,
    group2Ids: group2Ids.length > 0 ? group2Ids : undefined,
    group3Ids: group3Ids.length > 0 ? group3Ids : undefined,
    regionIds: parsedRegionIds,
    branchIds: parsedBranchIds,
    years: parsedYears,
    quarter: parsedQuarters,
    month: parsedMonths,
  }), [
    level, group1Ids, group2Ids, group3Ids,
    parsedRegionIds, parsedBranchIds,
    parsedYears, parsedQuarters, parsedMonths,
  ]);

  const { data, isLoading, isError, error } = useSalesVolumeMargin(queryParams);

  // ── Theme ───────────────────────────────────────────────────────────────────
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  const splitLineColor = isDark ? "rgba(148,163,184,0.22)" : "rgba(100,116,139,0.3)";
  const spineColor = isDark ? "#64748b" : "#94a3b8";
  const palette = useResolvedAnalyticsPalette();

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
  const handleBreadcrumbNavigate = useCallback((index: number) => {
    if (index === -1) {
      // Go to root
      setTrail([]);
      setLevel("group1");
    } else {
      // Go back to a specific trail item
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
  }, [trail]);

  // ── Chart series data ───────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item) => [
      item.net_sales,
      item.profit_margin,
      item.name,
      item.id, // 4th element: id for drill-down
    ]);
  }, [data]);

  // ── Chart option ────────────────────────────────────────────────────────────
  const scatterOption = useMemo(() => ({
    tooltip: {
      trigger: "item" as const,
      formatter: (p: { data: [number, number, string, number] }) =>
        `<b>${p.data[2]}</b><br/>صافي المبيعات: ${fmtK(p.data[0])}<br/>هامش الربح: ${p.data[1].toFixed(2)}%`,
    },
    xAxis: {
      name: "صافي المبيعات",
      type: "value" as const,
      nameLocation: "middle" as const,
      nameGap: 32,
      nameTextStyle: { fontSize: 9 },
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
        // Fixed size matching design — small uniform circles
        symbolSize: 16,
        data: chartData,
        itemStyle: {
          color: (p: { dataIndex: number }) =>
            catColors[p.dataIndex % catColors.length],
          opacity: 0.88,
          borderWidth: level !== "products" ? 1.5 : 0,
          borderColor: "rgba(255,255,255,0.3)",
        },
        cursor: level !== "products" ? "pointer" : "default",
        label: { show: false },
        emphasis: {
          scale: 1.15,
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
    grid: { ...productsStandardGrid, left: "6%" },
  }), [chartData, catColors, splitLineColor, spineColor, level]);

  // ── Overlay states ──────────────────────────────────────────────────────────
  const isEmpty = !isLoading && !isError && chartData.length === 0;

  // ── Header filters ──────────────────────────────────────────────────────────
  const headerExtra = (
    <div className="mt-2 flex flex-col gap-2">
      {/* Breadcrumb trail */}
      {trail.length > 0 && (
        <Breadcrumb trail={trail} onNavigate={handleBreadcrumbNavigate} />
      )}

      {/* Level + drill context */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Current level badge */}
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: 6,
            background: "var(--bg-elevated)",
            color: "var(--accent-cyan)",
            border: "1px solid var(--border-subtle)",
            letterSpacing: ".4px",
          }}
        >
          {LEVEL_LABELS[level]}
        </span>

        {/* Drill-down hint */}
        {level !== "products" && !isLoading && chartData.length > 0 && (
          <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
            انقر على نقطة للتعمق ↓
          </span>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "var(--text-muted)" }}>
            <Loader2 size={10} className="animate-spin" />
            جارٍ التحميل…
          </span>
        )}

        {/* Reset drill */}
        {trail.length > 0 && (
          <button
            onClick={() => { setTrail([]); setLevel("group1"); }}
            style={{
              fontSize: 9,
              padding: "2px 7px",
              borderRadius: 6,
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Home size={9} /> إعادة التعيين
          </button>
        )}
      </div>
    </div>
  );

  // ── Overlay for loading / error / empty ─────────────────────────────────────
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
        {(error as any)?.message ?? "حدث خطأ أثناء تحميل البيانات"}
      </span>
      <button
        onClick={() => { setTrail([]); setLevel("group1"); }}
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
        className=""
        height="320px"
        delay={2}
      />
    </div>
  );
};

export default SalesVolumeVsProfitMargin;