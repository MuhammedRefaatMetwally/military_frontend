import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { rules } from "../../utils/rules";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const MAX_NETWORK_RULES = 1000;
const CHART_VIEWPORT_HEIGHT = "calc(100vh - 156px)";
const CHART_CANVAS_HEIGHT = "100%";
const CHART_CANVAS_WIDTH = "100%";

const GRAPH_WIDTH = 1440;
const GRAPH_HEIGHT = 760;
const GRAPH_CENTER_X = GRAPH_WIDTH / 2;
const GRAPH_CENTER_Y = GRAPH_HEIGHT / 2;
const ELLIPSE_OUTER_RX = 610;
const ELLIPSE_OUTER_RY = 320;
const ELLIPSE_INNER_RX = 168;
const ELLIPSE_INNER_RY = 104;
const ELLIPSE_RINGS = 6;
const ELLIPSE_RING_SPAN = ELLIPSE_RINGS - 1;

const splitBasket = (basket: string) => basket.split(/\s*\u2192\s*/u);

const topRulesByLift = [...rules]
  .sort((a, b) => b.lift - a.lift)
  .slice(0, MAX_NETWORK_RULES);

const ProductsLinkNetwork = () => {
  const palette = useResolvedAnalyticsPalette();

  const nodePalette = useMemo(
    () =>
      [
        palette.primaryBlue,
        palette.primaryGreen,
        palette.primaryCyan,
        palette.primaryPurple,
        palette.primaryAmber,
        palette.primaryRed,
      ] as const,
    [palette],
  );

  const associationNetworkOption = useMemo(() => {
    const productStats = new Map<
      string,
      {
        count: number;
        maxLift: number;
        links: string[];
      }
    >();

    topRulesByLift.forEach((rule) => {
      const [sourceRaw, targetRaw] = splitBasket(rule.basket);
      const products = [sourceRaw?.trim(), targetRaw?.trim()].filter(
        (value): value is string => Boolean(value),
      );

      products.forEach((product) => {
        const current = productStats.get(product) ?? {
          count: 0,
          maxLift: 0,
          links: [],
        };

        productStats.set(product, {
          count: current.count + 1,
          maxLift: Math.max(current.maxLift, rule.lift),
          links: [...current.links, rule.basket],
        });
      });
    });

    const rankedProducts = Array.from(productStats.entries())
      .map(([product, stats]) => ({ product, stats }))
      .sort((a, b) => {
        if (b.stats.maxLift !== a.stats.maxLift) {
          return b.stats.maxLift - a.stats.maxLift;
        }

        return b.stats.count - a.stats.count;
      });

    const ringCapacity = Array.from({ length: ELLIPSE_RINGS }, (_, ring) =>
      Math.max(
        18,
        Math.round(
          (rankedProducts.length / ELLIPSE_RINGS) * (0.68 + ring * 0.18),
        ),
      ),
    );
    const ringEndOffsets = ringCapacity.reduce<number[]>(
      (offsets, capacity) => [
        ...offsets,
        (offsets[offsets.length - 1] ?? 0) + capacity,
      ],
      [],
    );

    const productNodes = rankedProducts.map(({ product, stats }, index) => {
      const ringMatchIndex = ringEndOffsets.findIndex(
        (ringEndOffset) => index < ringEndOffset,
      );
      const currentRing =
        ringMatchIndex === -1 ? ELLIPSE_RINGS - 1 : ringMatchIndex;
      const ringStartOffset =
        currentRing === 0 ? 0 : ringEndOffsets[currentRing - 1];
      const indexInRing = index - ringStartOffset;

      const ringRatio = currentRing / Math.max(ELLIPSE_RING_SPAN, 1);
      const radiusX =
        ELLIPSE_INNER_RX +
        (ELLIPSE_OUTER_RX - ELLIPSE_INNER_RX) * ringRatio;
      const radiusY =
        ELLIPSE_INNER_RY +
        (ELLIPSE_OUTER_RY - ELLIPSE_INNER_RY) * ringRatio;
      const angle =
        -Math.PI / 2 +
        ((indexInRing + 0.5) / ringCapacity[currentRing]) * Math.PI * 2 +
        currentRing * 0.2;
      const radialJitter = ((index % 3) - 1) * 10;
      const x = GRAPH_CENTER_X + (radiusX + radialJitter) * Math.cos(angle);
      const y =
        GRAPH_CENTER_Y +
        (radiusY + radialJitter * 0.45) * Math.sin(angle);
      const color = nodePalette[index % nodePalette.length];
      const labelPosition =
        x < GRAPH_CENTER_X - 40
          ? ("left" as const)
          : x > GRAPH_CENTER_X + 40
            ? ("right" as const)
            : y < GRAPH_CENTER_Y
              ? ("top" as const)
              : ("bottom" as const);

      return {
        id: product,
        name: product,
        x,
        y,
        value: Number(stats.maxLift.toFixed(2)),
        symbolSize: Math.min(
          34,
          12 + stats.count * 1.8 + Math.min(stats.maxLift * 1.3, 8),
        ),
        itemStyle: {
          color,
          shadowBlur: 14,
          shadowColor: `${color}55`,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        label: {
          show: stats.count >= 3 || stats.maxLift >= 4.5,
          position: labelPosition,
          color: "#475569",
          fontSize: 11,
          distance: 4,
        },
        tooltip: {
          formatter: [
            `<b>${product}</b>`,
            `مرات الظهور: ${stats.count}`,
            `أعلى رفع: ${stats.maxLift.toFixed(2)}`,
            ...stats.links.slice(0, 4),
          ].join("<br/>"),
        },
      };
    });

    return {
      xAxis: {
        show: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        show: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
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
          layout: "none" as const,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          roam: true,
          draggable: false,
          center: ["50%", "51%"],
          zoom: 0.92,
          scaleLimit: {
            min: 0.4,
            max: 2,
          },
          data: [
            {
              id: "basket-center",
              name: "السلة",
              x: GRAPH_CENTER_X,
              y: GRAPH_CENTER_Y,
              value: topRulesByLift.length,
              symbolSize: 54,
              itemStyle: {
                color: "#0f172a",
                shadowBlur: 18,
                shadowColor: "rgba(15,23,42,0.28)",
                borderColor: palette.primaryCyan,
                borderWidth: 2,
              },
              label: {
                show: true,
                color: "#0f172a",
                fontWeight: 700,
                fontSize: 13,
                position: "right" as const,
              },
              tooltip: {
                formatter: `<b>السلة</b><br/>Rules: ${topRulesByLift.length}`,
              },
            },
            ...productNodes,
          ],
          links: productNodes.map((node) => ({
            source: "basket-center",
            target: node.id,
            value: node.value,
            lineStyle: {
              width: 0.5 + Math.min(node.value * 0.45, 2.2),
              color: "rgba(148,163,184,0.18)",
              opacity: 0.42,
              curveness: 0.04,
            },
            tooltip: {
              formatter: `<b>السلة</b><br/>مرتبط مع: ${node.name}<br/>Lift: ${node.value.toFixed(2)}`,
            },
          })),
          emphasis: {
            focus: "adjacency" as const,
            lineStyle: { width: 2.4, color: palette.primaryCyan },
          },
          edgeSymbol: ["none", "none"] as const,
          edgeLabel: { show: false },
          labelLayout: { hideOverlap: true },
        },
      ],
    };
  }, [nodePalette, palette]);

  return (
    <ChartCard
      title="شبكة ارتباط المنتجات"
      subtitle="شبكة ترابط المنتجات باستخدام قواعد الارتباط الأعلى حسب الرفع (Lift)"
      option={associationNetworkOption}
      height={CHART_VIEWPORT_HEIGHT}
      innerChartHeight={CHART_CANVAS_HEIGHT}
      width={CHART_CANVAS_WIDTH}
      plotOverflowY="hidden"
      scrollViewportDir="ltr"
      aiPowered
      delay={1}
    />
  );
};

export default ProductsLinkNetwork;
