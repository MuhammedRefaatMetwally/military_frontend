import ChartCard from "@/components/ui/chart-card/ChartCard";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import React, { useMemo } from "react";
import { branchScores, getBarColor } from "../utils/branchScores";
import { BRANCH_KEYS, categoryScores } from "./utils/data";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import { ChevronDown, ChevronLeft } from "lucide-react";

interface ProductCategoryPerformanceByBranchProps {
  expandedCats: Record<string, boolean>;
  setExpandedCats: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

const ProductCategoryPerformanceByBranch = ({
  expandedCats,
  setExpandedCats,
}: ProductCategoryPerformanceByBranchProps) => {
  const palette = useResolvedAnalyticsPalette();
  const maxVisibleXAxisItems = 9;

  const branchChartColors = useMemo(
    () =>
      [
        palette.primaryGreen,
        palette.primaryCyan,
        palette.primaryBlue,
        palette.primaryPurple,
        palette.primaryAmber,
        palette.primaryRed,
        "#0891b2",
        "#d97706",
      ] as const,
    [palette],
  );

  // ── أداء فئات المنتجات (مجمّع لكل الفروع) ──
  const categoryPerfOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis" as const,
        formatter: (params: { seriesName: string; value: number }[]) =>
          params
            .map((p) => `${p.seriesName}: <b>${p.value}%</b>`)
            .join("<br/>"),
      },
      legend: {
        show: true,
      },
      grid: {
        bottom: "22%",
        top: "8%",
        left: "3%",
        right: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: categoryScores.map((c) => c.cat),
        axisLabel: { interval: 0, rotate: 25, fontSize: 9 },
      },
      yAxis: {
        type: "value" as const,
        max: 100,
        axisLabel: { formatter: "{value}%", fontSize: 9 },
      },
      series: branchScores.map((b, bi) => ({
        name: b.name,
        type: "bar",
        barMaxWidth: 12,
        data: categoryScores.map((c) => {
          const val =
            (c as unknown as Record<string, number>)[BRANCH_KEYS[bi]] ?? 0;
          return {
            value: val,
            itemStyle: {
              color: branchChartColors[bi],
              borderRadius: [3, 3, 0, 0],
              opacity:
                val >= 70 ? 1 : val >= 50 ? 0.85 : val >= 30 ? 0.7 : 0.55,
            },
          };
        }),
      })),
    }),
    [branchChartColors],
  );

  const chartWidth = useMemo(() => {
    const ratio = categoryScores.length / maxVisibleXAxisItems;
    return `${Math.max(100, ratio * 100)}%`;
  }, [maxVisibleXAxisItems]);

  return (
    <div className="glass-panel overflow-visible">
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <ChartTitleFlagBadge flag="green" size="sm" />
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            أداء فئات المنتجات حسب الفروع
          </h3>
        </div>
        <div className="flex items-center gap-4 mt-1 text-[10px]">
          <span style={{ color: "var(--text-muted)" }}>
            درجة أداء فئات المنتجات
          </span>
          <span
            className="font-semibold"
            style={{ color: "var(--accent-red)" }}
          >
            20%
          </span>
          <div
            className="w-16 h-2 rounded-full"
            style={{
              background: `linear-gradient(to right, var(--accent-red), var(--accent-amber), var(--accent-green))`,
            }}
          />
          <span
            className="font-semibold"
            style={{ color: "var(--accent-green)" }}
          >
            90%
          </span>
          <span style={{ color: "var(--text-muted)" }}>55%</span>
        </div>
      </div>
      <ChartCard
        title=""
        option={categoryPerfOption}
        height="320px"
        width={chartWidth}
        scrollViewportDir="ltr"
      />

      {/* جدول تفصيلي للفئات */}
      {/* <div className="px-5 pb-3">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px]">
          {branchScores.map((branch, branchIndex) => (
            <div key={branch.id} className="flex items-center gap-1">
              <span
                className="inline-block rounded-[3px] shrink-0"
                style={{
                  width: 12,
                  height: 8,
                  background: branchChartColors[branchIndex],
                }}
              />
              <span style={{ color: "var(--text-muted)" }}>{branch.name}</span>
            </div>
          ))}
        </div>
      </div> */}

      <div className="px-5 pb-4 overflow-x-auto">
        <AnalyticsTable
          headers={[
            { label: "الفئة", align: "right", width: "120px" },
            ...branchScores.map((b) => ({
              label: b.name.split(" ").slice(0, 2).join(" "),
              align: "center" as const,
              width: "88px" as const,
            })),
          ]}
          minWidth={Math.max(560, 120 + branchScores.length * 88)}
        >
          {categoryScores.map((c) => {
            const row = c as unknown as Record<string, number | string>;
            const isOpen = expandedCats[c.cat];
            const hasSubs = c.subs && c.subs.length > 0;
            return (
              <React.Fragment key={c.cat}>
                <tr
                  className={
                    hasSubs
                      ? "cursor-pointer hover:bg-white/1.5 transition-colors"
                      : undefined
                  }
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  onClick={() =>
                    hasSubs &&
                    setExpandedCats((p) => ({ ...p, [c.cat]: !p[c.cat] }))
                  }
                >
                  <td
                    style={{
                      ...analyticsTdBaseStyle("right"),
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      {hasSubs && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            width: 14,
                            height: 14,
                            borderRadius: 3,
                            background: isOpen
                              ? "rgba(37,99,235,0.12)"
                              : "var(--bg-elevated)",
                          }}
                        >
                          {isOpen ? (
                            <ChevronDown
                              size={10}
                              style={{ color: "var(--accent-blue)" }}
                            />
                          ) : (
                            <ChevronLeft
                              size={10}
                              style={{ color: "var(--text-muted)" }}
                            />
                          )}
                        </span>
                      )}
                      {c.cat}
                    </div>
                  </td>
                  {branchScores.map((b, bi) => {
                    const val = Number(row[`b${bi + 1}`]) || 0;
                    return (
                      <AnalyticsBarCell
                        key={b.id}
                        value={val}
                        max={100}
                        color={getBarColor(val)}
                        text={`${val}%`}
                      />
                    );
                  })}
                </tr>
                {isOpen &&
                  c.subs?.map((sub) => (
                    <tr
                      key={sub.name}
                      style={{
                        background: "rgba(8,145,178,0.02)",
                        borderBottom: "1px solid var(--border-subtle)",
                      }}
                    >
                      <td
                        style={{
                          ...analyticsTdBaseStyle("right"),
                          paddingRight: "28px",
                          fontSize: 10,
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--text-muted)",
                            marginLeft: 4,
                          }}
                        >
                          └
                        </span>{" "}
                        {sub.name}
                      </td>
                      {branchScores.map((b, bi) => {
                        const val =
                          Number(
                            (sub as unknown as Record<string, number>)[
                              `b${bi + 1}akusdkabsdsabd`
                            ],
                          ) || 0;
                        return (
                          <AnalyticsBarCell
                            key={b.id}
                            value={val}
                            max={100}
                            color={getBarColor(val)}
                            text={`${val}%`}
                          />
                        );
                      })}
                    </tr>
                  ))}
              </React.Fragment>
            );
          })}
        </AnalyticsTable>
      </div>
    </div>
  );
};

export default ProductCategoryPerformanceByBranch;
