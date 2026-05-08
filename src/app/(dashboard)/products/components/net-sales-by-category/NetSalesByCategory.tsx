import dynamic from "next/dynamic";
import { productsStandardGrid } from "../../utils/data";
import { useMemo } from "react";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useNetSalesByCategory } from "@/hooks/useProductAnalysis";
import { useFilterStore } from "@/store/filterStore";
import { ChartErrorBoundary } from "../chartErrorBoundary";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  { ssr: false, loading: () => <div style={{ height: 320 }} /> },
);

// ─────────────────────────────────────────────────────────────────────────────
// Real API: /api/products-analysis/net-sales-by-category
//
// Query params (actual names the backend expects):
//   group_level  = 1 | 2 | 3          (required — which hierarchy level to show)
//   region       = <id>                (single region id)
//   branch       = <id,id,...>         (CSV of branch ids)
//   group1       = <id,id,...>         (CSV — filter by G1)
//   group2       = <id,id,...>         (CSV — filter by G2)
//   group3       = <id,id,...>         (CSV — filter by G3)
//   year         = 2017,2018           (CSV of years)
//   quarter      = 1                   (single quarter number)
//   month        = 1                   (single month number)
//   from_date    = YYYY-MM-DD
//   to_date      = YYYY-MM-DD
//
// The TypeScript hook params (NetSalesByCategoryParams from Doc 3) map to
// these as: groupLevel→group_level, regionId→region, branchIds→branch (CSV),
// group1Ids→group1 (CSV), years→year (CSV), quarter→quarter[0], etc.
// We trust the API layer serialises arrays to CSV correctly.
// ─────────────────────────────────────────────────────────────────────────────

const NetSalesByCategory = () => {
  const palette = useResolvedAnalyticsPalette();

  // ── Store slices ────────────────────────────────────────────────────────────
  const year               = useFilterStore((s) => s.year);
  const quarter            = useFilterStore((s) => s.quarter);
  const month              = useFilterStore((s) => s.month);
  const region             = useFilterStore((s) => s.region);      // string[]
  const activeBranches     = useFilterStore((s) => s.activeBranches); // string[]
  const productCategory    = useFilterStore((s) => s.productCategory); // G1 ids
  const subcategory        = useFilterStore((s) => s.subcategory);     // G2 ids
  const product            = useFilterStore((s) => s.product);         // G3 ids
  const isDateRangeApplied = useFilterStore((s) => s.isDateRangeApplied);
  const dateRangeFrom      = useFilterStore((s) => s.dateRangeFrom);
  const dateRangeTo        = useFilterStore((s) => s.dateRangeTo);

  const useRange = isDateRangeApplied && !!dateRangeFrom && !!dateRangeTo;

  // ── Hook call ───────────────────────────────────────────────────────────────
  // groupLevel=1 → shows G1 rows (top-level bars).
  // Bump to 2/3 if G1/G2 are selected so the chart drills automatically.
  const groupLevel = productCategory.length
    ? subcategory.length ? 3 : 2
    : 1;

  const { data, isLoading, error, refetch } = useNetSalesByCategory({
    // ✅ group_level — required, drives which level the API aggregates at
    groupLevel,

    // ✅ Date — from_date/to_date take priority over year/quarter/month
    ...(useRange
      ? { fromDate: dateRangeFrom, toDate: dateRangeTo }
      : {
          // API: year=2017,2018 (CSV) — pass as number array; API layer serialises
          years:   year    ? [Number(year)]    : undefined,
          // API: quarter=1 (single value) — pass first element
          quarter: quarter ? [Number(quarter)] : undefined,
          // API: month=1 (single value)
          month:   month   ? [Number(month)]   : undefined,
        }),

    // ✅ Geography
    // API: region=<single id> — pass only when exactly one region is active
    regionId:  region.length ? region[0] : undefined,
    // API: branch=51,52,53 (CSV)
    branchIds: activeBranches.length ? activeBranches : undefined,

    // ✅ Product hierarchy — API: group1=29,30 (CSV)
    group1Ids: productCategory.length ? productCategory : undefined,
    group2Ids: subcategory.length     ? subcategory     : undefined,
    group3Ids: product.length         ? product         : undefined,
  });

  // ── Chart data ──────────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    if (!data?.data?.length) return [];
    // Sort descending by net_sales so tallest bar is first
    return [...data.data]
      .sort((a, b) => b.net_sales - a.net_sales)
      .map((item) => ({ name: item.name, netSales: item.net_sales }));
  }, [data]);

  const catColors = useMemo(() => [
    palette.primaryGreen, palette.primaryCyan, palette.primaryBlue,
    palette.primaryIndigo, palette.primaryAmber, palette.primaryRed,
    "#0d9488", "#059669",
  ], [palette]);

  // ── ECharts option ──────────────────────────────────────────────────────────
  const salesByCatOption = useMemo(() => ({
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0];
        if (!p) return "";
        return `${p.name}<br/>${(p.value / 1_000_000).toFixed(1)}M`;
      },
    },
    grid: { ...productsStandardGrid, bottom: "0" },
    xAxis: {
      type: "category" as const,
      data: categories.map((c) => c.name),
      axisLabel: { rotate: 28, fontSize: 9, interval: 0 },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        // ✅ values can be in billions — format sensibly
        formatter: (v: number) => {
          if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
          if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(0)}M`;
          if (v >= 1_000)         return `${(v / 1_000).toFixed(0)}K`;
          return String(v);
        },
        fontSize: 9,
      },
    },
    series: [
      {
        type: "bar",
        barMaxWidth: 44,
        data: categories.map((c, i) => ({
          value: c.netSales,
          itemStyle: {
            color: catColors[i % catColors.length],
            borderRadius: [6, 6, 0, 0],
          },
          label: {
            show: true,
            position: "top" as const,
            fontSize: 9,
            fontWeight: "bold",
            color: catColors[i % catColors.length],
            formatter: (p: { value: number }) => {
              const v = p.value;
              if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
              if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
              return `${(v / 1_000).toFixed(1)}K`;
            },
          },
        })),
      },
    ],
  }), [categories, catColors]);

  return (
    <ChartErrorBoundary
      title="صافي المبيعات حسب الفئة"
      subtitle="Net Sales by Category"
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
      height="320px"
      titleFlag="green"
      delay={1}
    >
      <ChartCard
        title="صافي المبيعات حسب الفئة"
        titleFlag="green"
        subtitle="Net Sales by Category"
        option={salesByCatOption}
        height="320px"
        delay={1}
      />
    </ChartErrorBoundary>
  );
};

export default NetSalesByCategory;