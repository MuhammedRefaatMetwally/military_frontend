import { motion } from "framer-motion";
import { AlertCircle, DollarSign, ShoppingCart, Users } from "lucide-react";
import { cashiersBase } from "../../utils/cashiersBase";

const cashiers = cashiersBase.map((c, idx) => ({
  ...c,
  workShift: (idx % 2 === 0 ? "morning" : "evening") as "morning" | "evening",
  soldItemsCount: Math.max(0, Math.round(c.transactions * (6 + c.atv / 6))),
  attendancePct: Math.max(0, Math.min(100, Math.round(72 + c.score * 0.35))),
  voidedItemsCount: Math.max(
    0,
    Math.round(c.transactions * (c.voidRate / 100) * 22),
  ),
  voidedValue: Math.max(0, Math.round(c.sales * (c.voidRate / 100) * 3.2)),
}));

const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(n);
const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2)}K` : fmt2(n));
const totalSales = cashiers.reduce((a, c) => a + c.sales, 0);
const totalTrans = cashiers.reduce((a, c) => a + c.transactions, 0);
const avgAtv = totalSales / totalTrans;
const avgVoidRate =
  cashiers.reduce((a, c) => a + c.voidRate, 0) / cashiers.length;

const customerStats = [
  {
    icon: DollarSign,
    label: "صافي المبيعات",
    sub: "Net Sales",
    value: fmtK(totalSales),
    color: "var(--accent-green)",
    dimColor: "var(--accent-green-dim)",
  },
  {
    icon: ShoppingCart,
    label: "المعاملات الكلية",
    sub: "Total Transactions",
    value: fmtN(totalTrans),
    color: "var(--accent-cyan)",
    dimColor: "var(--accent-cyan-dim)",
  },
  {
    icon: Users,
    label: "متوسط قيمة المعاملة",
    sub: "Avg Transaction Value",
    value: fmt2(avgAtv),
    color: "var(--accent-amber)",
    dimColor: "rgba(245,158,11,0.1)",
  },
  {
    icon: AlertCircle,
    label: "معدل الإلغاء",
    sub: "Void Transaction Rate",
    value: `${avgVoidRate.toFixed(2)}%`,
    color: "var(--accent-red)",
    dimColor: "rgba(239,68,68,0.1)",
  },
] as const;
const EmployeesStats = () => {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {customerStats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="glass-panel p-5 relative overflow-hidden"
        >
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
            style={{ background: s.color, transform: "translate(30%, -30%)" }}
          />
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[11px] font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {s.label}
            </span>
            <div
              className="p-1.5 rounded-lg"
              style={{ background: s.dimColor }}
            >
              <s.icon size={13} style={{ color: s.color }} />
            </div>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: s.color }}
            dir="ltr"
          >
            {s.value}
          </p>
          <p
            className="text-[10px] mt-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            {s.sub}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default EmployeesStats;
