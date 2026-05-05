import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useThemeStore } from "@/store/themeStore";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { categories } from "../../utils/categories";
import { stableHash } from "../../utils/stableHash";
import { SearchDropdown } from "@/components/ui/SearchDropdown";
import { Search } from "lucide-react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const profitCatLevelOptions = [
  { value: "level1", label: "الفئة الأولى" },
  { value: "level2", label: "الفئة الثانية" },
  { value: "level3", label: "الفئة الثالثة" },
] as const;

const dist100 = (key: string): [number, number, number, number] => {
  const h = stableHash(key);
  const a = 10 + (h % 55);
  const b = 8 + ((h >>> 8) % 35);
  const c = 6 + ((h >>> 16) % 25);
  const sum = a + b + c;
  const d = Math.max(0, 100 - sum);
  // if d got too big/small, normalize lightly
  const raw: number[] = [a, b, c, d];
  const total = raw.reduce((s, n) => s + n, 0) || 1;
  const norm = raw.map((n) => Math.round((n / total) * 100));
  // fix rounding drift
  const drift = 100 - norm.reduce((s, n) => s + n, 0);
  norm[0] += drift;
  return norm as [number, number, number, number];
};

// ── هامش الربح حسب الفئة و نوع الخصم ──
const discountTypes = [
  "رفقاء السلاح - 10%",
  "خصم التربية و التعليم 7%",
  "خصم الضمان الاجتماعي 5%",
  "خصم البريد الاردني 2%",
] as const;

type AxisTooltipParam = {
  axisValueLabel?: string;
  marker?: string;
  seriesName?: string;
  value?: number | string;
};

function formatAxisTooltip(params: AxisTooltipParam | AxisTooltipParam[]) {
  const items = Array.isArray(params) ? params : [params];
  const title = items[0]?.axisValueLabel ?? "";
  const rows = items
    .map(
      (item) => `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:14px;">
          <div style="display:flex; align-items:center;">
            <span style="display:inline-flex; margin-inline-end:8px;">${item.marker ?? ""}</span>
            <span>${item.seriesName ?? ""}</span>
          </div>
          <strong>${Number(item.value ?? 0).toLocaleString("en-US")}</strong>
        </div>`,
    )
    .join("");

  return `
    <div style="display:flex; flex-direction:column; gap:8px; min-width:160px;">
      <div style="font-weight:700;">${title}</div>
      ${rows}
    </div>`;
}

const ProfitMarginByCategoryAndTypeOfDiscount = () => {
  // ── هامش الربح حسب الفئة و نوع الخصم: مستوى الفئات ──
  const [profitCatLevel, setProfitCatLevel] = useState<
    "level1" | "level2" | "level3"
  >("level1");
  /** Optional single pick to avoid huge lists (can be 100+). Empty = all. */
  const [profitCatPick, setProfitCatPick] = useState<string>("");

  const palette = useResolvedAnalyticsPalette();
  const isDark = useThemeStore((s) => s.mode === "dark");
  const level1Names = categories.map((c) => c.name);
  const level2Names = Array.from(
    new Set(
      categories.flatMap((c) =>
        c.products.map((p) => p.name.split(" ").slice(0, 2).join(" ")),
      ),
    ),
  );
  const level3Names = Array.from(
    new Set(categories.flatMap((c) => c.products.map((p) => p.name))),
  );
  const yAxisCats = (() => {
    const list =
      profitCatLevel === "level1"
        ? level1Names
        : profitCatLevel === "level2"
          ? level2Names
          : level3Names;
    if (!profitCatPick) return list;
    return list.filter((n) => n === profitCatPick);
  })();
  const seriesDataByDiscountType = yAxisCats.map((name) =>
    dist100(`${profitCatLevel}|${name}`),
  );
  const profitMarginByCatOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        backgroundColor: "#1a2035",
        borderColor: "#1e293b",
        textStyle: { color: "#e2e8f0", fontSize: 10 },
        formatter: (params: AxisTooltipParam | AxisTooltipParam[]) =>
          formatAxisTooltip(params),
      },
      legend: {
        data: [...discountTypes],
        bottom: 0,
        left: "center",
        textStyle: { color: "#64748b", fontSize: 8 },
      },
      grid: {
        left: "4%",
        right: "3%",
        top: "14%",
        bottom: "18%",
        containLabel: true,
      },
      xAxis: {
        type: "value" as const,
        max: 100,
        axisLabel: { formatter: "{value}%", fontSize: 8, color: "#64748b" },
        axisLine: {
          show: true,
          lineStyle: { color: palette.primarySlate, width: 1.5 },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: isDark ? "#1e293b" : "rgba(100, 116, 139, 0.35)",
          },
        },
      },
      yAxis: {
        type: "category" as const,
        data: yAxisCats,
        axisLabel: { fontSize: 9, color: "#94a3b8" },
        axisLine: {
          show: true,
          lineStyle: { color: palette.primarySlate, width: 1.5 },
        },
        axisTick: { show: false },
      },
      series: [
        {
          name: discountTypes[0],
          type: "bar" as const,
          stack: "total",
          barMaxWidth: 18,
          data: seriesDataByDiscountType.map((d) => d[0]),
          itemStyle: { color: palette.primaryGreen },
          label: {
            show: true,
            fontSize: 7,
            color: "#fff",
            formatter: (p: { value: number }) =>
              p.value > 5 ? `${p.value}%` : "",
          },
        },
        {
          name: discountTypes[1],
          type: "bar" as const,
          stack: "total",
          barMaxWidth: 18,
          data: seriesDataByDiscountType.map((d) => d[1]),
          itemStyle: { color: palette.primaryCyan },
        },
        {
          name: discountTypes[2],
          type: "bar" as const,
          stack: "total",
          barMaxWidth: 18,
          data: seriesDataByDiscountType.map((d) => d[2]),
          itemStyle: { color: palette.primaryRed },
        },
        {
          name: discountTypes[3],
          type: "bar" as const,
          stack: "total",
          barMaxWidth: 18,
          data: seriesDataByDiscountType.map((d) => d[3]),
          itemStyle: { color: palette.primaryAmber },
        },
      ],
    };
  }, [isDark, palette, yAxisCats, seriesDataByDiscountType]);
  return (
    <ChartCard
      title="هامش الربح حسب الفئة و نوع الخصم"
      titleFlag="green"
      subtitle="Profit Margin by Category and Discount Type"
      option={profitMarginByCatOption}
      headerExtra={
        <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
          <div className="flex items-center gap-0.5 flex-wrap justify-end">
            <span
              className="text-[9px] shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              المستوى:
            </span>
            {profitCatLevelOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setProfitCatLevel(value);
                  setProfitCatPick("");
                }}
                className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
                style={{
                  background:
                    profitCatLevel === value
                      ? "var(--accent-green-dim)"
                      : "var(--bg-elevated)",
                  color:
                    profitCatLevel === value
                      ? "var(--accent-green)"
                      : "var(--text-muted)",
                  border: `1px solid ${
                    profitCatLevel === value
                      ? "var(--accent-green)"
                      : "var(--border-subtle)"
                  }`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            className="hidden sm:block h-5 w-px shrink-0"
            style={{ background: "var(--border-subtle)" }}
            aria-hidden
          />
          <div>
            <SearchDropdown
              icon={Search}
              label="كل الأصناف"
              value={profitCatPick}
              options={
                profitCatLevel === "level1"
                  ? level1Names
                  : profitCatLevel === "level2"
                    ? level2Names
                    : level3Names
              }
              onChange={setProfitCatPick}
              accent="var(--accent-cyan)"
            />
          </div>
        </div>
      }
      height="360px"
      delay={1}
    />
  );
};

export default ProfitMarginByCategoryAndTypeOfDiscount;
