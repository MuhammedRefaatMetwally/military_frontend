import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import MetricsBubblePlot, {
  MetricsBubblePoint,
} from "@/components/ui/MetricsBubblePlot";
import { useMemo } from "react";
import { cashiersBase } from "../../utils/cashiersBase";
import { useFilterStore } from "@/store/filterStore";

const ReturnsRatioWithAverageInvoiceValue = () => {
  const selectedEmployees = useFilterStore((s) => s.employee);
  const workShift = useFilterStore((s) => s.workShift);
  const returnRateRange = useFilterStore((s) => s.returnRateRange);

  const cashiers = cashiersBase.map((c, idx) => ({
    ...c,
    workShift: (idx % 2 === 0 ? "morning" : "evening") as "morning" | "evening",
    /** عدد الأصناف المباعة (تقديري للعرض) */
    soldItemsCount: Math.max(0, Math.round(c.transactions * (6 + c.atv / 6))),
    /** الالتزام بالدوام (٪) تقديري للعرض */
    attendancePct: Math.max(0, Math.min(100, Math.round(72 + c.score * 0.35))),
    /** تقدير تجميعي من معدل الإلغاء والمعاملات (عرض توضيحي) */
    voidedItemsCount: Math.max(
      0,
      Math.round(c.transactions * (c.voidRate / 100) * 22),
    ),
    /** قيمة تقديرية للمواد الملغاة من المبيعات ومعدل الإلغاء */
    voidedValue: Math.max(0, Math.round(c.sales * (c.voidRate / 100) * 3.2)),
  }));
  const filteredCashiers = useMemo(
    () =>
      cashiers.filter((c) => {
        const okName =
          selectedEmployees.length === 0 || selectedEmployees.includes(c.name);
        const okShift = workShift === "all" || c.workShift === workShift;
        const okReturn =
          c.voidRate >= returnRateRange[0] && c.voidRate <= returnRateRange[1];
        return okName && okShift && okReturn;
      }),
    [selectedEmployees, workShift, returnRateRange, cashiers],
  );

  /** فقاعات: أفقي = معدل الإلغاء %، عمودي = قيمة المواد الملغاة، الحجم ∝ عدد المواد الملغات */
  const voidVsValueBubblePoints: MetricsBubblePoint[] = useMemo(
    () =>
      (() => {
        const raw = filteredCashiers.map((c) => ({
          key: c.name,
          label: c.name,
          depth: 0 as const,
          xValue: c.voidRate,
          yValue: c.voidedValue,
          hasChildren: false,
          vol: c.sales,
          price: c.score,
          basket: c.voidedItemsCount,
          atv: c.atv,
        }));

        // تجميع النقاط المتطابقة (نفس X,Y) لتفادي تراكب الدوائر والأسماء.
        const buckets = new Map<
          string,
          { x: number; y: number; names: string[]; points: typeof raw }
        >();
        for (const p of raw) {
          const k = `${p.xValue.toFixed(4)}|${p.yValue.toFixed(0)}`;
          const b = buckets.get(k);
          if (b) {
            b.names.push(p.label);
            b.points.push(p);
          } else {
            buckets.set(k, {
              x: p.xValue,
              y: p.yValue,
              names: [p.label],
              points: [p],
            });
          }
        }

        return Array.from(buckets.values()).map((b) => {
          const n = b.points.length;
          const sortedNames = [...b.names].sort((a, z) =>
            a.localeCompare(z, "ar"),
          );
          const label = n <= 1 ? sortedNames[0] : `${sortedNames[0]} +${n - 1}`;

          const sum = <K extends keyof (typeof raw)[number]>(key: K): number =>
            b.points.reduce((a, p) => a + (p[key] as unknown as number), 0);

          return {
            key: n <= 1 ? sortedNames[0] : `grp_${sortedNames.join("__")}`,
            label,
            depth: 0 as const,
            xValue: b.x,
            yValue: b.y,
            hasChildren: false,
            vol: sum("vol"),
            basket: sum("basket"),
            price: sum("price") / n,
            atv: sum("atv") / n,
          } satisfies MetricsBubblePoint;
        });
      })(),
    [filteredCashiers],
  );

  return (
    <div className="glass-panel p-0 overflow-hidden min-w-0 h-full flex flex-col">
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <ChartTitleFlagBadge flag="green" size="sm" />
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            نسبة المرتجعات مع متوسط قيمة الفاتورة
            {/* نسبة الإلغاء مقابل متوسط قيمة المعاملة */}
          </h3>
        </div>
        <p
          className="text-[10px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          أفقي: معدل الإلغاء % — عمودي: قيمة المواد الملغاة — انقر على الدائرة
          لاسم الكاشير والتفاصيل
        </p>
      </div>
      <div className="flex-1 h-full">
        <MetricsBubblePlot
          points={voidVsValueBubblePoints}
          xLabel="نسبة الارجاع بالنسبة لعدد الفواتير الكلية"
          yLabel="نسبة المبيعات المرتجعة من المبيعات الكلية"
          variant="green"
          plotHeight={320}
          compactBottom
          showDepthLegend={false}
          formatXTick={(v) => `${v.toFixed(2)}%`}
          entitySubtitle={() => "كاشير"}
          detailLabels={{
            vol: "إجمالي المبيعات",
            price: "درجة الأداء",
            basket: "عدد المواد الملغات",
            atv: "متوسط قيمة المعاملة",
          }}
          formatPrice={(n) => `${n.toFixed(2)}%`}
        />
      </div>
    </div>
  );
};

export default ReturnsRatioWithAverageInvoiceValue;
