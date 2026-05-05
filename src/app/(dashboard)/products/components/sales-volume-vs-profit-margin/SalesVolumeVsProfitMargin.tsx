import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { getProductData, ProductData } from "@/lib/mockData";
import { useThemeStore } from "@/store/themeStore";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { productsStandardGrid } from "../../utils/data";
import { Layers, Package } from "lucide-react";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { SearchDropdown } from "@/components/ui/SearchDropdown";
import { Dropdown } from "@/components/ui/Dropdown";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(2)}K` : String(n);
const products = getProductData();

const SalesVolumeVsProfitMargin = () => {
  const [selectedG1, setSelectedG1] = useState<string | null>(null);
  const [selectedG2, setSelectedG2] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  /** عندما يتم اختيار منتج: يمكن تصفية المجموعة الثالثة عبر الشرائح */
  const [selectedG3, setSelectedG3] = useState<string[]>([]);

  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  const barChartSplitLineColor = isDark
    ? "rgba(148,163,184,0.22)"
    : "rgba(100,116,139,0.3)";
  /** Same as ChartCard `hasBarSeries` cartesian enhancement (bar charts only get this automatically). */
  const barChartSpineColor = isDark ? "#64748b" : "#94a3b8";
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
    ],
    [palette],
  );

  const productRowsForScatter = useMemo(() => {
    const toG3 = (trend: ProductData["trend"]) =>
      trend === "up" ? "مرتفع" : trend === "stable" ? "متوسط" : "منخفض";

    return products
      .filter((p) => (selectedG1 ? p.categoryAr === selectedG1 : true))
      .filter((p) => (selectedG2 ? p.subcategory === selectedG2 : true))
      .filter((p) => (selectedProduct ? p.nameAr === selectedProduct : true))
      .filter((p) => {
        if (!selectedProduct) return true;
        if (selectedG3.length === 0) return true;
        return selectedG3.includes(toG3(p.trend));
      })
      .map((p) => ({
        key: p.id,
        nameAr: p.nameAr,
        volume: p.unitsSold,
        margin: p.margin,
        g1: p.categoryAr,
        g2: p.subcategory,
        g3: toG3(p.trend),
      }));
  }, [selectedG1, selectedG2, selectedProduct, selectedG3]);

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

  const productGroup3Options = useMemo(() => ["مرتفع", "متوسط", "منخفض"], []);
  const productGroup3MultiOptions = useMemo(
    () => [
      { value: "all", label: "المجموعة الثالثة" },
      ...productGroup3Options.map((o) => ({ value: o, label: o })),
    ],
    [productGroup3Options],
  );

  const scatterOption = {
    tooltip: {
      trigger: "item" as const,
      formatter: (p: { data: [number, number, string] }) =>
        `<b>${p.data[2]}</b><br/>الحجم: ${fmtK(p.data[0])}<br/>الهامش: ${p.data[1]}%`,
    },
    xAxis: {
      name: "حجم المبيعات",
      type: "value" as const,
      nameLocation: "middle" as const,
      nameGap: 32,
      nameTextStyle: { fontSize: 9 },
      axisLabel: { formatter: (v: number) => fmtK(v), fontSize: 9 },
      axisTick: { show: false },
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
      name: "هامش الربح %",
      type: "value" as const,
      nameLocation: "middle" as const,
      nameGap: 40,
      nameTextStyle: { fontSize: 9 },
      axisLabel: { formatter: "{value}%", fontSize: 9 },
      axisTick: { show: false },
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
    series: [
      {
        type: "scatter",
        symbolSize: (d: number[]) => Math.max(14, Math.sqrt(d[0] / 600)),
        data: productRowsForScatter.map((p) => [p.volume, p.margin, p.nameAr]),
        itemStyle: {
          color: (p: { dataIndex: number }) =>
            catColors[p.dataIndex % catColors.length],
          opacity: 0.85,
          borderWidth: 0,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            formatter: (p: { data: (number | string)[] }) =>
              String(p.data[2]).split(/[ ،]/)[0],
            fontSize: 9,

            position: "top" as const,
          },
        },
      },
    ],
    grid: { ...productsStandardGrid, left: "6%" },
  };

  return (
    <ChartCard
      title="حجم المبيعات مقابل هامش الربح"
      titleFlag="green"
      subtitle="Product Volume & % Profit Margin by Category"
      option={scatterOption}
      headerExtra={
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
              الفلاتر:
            </span>

            <Dropdown
              icon={Layers}
              label="المجموعة الأولى"
              value={selectedG1 ?? "all"}
              options={g1Options}
              onChange={(v) => {
                const next = v === "all" ? null : v;
                setSelectedG1(next);
                setSelectedProduct(null);
                setSelectedG3([]);
              }}
              accent="var(--accent-amber)"
            />

            <Dropdown
              icon={Layers}
              label="المجموعة الثانية"
              value={selectedG2 ?? "all"}
              options={g2Options}
              onChange={(v) => {
                const next = v === "all" ? null : v;
                setSelectedG2(next);
                setSelectedProduct(null);
                setSelectedG3([]);
              }}
              accent="#f59e0b"
            />

            <SearchDropdown
              icon={Package}
              label="المنتجات"
              value={selectedProduct ?? ""}
              options={products.map((p) => p.nameAr)}
              onChange={(v) => {
                setSelectedProduct(v || null);
                setSelectedG3([]);
              }}
              accent="#00d4ff"
            />
          </div>

          {selectedProduct && (
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <MultiSelectDropdown
                icon={Layers}
                label="المجموعة الثالثة"
                selectedValues={selectedG3}
                options={productGroup3MultiOptions}
                onChange={setSelectedG3}
                accent="#ea580c"
                manyLabel={(n) => `${n} اختيارات`}
              />
            </div>
          )}
        </div>
      }
      className=""
      height="320px"
      delay={2}
    />
  );
};

export default SalesVolumeVsProfitMargin;
