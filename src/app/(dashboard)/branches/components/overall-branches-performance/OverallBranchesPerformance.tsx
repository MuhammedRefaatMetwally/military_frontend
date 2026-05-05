import { useMemo, useState } from "react";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import {
  BRANCH_PERF_BIMONTH_LABELS,
  BRANCH_PERF_QUARTER_LABELS,
  branchPerfPeriodScore,
  branchScores,
} from "../utils/branchScores";
import ChartCard from "@/components/ui/chart-card/ChartCard";

const OverallBranchesPerformance = () => {
  const palette = useResolvedAnalyticsPalette();

  const [branchPerfGranularity, setBranchPerfGranularity] = useState<
    "year" | "quarter" | "bimonth"
  >("year");
  const branchPerfOption = useMemo(() => {
    const perfGreen = palette.primaryGreen;
    const perfRed = palette.primaryRed;
    const byScore = (score: number) => (score >= 55 ? perfGreen : perfRed);
    const byBranch = (bi: number) => (bi % 2 === 0 ? perfGreen : perfRed);

    const shortName = (b: (typeof branchScores)[0]) =>
      b.name.split(" ").slice(0, 2).join(" ");
    if (branchPerfGranularity === "year") {
      const rotate = branchScores.length > 4 ? 30 : 0;
      return {
        tooltip: { trigger: "item" as const, formatter: "{b}: {c}%" },
        xAxis: {
          type: "category" as const,
          data: branchScores.map(shortName),
          boundaryGap: true,
          axisTick: { alignWithLabel: true },
          axisLabel: {
            rotate,
            fontSize: 10,
            align: "center",
            verticalAlign: "middle",
            margin: rotate ? 14 : 10,
            interval: 0,
          },
        },
        yAxis: {
          type: "value" as const,
          max: 100,
          axisLabel: { formatter: "{value}%" },
        },
        series: [
          {
            type: "bar" as const,
            data: branchScores.map((b) => ({
              value: b.score,
              itemStyle: {
                color: byScore(b.score),
                borderRadius: [4, 4, 0, 0],
              },
              label: {
                show: true,
                position: "top",
                formatter: `${b.score}%`,
                color: byScore(b.score),
                fontSize: 11,
                fontWeight: "bold",
              },
            })),
            barWidth: Math.max(16, Math.min(36, 200 / branchScores.length)),
          },
        ],
        grid: {
          top: rotate ? "2%" : "16%",
          bottom: rotate ? "2%" : "16%",
          left: "3%",
          right: "3%",
          containLabel: true,
        },
      };
    }
    const multiGrid = {
      bottom: "24%",
      top: "8%",
      left: "3%",
      right: "3%",
      containLabel: true,
    };
    const multiTooltip = {
      trigger: "axis" as const,
      formatter: (params: { seriesName: string; value: number }[]) =>
        params.map((p) => `${p.seriesName}: <b>${p.value}%</b>`).join("<br/>"),
    };
    const multiLegend = {
      data: branchScores.map((b) => b.name),
      bottom: 0,
      textStyle: { fontSize: 8 },
      type: "scroll" as const,
    };
    const multiY = {
      type: "value" as const,
      max: 100,
      axisLabel: { formatter: "{value}%", fontSize: 9 },
    };
    if (branchPerfGranularity === "quarter") {
      const n = BRANCH_PERF_QUARTER_LABELS.length;
      return {
        tooltip: multiTooltip,
        legend: multiLegend,
        grid: multiGrid,
        xAxis: {
          type: "category" as const,
          data: [...BRANCH_PERF_QUARTER_LABELS],
          axisLabel: { fontSize: 9 },
        },
        yAxis: multiY,
        series: branchScores.map((b, bi) => ({
          name: b.name,
          type: "bar" as const,
          itemStyle: { color: byBranch(bi) },
          barMaxWidth: 8,
          data: Array.from({ length: n }, (_, qi) => {
            const v = branchPerfPeriodScore(b.score, bi, qi, n);
            return {
              value: v,
              itemStyle: {
                color: byBranch(bi),
                borderRadius: [2, 2, 0, 0],
              },
            };
          }),
        })),
        dataZoom: [{ type: "inside" as const }],
      };
    }
    const n = BRANCH_PERF_BIMONTH_LABELS.length;
    return {
      tooltip: multiTooltip,
      legend: multiLegend,
      grid: { ...multiGrid, bottom: "26%" },
      xAxis: {
        type: "category" as const,
        data: [...BRANCH_PERF_BIMONTH_LABELS],
        boundaryGap: true,
        axisTick: { alignWithLabel: true },
        axisLabel: {
          rotate: 28,
          fontSize: 8,
          align: "center",
          verticalAlign: "middle",
          margin: 16,
          interval: 0,
        },
      },
      yAxis: multiY,
      series: branchScores.map((b, bi) => ({
        name: b.name,
        type: "bar" as const,
        itemStyle: { color: byBranch(bi) },
        barMaxWidth: 6,
        data: Array.from({ length: n }, (_, mi) => {
          const v = branchPerfPeriodScore(b.score, bi, mi, n);
          return {
            value: v,
            itemStyle: {
              color: byBranch(bi),
              borderRadius: [2, 2, 0, 0],
            },
          };
        }),
      })),
      dataZoom: [{ type: "inside" as const }],
    };
  }, [branchPerfGranularity, palette.primaryGreen, palette.primaryRed]);
  return (
    <div className="glass-panel overflow-hidden">
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <ChartTitleFlagBadge flag="green" size="sm" />
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              أداء الفروع الكلية
            </h3>
          </div>
          <div
            className="flex flex-wrap items-center gap-1 shrink-0"
            role="group"
            aria-label="دقة عرض الرسم"
          >
            {[
              { id: "year" as const, label: "سنوي" },
              { id: "quarter" as const, label: "ربع سنوي" },
              { id: "bimonth" as const, label: "شهري" },
            ].map((t) => {
              const active = branchPerfGranularity === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setBranchPerfGranularity(t.id)}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-md border transition-colors"
                  style={{
                    borderColor: "var(--border-subtle)",
                    background: active
                      ? "rgba(37, 99, 235, 0.12)"
                      : "transparent",
                    color: active ? "var(--accent-blue)" : "var(--text-muted)",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        <div
          className="flex flex-wrap items-center gap-3 mt-1 text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          <span>درجة أداء الفروع</span>
          {branchScores.map((b) => (
            <span
              key={b.id}
              className="font-semibold"
              style={{
                color:
                  b.score >= 55 ? palette.primaryGreen : palette.primaryRed,
              }}
            >
              {b.score}%
            </span>
          ))}
          <div className="flex items-center gap-1">
            <div
              style={{
                background:
                  "linear-gradient(to right, var(--accent-red), var(--accent-green))",
              }}
              className="w-12 h-2 rounded-full"
            />
            <span>&lt;55% → ≥55%</span>
          </div>
          {branchPerfGranularity === "quarter" && (
            <span className="text-[9px] opacity-90">
              المحور: الأرباع — مفتاح الألوان: الفروع
            </span>
          )}
          {branchPerfGranularity === "bimonth" && (
            <span className="text-[9px] opacity-90">
              المحور: أزواج أشهر — مفتاح الألوان: الفروع
            </span>
          )}
        </div>
      </div>
      <ChartCard
        key={branchPerfGranularity}
        title=""
        option={branchPerfOption as Record<string, unknown>}
        height={branchPerfGranularity === "year" ? "280px" : "320px"}
      />
    </div>
  );
};

export default OverallBranchesPerformance;
