/* eslint-disable @typescript-eslint/no-unused-vars */
import { getProductData } from "@/lib/mockData";
import { useThemeStore } from "@/store/themeStore";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const products = getProductData();

/** Plot area max height; taller charts scroll inside the card (`ChartCard` `plotOverflowY="auto"`). */
const CHART_PLOT_MAX_HEIGHT_PX = 480;

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

const contrib = [
  { name: "دجاج محمد باريال", vol: 2.08, profit: 7.31 },
  { name: "دجاج سنحه نعمه", vol: 3.26, profit: 9.12 },
  { name: "أرز مضغوط نعم", vol: 2.54, profit: 6.84 },
  { name: "أرز هياتي من", vol: 3.02, profit: 8.25 },
  { name: "الفراولة شبكية حلو", vol: 1.59, profit: 5.2 },
  { name: "سامي حلانه شبكي", vol: 1.42, profit: 4.8 },
  { name: "دجاج حلانه", vol: 1.28, profit: 4.1 },
  { name: "صاج التصليح مصمح", vol: 1.15, profit: 3.9 },
  { name: "ريت بناء 12 ق", vol: 1.08, profit: 3.62 },
  { name: "الفراولة شعلي أسر", vol: 0.98, profit: 3.4 },
  { name: "الفراني شام أمو", vol: 0.88, profit: 2.95 },
  { name: "حليب مراعي 2.25", vol: 0.78, profit: 2.6 },
  { name: "الكشك حمص غال", vol: 0.65, profit: 2.1 },
  { name: "معجن ماكد مقلق", vol: 0.52, profit: 1.8 },
  { name: "زيت المنورة شريك", vol: 0.42, profit: 1.45 },
];

const SalesVolumeAndProfitsByProduct = () => {
  // فلاتر مخطط «حجم المبيعات و الأرباح حسب المنتج»
  const [contribG1, setContribG1] = useState<string | null>(null);
  const [contribG2, setContribG2] = useState<string | null>(null);
  const [contribProduct, setContribProduct] = useState<string | null>(null);

  // const contribProductOptions = useMemo(() => {
  //   const out = products
  //     .filter((p) => (contribG1 ? p.categoryAr === contribG1 : true))
  //     .filter((p) => (contribG2 ? p.subcategory === contribG2 : true))
  //     .map((p) => p.nameAr);
  //   return out;
  // }, [contribG1, contribG2]);
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  /** Same as ChartCard `hasBarSeries` cartesian enhancement (bar charts only get this automatically). */
  const barChartSpineColor = isDark ? "#64748b" : "#94a3b8";
  const barChartSplitLineColor = isDark
    ? "rgba(148,163,184,0.22)"
    : "rgba(100,116,139,0.3)";

  const productMetaByName = useMemo(() => {
    const map = new Map<string, { g1: string; g2: string }>();
    products.forEach((p) => {
      map.set(p.nameAr, {
        g1: String(p.categoryAr),
        g2: String(p.subcategory),
      });
    });
    return map;
  }, []);

  const contribFilteredSorted = useMemo(() => {
    const filtered = contrib.filter((r) => {
      const meta = productMetaByName.get(r.name);
      if (contribG1 && meta?.g1 !== contribG1) return false;
      if (contribG2 && meta?.g2 !== contribG2) return false;
      if (contribProduct && r.name !== contribProduct) return false;
      return true;
    });
    return [...filtered].sort((a, b) => a.profit - b.profit);
  }, [contribG1, contribG2, contribProduct, productMetaByName]);

  const productGroup1Options = useMemo(() => {
    const set = new Set(products.map((p) => String(p.categoryAr)));
    return Array.from(set);
  }, []);
  const productGroup2Options = useMemo(() => {
    const set = new Set(products.map((p) => String(p.subcategory)));
    return Array.from(set);
  }, []);

  const g1Options = useMemo(
    () => [
      { value: "all", label: "المجموعة الأولى" },
      ...productGroup1Options.map((o) => ({ value: o, label: o })),
    ],
    [productGroup1Options],
  );
  const g2Options = useMemo(
    () => [
      { value: "all", label: "المجموعة الثانية" },
      ...productGroup2Options.map((o) => ({ value: o, label: o })),
    ],
    [productGroup2Options],
  );

  const contribOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis" as const,
        formatter: (params: AxisTooltipParam | AxisTooltipParam[]) =>
          formatAxisTooltip(params),
      },
      legend: {
        data: ["% حجم المبيعات", "% مساهمة الربح"],
        bottom: 0,
        textStyle: { fontSize: 9 },
      },
      grid: {
        left: "3%",
        right: "4%",
        top: "0%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "value" as const,
        axisLabel: { formatter: "{value}%", fontSize: 9 },
        axisLine: {
          show: true,
          lineStyle: { width: 2, color: barChartSpineColor },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed" as const,
            color: barChartSplitLineColor,
            width: 1,
          },
        },
      },
      yAxis: {
        type: "category" as const,
        data: contribFilteredSorted.map((p) => p.name),
        axisLabel: { fontSize: 10 },
        axisLine: {
          show: true,
          lineStyle: { width: 2, color: barChartSpineColor },
        },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      series: [
        {
          name: "% حجم المبيعات",
          type: "bar" as const,
          stack: "total",
          barWidth: 12,
          barCategoryGap: "40%",
          data: contribFilteredSorted.map((p) => ({
            value: p.vol,
            itemStyle: { color: "#0891b2" },
          })),
          label: {
            show: true,
            position: "inside" as const,
            fontSize: 8,
            fontWeight: "bold",
            color: "#fff",
            formatter: (p: { value: number }) => `${p.value.toFixed(2)}%`,
          },
        },
        {
          name: "% مساهمة الربح",
          type: "bar" as const,
          stack: "total",
          barWidth: 12,
          data: contribFilteredSorted.map((p) => ({
            value: p.profit - p.vol,
            itemStyle: { color: "#047857", borderRadius: [0, 4, 4, 0] },
          })),
          label: {
            show: true,
            position: "right" as const,
            fontSize: 9,
            fontWeight: "bold",
            color: "#047857",
            formatter: (params: { dataIndex: number }) =>
              `${contribFilteredSorted[params.dataIndex].profit.toFixed(2)}%`,
          },
        },
      ],
    }),
    [barChartSpineColor, barChartSplitLineColor, contribFilteredSorted],
  );

  const contribScrollableHeightPx = useMemo(() => {
    const rowPx = 28;
    const headerPad = 140; // legend + margins
    return Math.max(
      CHART_PLOT_MAX_HEIGHT_PX,
      headerPad + contribFilteredSorted.length * rowPx,
    );
  }, [contribFilteredSorted.length]);
  return (
    <ChartCard
      title="حجم المبيعات و الأرباح حسب المنتج"
      titleFlag="green"
      subtitle="Sales Volume Contribution & Profit Contribution by Product %"
      option={contribOption}
      plotOverflowY="auto"
      innerChartHeight={`${contribScrollableHeightPx}px`}
      // headerExtra={
      //   <div className="mt-2 flex flex-col gap-2">
      //     <div className="flex flex-wrap items-center gap-2 text-[10px]">
      //       <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
      //         الفلاتر:
      //       </span>

      //       <Dropdown
      //         icon={Layers}
      //         label="المجموعة الأولى"
      //         value={contribG1 ?? "all"}
      //         options={g1Options}
      //         onChange={(v) => {
      //           setContribG1(v === "all" ? null : v);
      //           setContribProduct(null);
      //         }}
      //         accent="var(--accent-amber)"
      //       />

      //       <Dropdown
      //         icon={Layers}
      //         label="المجموعة الثانية"
      //         value={contribG2 ?? "all"}
      //         options={g2Options}
      //         onChange={(v) => {
      //           setContribG2(v === "all" ? null : v);
      //           setContribProduct(null);
      //         }}
      //         accent="#f59e0b"
      //       />

      //       <SearchDropdown
      //         icon={Package}
      //         label="المنتجات"
      //         value={contribProduct ?? ""}
      //         options={contribProductOptions}
      //         onChange={(v) => setContribProduct(v || null)}
      //         accent="#00d4ff"
      //       />
      //     </div>
      //   </div>
      // }
      className=""
      height={`${CHART_PLOT_MAX_HEIGHT_PX}px`}
      delay={1}
    />
  );
};

export default SalesVolumeAndProfitsByProduct;
