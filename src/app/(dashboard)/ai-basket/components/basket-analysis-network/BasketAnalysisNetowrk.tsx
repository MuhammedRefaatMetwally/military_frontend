import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
import { type ReactElement, useMemo } from "react";
import { rules } from "../../utils/rules";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const MAX_NETWORK_RULES = 1000;
const CHART_VIEWPORT_HEIGHT = "calc(100vh - 152px)";
const CHART_CANVAS_HEIGHT = "100%";
const CHART_CANVAS_WIDTH = "100%";

const splitBasket = (basket: string) => basket.split(/\s*\u2192\s*/u);

const topRules = [...rules]
  .sort((a, b) => b.support - a.support)
  .slice(0, MAX_NETWORK_RULES);

const BasketAnalysisNetowrk = (): ReactElement => {
  const palette = useResolvedAnalyticsPalette();

  const networkOption = useMemo(() => {
    const colorPool = [
      palette.primaryBlue,
      palette.primaryGreen,
      palette.primaryCyan,
      palette.primaryPurple,
      palette.primaryAmber,
      palette.primaryRed,
      palette.primarySlate,
    ] as const;

    const productStats = new Map<
      string,
      {
        degree: number;
        totalSupport: number;
        maxLift: number;
      }
    >();

    topRules.forEach((rule) => {
      const [sourceRaw, targetRaw] = splitBasket(rule.basket);
      const source = sourceRaw?.trim();
      const target = targetRaw?.trim();
      if (!source || !target) return;

      [source, target].forEach((product) => {
        const current = productStats.get(product) ?? {
          degree: 0,
          totalSupport: 0,
          maxLift: 0,
        };

        productStats.set(product, {
          degree: current.degree + 1,
          totalSupport: current.totalSupport + rule.support,
          maxLift: Math.max(current.maxLift, rule.lift),
        });
      });
    });

    const nodes = Array.from(productStats.entries()).map(
      ([product, stats], index) => {
        const color = colorPool[index % colorPool.length];

        return {
          id: product,
          name: product,
          value: Number((stats.totalSupport * 100).toFixed(2)),
          symbolSize: Math.min(
            36,
            12 + stats.degree * 1.6 + Math.min(stats.totalSupport * 18, 8),
          ),
          itemStyle: {
            color,
            borderColor: "#ffffff",
            borderWidth: 2,
            shadowBlur: 12,
            shadowColor: `${color}44`,
          },
          label: {
            show: stats.degree >= 3 || stats.totalSupport >= 0.18,
            position: "right" as const,
            fontSize: 10,
            color: "#475569",
            distance: 3,
          },
          tooltip: {
            formatter: [
              `<b>${product}</b>`,
              `عدد الروابط: ${stats.degree}`,
              `إجمالي الدعم: ${(stats.totalSupport * 100).toFixed(1)}%`,
              `أعلى رفع: ${stats.maxLift.toFixed(2)}`,
            ].join("<br/>"),
          },
        };
      },
    );

    const links = topRules
      .map((rule) => {
        const [sourceRaw, targetRaw] = splitBasket(rule.basket);
        const source = sourceRaw?.trim();
        const target = targetRaw?.trim();
        if (!source || !target) return null;

        return {
          source,
          target,
          value: rule.lift,
          lineStyle: {
            width: 0.4 + Math.min(rule.lift * 0.55, 2.1),
            color: "rgba(148,163,184,0.22)",
            opacity: 0.44,
            curveness: 0.08,
          },
          tooltip: {
            formatter: [
              `<b>${source}</b> → <b>${target}</b>`,
              `الدعم: ${(rule.support * 100).toFixed(1)}%`,
              `الرفع: ${rule.lift.toFixed(2)}`,
            ].join("<br/>"),
          },
        };
      })
      .filter(Boolean);

    return {
      xAxis: { show: false },
      yAxis: { show: false },
      tooltip: {
        formatter: (params: {
          dataType?: string;
          data?: { tooltip?: { formatter?: string } };
        }) => params.data?.tooltip?.formatter,
      },
      animation: false,
      series: [
        {
          type: "graph" as const,
          layout: "force" as const,
          left: "2%",
          right: "2%",
          top: "0.5%",
          bottom: "0.5%",
          roam: true,
          draggable: false,
          data: nodes,
          links,
          center: ["50%", "51%"],
          zoom: 0.18,
          scaleLimit: {
            min: 0.08,
            max: 2,
          },
          force: {
            repulsion: 162,
            gravity: 0.06,
            edgeLength: [36, 124],
            friction: 0.08,
            layoutAnimation: false,
          },
          emphasis: {
            focus: "adjacency" as const,
            lineStyle: {
              width: 2.4,
              color: palette.primaryCyan,
            },
          },
          edgeSymbol: ["none", "none"] as const,
          edgeLabel: { show: false },
          labelLayout: { hideOverlap: true },
        },
      ],
    };
  }, [palette]);

  return (
    <ChartCard
      title="شبكة تحليل السلة"
      subtitle="شبكة ترابط المنتجات داخل السلة باستخدام قواعد الدعم والرفع"
      option={networkOption}
      height={CHART_VIEWPORT_HEIGHT}
      innerChartHeight={CHART_CANVAS_HEIGHT}
      width={CHART_CANVAS_WIDTH}
      plotOverflowY="hidden"
      scrollViewportDir="ltr"
      aiPowered
      delay={3}
    />
  );
};

export default BasketAnalysisNetowrk;
