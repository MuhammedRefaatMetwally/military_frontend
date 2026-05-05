import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import axiosInstance from "@/api/axiosInstance";
import { useFilterStore } from "@/store/filterStore";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/SkeletonLoader";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <Skeleton variant="chart" />,
  },
);

const salesYAxis = {
  type: "value" as const,
  name: "المبيعات",
  position: "left" as const,
  min: 0,
  axisLine: { show: true, onZero: false },
  axisTick: { show: true }, // ✅ ADD
  splitLine: { show: true }, // ✅ ADD
  axisLabel: {
    formatter: (v: number) => `${(v / 1000000).toFixed(1)}M`,
  },
  nameLocation: "end",
  nameGap: 12,
  gridIndex: 0,
};

const profitYAxis = {
  type: "value" as const,
  name: "الأرباح",
  position: "right" as const,
  min: 0,
  axisLine: { show: true, onZero: false },
  axisTick: { show: true }, // ✅ ADD
  splitLine: { show: false }, // ✅ prevent clutter
  axisLabel: {
    formatter: (v: number) => `${(v / 1000000).toFixed(1)}M`,
  },
  nameLocation: "end",
  nameGap: 12,
  gridIndex: 0,
};

type ChartLevel = "year" | "quarter" | "month";
type ChartIndicator = "both" | "sales" | "profit";

interface NetSalesProfitPoint {
  year: number;
  quarter: number | null;
  month: number | null;
  period_start: string;
  sales: number;
  profit: number;
}

interface NetSalesProfitApiResponse {
  level: ChartLevel;
  indicator: ChartIndicator;
  years: number[];
  period: number | null;
  data: NetSalesProfitPoint[];
}

interface FetchNetSalesProfitParams {
  year: number;
  regionIds: string[];
  branchIds: string[];
  group1Ids: string[];
  group2Ids: string[];
  group3Ids: string[];
  agreementId: string;
}

const toCsv = (items: string[]) => items.join(",");

const fetchNetSalesProfitChart = async ({
  year,
  regionIds,
  branchIds,
  group1Ids,
  group2Ids,
  group3Ids,
  agreementId,
}: FetchNetSalesProfitParams): Promise<NetSalesProfitApiResponse> => {
  const response = await axiosInstance.get<NetSalesProfitApiResponse>(
    "/api/datasorce/sales-analyses/net-sales-profit-chart",
    {
      params: {
        level: "year",
        years: year,
        indicator: "both",
        period: "",
        region: toCsv(regionIds),
        branch: toCsv(branchIds),
        group1: toCsv(group1Ids),
        group2: toCsv(group2Ids),
        group3: toCsv(group3Ids),
        agreement: agreementId,
      },
    },
  );

  return response.data;
};

const NetProfitAndSalesByDate = () => {
  const [drillSeriesMode, setDrillSeriesMode] = useState<
    "both" | "sales" | "profit"
  >("both");
  const [chartData, setChartData] = useState<NetSalesProfitPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const palette = useResolvedAnalyticsPalette();
  const year = useFilterStore((state) => state.year);
  const region = useFilterStore((state) => state.region);
  const activeBranches = useFilterStore((state) => state.activeBranches);
  const productCategory = useFilterStore((state) => state.productCategory);
  const subcategory = useFilterStore((state) => state.subcategory);
  const product = useFilterStore((state) => state.product);
  const agreement = useFilterStore((state) => state.agreement);

  useEffect(() => {
    const selectedYear = Number.parseInt(year, 10);
    const agreementId = agreement[0] || "79";

    if (Number.isNaN(selectedYear)) {
      setChartData([]);
      setIsLoading(false);
      setErrorMessage("سنة غير صالحة");
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setErrorMessage("");

    fetchNetSalesProfitChart({
      year: selectedYear,
      regionIds: region,
      branchIds: activeBranches,
      group1Ids: productCategory,
      group2Ids: subcategory,
      group3Ids: product,
      agreementId,
    })
      .then((result) => {
        if (cancelled) return;
        setChartData(result.data ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setChartData([]);
        setErrorMessage("تعذر تحميل بيانات المبيعات والأرباح");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year, region, activeBranches, productCategory, subcategory, product, agreement]);

  const drillData = useMemo(() => {
    const sorted = [...chartData].sort((a, b) => a.year - b.year);
    return {
      labels: sorted.map((item) => item.year.toString()),
      values: sorted.map((item) => item.sales),
      profits: sorted.map((item) => item.profit),
    };
  }, [chartData]);

  const profitLineSeries = {
    name: "الأرباح",
    type: "line" as const,
    yAxisIndex: drillSeriesMode === "both" ? 1 : 0,
    data: drillData.profits.map((v, i) => [i, v]),
    lineStyle: { color: palette.primaryCyan, width: 2.5 },
    itemStyle: { color: palette.primaryCyan, borderWidth: 2 },
    symbol: "circle" as const,
    symbolSize: 8,
    smooth: true,
    areaStyle: { color: "rgba(8,145,178,0.08)" },
  };

  const drillGrid = {
    left: "5%" as const,
    right: "6%" as const,
    top: "14%",
    bottom: "18%",
    containLabel: true,
  };

  const salesBarSeries = {
    name: "المبيعات",
    type: "bar" as const,
    data: drillData.values.map((v, i) => [i, v]),
    barWidth: 40,
    itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
  };
  const drillXAxis = { type: "category" as const, data: drillData.labels };
  const drillDownOption =
    drillSeriesMode === "both"
      ? {
          xAxis: drillXAxis,
          yAxis: [salesYAxis, profitYAxis],
          series: [salesBarSeries, profitLineSeries],
          legend: {
            data: ["المبيعات", "الأرباح"],
            bottom: 0,
            left: "center",
            itemGap: 12,
            textStyle: { color: "#94a3b8", fontSize: 11 },
          },
          grid: drillGrid,
        }
      : drillSeriesMode === "sales"
        ? {
            xAxis: drillXAxis,
            yAxis: salesYAxis,
            series: [salesBarSeries],
            legend: {
              data: ["المبيعات"],
              bottom: 0,
              left: "center",
              itemGap: 12,
              textStyle: { color: "#94a3b8", fontSize: 11 },
            },
            grid: drillGrid,
          }
        : {
            xAxis: drillXAxis,
            yAxis: profitYAxis,
            series: [profitLineSeries],
            legend: {
              data: ["الأرباح"],
              bottom: 0,
              left: "center",
              itemGap: 12,
              textStyle: { color: "#94a3b8", fontSize: 11 },
            },
            grid: drillGrid,
          };

  return (
    <ChartCard
      title="صافي الأرباح والمبيعات حسب التاريخ"
      subtitle={
        isLoading
          ? "جاري تحميل البيانات..."
          : errorMessage ||
            "البيانات مرتبطة بالفلاتر العامة (السنة، الإقليم، الفروع، المجموعات، الاتفاقية)"
      }
      titleFlag="green"
      titleFlagNumber={1}
      headerExtra={
        <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
          <div className="flex items-center gap-0.5 flex-wrap justify-end">
            <span
              className="text-[9px] shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              المؤشر:
            </span>
            {(
              [
                ["sales", "المبيعات"],
                ["profit", "الأرباح"],
                ["both", "كلاهما"],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDrillSeriesMode(mode)}
                className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
                style={{
                  background:
                    drillSeriesMode === mode
                      ? "rgba(14,165,233,0.15)"
                      : "var(--bg-elevated)",
                  color:
                    drillSeriesMode === mode
                      ? palette.primaryCyan
                      : "var(--text-muted)",
                  border: `1px solid ${drillSeriesMode === mode ? palette.primaryCyan : "var(--border-subtle)"}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      }
      option={drillDownOption}
      height="300px"
    />
  );
};

export default NetProfitAndSalesByDate;
