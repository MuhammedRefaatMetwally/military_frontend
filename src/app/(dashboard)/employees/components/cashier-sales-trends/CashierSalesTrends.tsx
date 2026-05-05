import dynamic from "next/dynamic";
import { useMemo } from "react";
import { cashiersBase } from "../../utils/cashiersBase";
import { useFilterStore } from "@/store/filterStore";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useThemeStore } from "@/store/themeStore";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const EMPLOYEE_TREND_MONTHS = Array.from(
  { length: 12 },
  (_, i) => `شهر ${i + 1}`,
);

const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2)}K` : fmt2(n));

type TrendTooltipParam = {
  axisValueLabel?: string;
  marker?: string;
  seriesName?: string;
  value?: number | string;
};

const CashierSalesTrends = () => {
  const palette = useResolvedAnalyticsPalette();
  const selectedEmployees = useFilterStore((s) => s.employee);
  const workShift = useFilterStore((s) => s.workShift);
  const returnRateRange = useFilterStore((s) => s.returnRateRange);
  const isDark = useThemeStore((s) => s.mode === "dark");
  const trendColors = useMemo(
    () => [
      palette.primaryGreen,
      palette.primaryCyan,
      palette.primaryBlue,
      palette.primaryPurple,
      palette.primaryAmber,
      palette.primaryRed,
      "#0891b2",
      palette.primaryGreen,
      "#d97706",
    ],
    [palette],
  );
  const cashiers = cashiersBase.map((c, idx) => ({
    ...c,
    workShift: (idx % 2 === 0 ? "morning" : "evening") as "morning" | "evening",
    /** عدد الأصناف المباعة (تقديري للعرض) */
    soldItemsCount: Math.max(0, Math.round(c.transactions * (6 + c.atv / 6))),
    /** الالتزام بالدوام (٪) تقديري للعرض */
    attendancePct: Math.max(0, Math.min(100, Math.round(72 + c.score * 0.35))),
    /** تقدير تجميعي من معدل الإلغاء والمعاملات (عرض توضيحي) */
    voidedItemsCount: Math.max(
      0,
      Math.round(c.transactions * (c.voidRate / 100) * 22),
    ),
    /** قيمة تقديرية للمواد الملغاة من المبيعات ومعدل الإلغاء */
    voidedValue: Math.max(0, Math.round(c.sales * (c.voidRate / 100) * 3.2)),
  }));
  const filteredCashiers = useMemo(
    () =>
      cashiers.filter((c) => {
        const okName =
          selectedEmployees.length === 0 || selectedEmployees.includes(c.name);
        const okShift = workShift === "all" || c.workShift === workShift;
        const okReturn =
          c.voidRate >= returnRateRange[0] && c.voidRate <= returnRateRange[1];
        return okName && okShift && okReturn;
      }),
    [selectedEmployees, workShift, returnRateRange, cashiers],
  );
  const trendOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis" as const,
        appendToBody: true,
        backgroundColor: "#1a2035",
        borderColor: "#1e293b",
        textStyle: { color: "#e2e8f0", fontSize: 11 },
        extraCssText:
          "z-index: 100002; box-shadow: 0 8px 30px rgba(0,0,0,0.35); border-radius: 10px;",
        formatter: (params: TrendTooltipParam | TrendTooltipParam[]) => {
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
                  <strong style="font-weight:700;">${fmtK(Number(item.value ?? 0))}</strong>
                </div>`,
            )
            .join("");

          return `
            <div style="display:flex; flex-direction:column; gap:8px; min-width:140px;">
              <div style="font-weight:700; color:#f8fafc;">${title}</div>
              ${rows}
            </div>`;
        },
      },
      legend: {
        data: filteredCashiers.map((c) => c.short),
        bottom: 2,
        itemGap: 12,
        textStyle: { color: palette.primaryGreen, fontSize: 8 },
        type: "scroll" as const,
        pageIconColor: palette.primaryGreen,
        pageTextStyle: { color: palette.primaryGreen },
      },
      grid: {
        bottom: "16%",
        top: "5%",
        left: "3%",
        right: "2%",
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: [...EMPLOYEE_TREND_MONTHS],
        axisLabel: { fontSize: 9, color: palette.primaryGreen, rotate: 30 },
        axisLine: { lineStyle: { color: palette.primarySlate } },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value" as const,
        name: "عدد الفواتير",
        nameLocation: "middle" as const,
        nameGap: 38,
        nameTextStyle: {
          color: "#64748b",
          fontSize: 10,
          fontWeight: 400,
        },
        axisLabel: {
          formatter: (v: number) => fmtK(v),
          fontSize: 9,
          color: "#64748b",
        },
        /** `show: true` is required or ChartCard `killSplit` strips split lines. */
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
      series: filteredCashiers.map((c, i) => ({
        name: c.short,
        type: "line" as const,
        smooth: true,
        showSymbol: false,
        data: c.trend,
        lineStyle: { color: trendColors[i % trendColors.length], width: 1.5 },
        itemStyle: { color: trendColors[i % trendColors.length] },
      })),
    }),
    [palette, trendColors, isDark, filteredCashiers],
  );
  return (
    <ChartCard
      title="اتجاه مبيعات الكاشيرات"
      titleFlag="green"
      subtitle="Sales trend per cashier — 12 months"
      option={trendOption}
      height="340px"
      delay={1}
    />
  );
};

export default CashierSalesTrends;
