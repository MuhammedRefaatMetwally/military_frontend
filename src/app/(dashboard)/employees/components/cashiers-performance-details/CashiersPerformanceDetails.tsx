import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import { useMemo } from "react";
import { cashiersBase } from "../../utils/cashiersBase";
import { useFilterStore } from "@/store/filterStore";
import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import { motion } from "framer-motion";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";

const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(n);

const CashiersPerformanceDetails = () => {
  const palette = useResolvedAnalyticsPalette();
  const selectedEmployees = useFilterStore((s) => s.employee);
  const workShift = useFilterStore((s) => s.workShift);
  const returnRateRange = useFilterStore((s) => s.returnRateRange);
  const scoreColor = (s: number) => {
    if (s >= 63) return palette.primaryGreen;
    if (s >= 55) return palette.primaryAmber;
    if (s >= 45) return "#f97316";
    return palette.primaryRed;
  };
  const cashiers = useMemo(
    () =>
      cashiersBase.map((c, idx) => ({
        ...c,
        id: `${c.name}-${idx}`,
        workShift: (idx % 2 === 0 ? "morning" : "evening") as
          | "morning"
          | "evening",
        /** عدد الأصناف المباعة (تقديري للعرض) */
        soldItemsCount: Math.max(
          0,
          Math.round(c.transactions * (6 + c.atv / 6)),
        ),
        /** الالتزام بالدوام (٪) تقديري للعرض */
        attendancePct: Math.max(
          0,
          Math.min(100, Math.round(72 + c.score * 0.35)),
        ),
        /** تقدير تجميعي من معدل الإلغاء والمعاملات (عرض توضيحي) */
        voidedItemsCount: Math.max(
          0,
          Math.round(c.transactions * (c.voidRate / 100) * 22),
        ),
        /** قيمة تقديرية للمواد الملغاة من المبيعات ومعدل الإلغاء */
        voidedValue: Math.max(
          0,
          Math.round(c.sales * (c.voidRate / 100) * 3.2),
        ),
      })),
    [],
  );
  const maxTrans = Math.max(...cashiers.map((c) => c.transactions));
  const maxSoldItems = Math.max(...cashiers.map((c) => c.soldItemsCount));
  const avgScore = cashiers.reduce((a, c) => a + c.score, 0) / cashiers.length;
  const totalTrans = cashiers.reduce((a, c) => a + c.transactions, 0);
  const avgVoidRate =
    cashiers.reduce((a, c) => a + c.voidRate, 0) / cashiers.length;
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

  const ranked = [...filteredCashiers].sort((a, b) => b.score - a.score);

  const tableStats = useMemo(() => {
    const base = filteredCashiers.length > 0 ? filteredCashiers : cashiers;
    const count = base.length || 1;
    const avgPerf = base.reduce((a, c) => a + c.score, 0) / (base.length || 1);
    const invoices = base.reduce((a, c) => a + c.transactions, 0);
    const soldItems = base.reduce((a, c) => a + c.soldItemsCount, 0);
    const avgReturns = base.reduce((a, c) => a + c.voidRate, 0) / count;
    const avgAttendance = base.reduce((a, c) => a + c.attendancePct, 0) / count;

    return [
      { label: "درجة الأداء", value: `${avgPerf.toFixed(1)}%` },
      { label: "عدد الفواتير", value: fmtN(invoices) },
      { label: "عدد الأصناف المباعة", value: fmtN(soldItems) },
      { label: "نسبة المرتجعات", value: `${avgReturns.toFixed(2)}%` },
      { label: "الالتزام بالدوام", value: `${Math.round(avgAttendance)}%` },
    ] as const;
  }, [filteredCashiers, cashiers]);

  const sorted = useMemo(
    () => [...filteredCashiers].sort((a, b) => b.score - a.score),
    [filteredCashiers],
  );

  return (
    <AnalyticsTableCard
      title="تفاصيل أداء الكاشيرات"
      flag="green"
      subtitles={
        <p
          className="text-[10px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          Cashier Performance Details
        </p>
      }
      headerExtra={
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            {/* left side */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span
                className="font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                أسماء الأسواق
              </span>
              {[
                "سوق عمّان",
                "سوق إربد",
                "سوق الزرقاء",
                "سوق العقبة",
                "سوق الكرك",
              ].map((m) => (
                <span
                  key={m}
                  className="px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: "var(--border-subtle)",
                    background: "var(--bg-elevated)",
                    color: "var(--text-muted)",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {tableStats.map((k) => (
              <div key={k.label} className="text-center">
                <p
                  className="text-[9px] leading-tight mb-1 whitespace-pre-line"
                  style={{ color: "var(--text-muted)" }}
                >
                  {k.label}
                </p>
                <p
                  className="text-xl font-bold"
                  style={{ color: "var(--accent-blue)" }}
                  dir="ltr"
                >
                  {k.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <AnalyticsTable
        headers={[
          { label: "#", align: "right", width: 32 },
          { label: "الكاشير", align: "right" },
          { label: "درجة الاداء", align: "center" },
          { label: "عدد الفواتير", align: "center" },
          { label: "عدد الاصناف المباعة", align: "center" },
          { label: "نسبة المرتجعات", align: "center" },
          { label: "الالتزام بالدوام", align: "center" },
        ]}
      >
        {sorted.map((c, i) => {
          const rank = ranked.findIndex((x) => x.id === c.id) + 1;
          const medalColor =
            rank === 1
              ? "#f59e0b"
              : rank === 2
                ? "#94a3b8"
                : rank === 3
                  ? "#cd7c2f"
                  : "var(--text-muted)";
          return (
            <motion.tr
              key={c.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="hover:bg-white/1.5 transition-colors"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <td style={{ ...analyticsTdBaseStyle("right"), width: 32 }}>
                <span
                  style={{ fontSize: 11, fontWeight: 700, color: medalColor }}
                  dir="ltr"
                >
                  {rank}
                </span>
              </td>
              <td style={{ ...analyticsTdBaseStyle("right") }}>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: `${scoreColor(c.score)}15`,
                      border: `1.5px solid ${scoreColor(c.score)}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: scoreColor(c.score),
                      flexShrink: 0,
                    }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {c.name}
                  </span>
                </div>
              </td>

              <AnalyticsBarCell
                value={c.score}
                max={100}
                color={scoreColor(c.score)}
                text={`${c.score.toFixed(2)}%`}
              />
              <AnalyticsBarCell
                value={c.transactions}
                max={maxTrans}
                color="#3b82f6"
                text={fmtN(c.transactions)}
              />
              <AnalyticsBarCell
                value={c.soldItemsCount}
                max={maxSoldItems}
                color="#3b82f6"
                text={fmtN(c.soldItemsCount)}
              />

              <td style={analyticsTdBaseStyle("center")}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color:
                      c.voidRate === 0
                        ? "var(--text-muted)"
                        : c.voidRate <= 0.05
                          ? "var(--accent-amber)"
                          : "var(--accent-red)",
                  }}
                  dir="ltr"
                >
                  {c.voidRate.toFixed(2)}%
                </span>
              </td>

              <td style={analyticsTdBaseStyle("center")} dir="ltr">
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color:
                      c.attendancePct >= 92
                        ? "var(--accent-green)"
                        : c.attendancePct >= 85
                          ? "var(--accent-amber)"
                          : "var(--accent-red)",
                  }}
                >
                  {c.attendancePct}%
                </span>
                <span
                  style={{
                    marginInlineStart: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                  }}
                >
                  {c.workShift === "morning" ? "صباحي" : "مسائي"}
                </span>
              </td>
            </motion.tr>
          );
        })}

        <tr
          style={{
            background: "var(--accent-green-dim)",
            borderTop: `2px solid rgba(0,229,160,0.2)`,
          }}
        >
          <td
            colSpan={2}
            style={{
              ...analyticsTdBaseStyle("right"),
              fontSize: 11,
              fontWeight: 700,
              color: "var(--accent-green)",
            }}
          >
            الإجمالي الكلي
          </td>
          <td style={analyticsTdBaseStyle("center")} dir="ltr">
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: scoreColor(avgScore),
              }}
            >
              {avgScore.toFixed(2)}%
            </span>
          </td>
          <td style={analyticsTdBaseStyle("center")} dir="ltr">
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              {fmtN(totalTrans)}
            </span>
          </td>
          <td style={analyticsTdBaseStyle("center")} dir="ltr">
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              {fmtN(cashiers.reduce((a, c) => a + c.soldItemsCount, 0))}
            </span>
          </td>
          <td style={analyticsTdBaseStyle("center")} dir="ltr">
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              {avgVoidRate.toFixed(2)}%
            </span>
          </td>
          <td style={analyticsTdBaseStyle("center")} dir="ltr">
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              {Math.round(
                cashiers.reduce((a, c) => a + c.attendancePct, 0) /
                  cashiers.length,
              )}
              %
            </span>
          </td>
        </tr>
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
};

export default CashiersPerformanceDetails;
