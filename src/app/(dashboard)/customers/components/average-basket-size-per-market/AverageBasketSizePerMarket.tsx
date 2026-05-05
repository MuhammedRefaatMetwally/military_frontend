import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const AverageBasketSizePerMarket = () => {
  const [activeMarkets, setActiveMarkets] = useState<string[]>([]);

  const palette = useResolvedAnalyticsPalette();

  const MARKETS = useMemo(
    () => ["سوق عمّان", "سوق إربد", "سوق الزرقاء", "سوق العقبة", "سوق الكرك"],
    [],
  );
  const greenToRedScale = useMemo(
    () => [
      "#16a34a", // green
      "#84cc16", // lime
      "#facc15", // yellow
      "#fb923c", // orange
      "#ef4444", // red
      "#b91c1c", // dark red
    ],
    [],
  );

  const txScatterData = useMemo(() => {
    const seedHash = (s: number) => {
      let h = s * 2654435761;
      h = ((h >>> 16) ^ h) * 0x45d9f3b;
      return ((h >>> 16) ^ h) >>> 0;
    };
    const out: (number | string)[][] = [];
    for (let i = 0; i < 200; i++) {
      const h = seedHash(i + 7);
      const totalTx = (h % 650) + 1;
      const atv =
        totalTx > 300
          ? 2 + (seedHash(i + 99) % 12)
          : totalTx > 100
            ? 3 + (seedHash(i + 55) % 30)
            : 5 + (seedHash(i + 33) % 130);
      const avgVal = (seedHash(i + 200) % 1880) / 1000;
      const sz = Math.max(4, Math.min(25, (seedHash(i + 300) % 20) + 4));
      const market = MARKETS[seedHash(i + 17) % MARKETS.length];
      out.push([totalTx, atv, avgVal, sz, market]);
    }
    return out;
  }, [MARKETS]);

  const marketColors = useMemo(
    () => [
      palette.primaryGreen,
      palette.primaryCyan,
      "#3b82f6",
      "#a855f7",
      "#f59e0b",
    ],
    [palette.primaryCyan, palette.primaryGreen],
  );

  const filteredTxScatterData = useMemo(() => {
    if (activeMarkets.length === 0) return txScatterData;
    const set = new Set(activeMarkets);
    return txScatterData.filter((d) => set.has(d[4] as unknown as string));
  }, [activeMarkets, txScatterData]);

  const txFreqOption = useMemo(() => {
    const selected: Record<string, boolean> = {};
    if (activeMarkets.length === 0) {
      MARKETS.forEach((m) => {
        selected[m] = true;
      });
    } else {
      const set = new Set(activeMarkets);
      MARKETS.forEach((m) => {
        selected[m] = set.has(m);
      });
    }

    return {
      grid: { left: "3%", right: "4%", top: "12%", bottom: "22%" },
      tooltip: {
        trigger: "item" as const,
        formatter: (p: { data: unknown }) => {
          const d = Array.isArray(p.data) ? p.data : [];
          const market = String(d[4] ?? "");
          return `${market}<br/>اجمالي قيمة الفواتير: <b>${d[0]}</b><br/>عدد الفواتير: <b>${d[1]}</b>`;
        },
      },
      legend: {
        data: MARKETS,
        bottom: 0,
        left: "center",
        selected,
        textStyle: { fontSize: 10, color: "var(--text-muted)" },
        itemWidth: 10,
        itemHeight: 10,
      },
      xAxis: {
        type: "value" as const,
        name: "اجمالي قيمة الفواتير",
        nameLocation: "center" as const,
        nameGap: 30,
        max: 700,
      },
      yAxis: {
        type: "value" as const,
        name: "عدد الفواتير",
        nameLocation: "center" as const,
        nameGap: 35,
        max: 140,
      },
      visualMap: {
        show: true,
        dimension: 2,
        min: 0,
        max: 1.88,
        calculable: true,
        orient: "horizontal" as const,
        left: "center",
        top: 0,
        inRange: { color: greenToRedScale },
        textStyle: { fontSize: 9, color: "var(--text-muted)" },
        formatter: (v: number) => `${v.toFixed(2)}K`,
      },
      series: MARKETS.map((m, i) => ({
        name: m,
        type: "scatter" as const,
        data: filteredTxScatterData.filter((d) => String(d[4]) === m),
        symbolSize: (d: unknown) => (Array.isArray(d) ? (d[3] as number) : 8),
        encode: { x: 0, y: 1 },
        itemStyle: {
          opacity: 0.78,
          color: marketColors[i % marketColors.length],
        },
      })),
    };
  }, [
    MARKETS,
    activeMarkets,
    filteredTxScatterData,
    greenToRedScale,
    marketColors,
  ]);
  return (
    <ChartCard
      title="متوسط حجم السلة لكل سوق"
      titleFlag="green"
      subtitle="Transaction Frequency vs. Average Transaction Value"
      option={txFreqOption}
      headerExtra={
        <div className="mt-2 px-5 flex flex-wrap items-center gap-2 text-[10px]">
          <span
            className="font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            الأسواق:
          </span>
          <MultiSelectDropdown
            icon={MapPin}
            label="الأسواق"
            selectedValues={activeMarkets}
            options={[
              { value: "all", label: "كل الأسواق" },
              ...MARKETS.map((m) => ({ value: m, label: m })),
            ]}
            onChange={setActiveMarkets}
            accent="var(--accent-green)"
            manyLabel={(n) => `${n} أسواق`}
          />
        </div>
      }
      height="400px"
      delay={2}
    />
  );
};

export default AverageBasketSizePerMarket;
