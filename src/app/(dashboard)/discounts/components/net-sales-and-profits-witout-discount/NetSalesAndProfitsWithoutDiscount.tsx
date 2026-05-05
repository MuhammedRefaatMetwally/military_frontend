import dynamic from "next/dynamic";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import {
  monthOptions,
  NetSalesAndProfitsWithoutDiscountProps,
  noDiscProfitFor,
  tcBranches,
} from "../../utils/data";
import { SearchDropdown } from "@/components/ui/SearchDropdown";
import { Search } from "lucide-react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

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

const NetSalesAndProfitsWithoutDiscount = ({
  tcLeftMonth,
  setTcLeftMonth,
  tcRightMonth,
  setTcRightMonth,
}: NetSalesAndProfitsWithoutDiscountProps) => {
  const palette = useResolvedAnalyticsPalette();

  const noDiscProfitByBranchOption = {
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: AxisTooltipParam | AxisTooltipParam[]) =>
        formatAxisTooltip(params),
    },
    legend: {
      data: [tcLeftMonth, tcRightMonth],
      bottom: 0,
      type: "scroll" as const,
      left: "center" as const,
      textStyle: { fontSize: 9, color: "var(--text-muted)" },
    },
    grid: { left: "8%", right: "4%", top: "12%", bottom: "18%" },
    xAxis: {
      type: "category" as const,
      data: tcBranches,
      axisLabel: { fontSize: 9, color: "#94a3b8" },
      axisLine: { lineStyle: { color: palette.primarySlate } },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        fontSize: 9,
        color: "#64748b",
      },
      splitLine: { lineStyle: { color: "#1e293b" } },
    },
    series: [
      {
        name: tcLeftMonth,
        type: "bar" as const,
        barWidth: 28,
        itemStyle: {
          color: "#047857",
          borderRadius: [4, 4, 0, 0],
        },
        data: tcBranches.map((br) => noDiscProfitFor(br, tcLeftMonth)),
      },
      {
        name: tcRightMonth,
        type: "bar" as const,
        barWidth: 28,
        itemStyle: {
          color: "#3b82f6",
          borderRadius: [4, 4, 0, 0],
        },
        data: tcBranches.map((br) => noDiscProfitFor(br, tcRightMonth)),
      },
    ],
  };
  return (
    <ChartCard
      title="صافي المبيعات و الأرباح بدون خصم"
      titleFlag="green"
      subtitle="قيمة الربح حسب الفرع والفترة"
      option={noDiscProfitByBranchOption}
      height="340px"
      delay={3}
      headerExtra={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <SearchDropdown
            icon={Search}
            label="الفترة اليسرى"
            value={tcLeftMonth}
            options={monthOptions}
            onChange={setTcLeftMonth}
            accent="#047857"
          />
          <SearchDropdown
            icon={Search}
            label="الفترة اليمنى"
            value={tcRightMonth}
            options={monthOptions}
            onChange={setTcRightMonth}
            accent="#3b82f6"
          />
        </div>
      }
    />
  );
};

export default NetSalesAndProfitsWithoutDiscount;
