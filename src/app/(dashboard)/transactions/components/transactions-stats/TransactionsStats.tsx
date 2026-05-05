import {
  AlertTriangle,
  Ban,
  DollarSign,
  Hash,
  Package,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import { branchData } from "../../utils/data";
import { motion } from "framer-motion";

const totalInvoices = branchData.reduce((a, b) => a + b.invoices, 0);

const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(2);
const totalVoids = branchData.reduce((a, b) => a + b.voidCount, 0);

const kpis = [
  {
    id: "atv",
    icon: DollarSign,
    label: "متوسط قيمة المعاملة (ATV)",
    value: "36.76",
    color: "var(--accent-green)",
    dim: "rgba(4,120,87,0.1)",
  },
  {
    id: "avg-basket-size",
    icon: ShoppingCart,
    label: "متوسط حجم السلة",
    value: "27",
    color: "var(--accent-cyan)",
    dim: "rgba(8,145,178,0.1)",
  },
  {
    id: "void-rate",
    icon: Ban,
    label: "% Void Transaction Rate",
    value: "0.05%",
    color: "var(--accent-red)",
    dim: "rgba(220,38,38,0.1)",
  },
  {
    id: "total-invoices",
    icon: Hash,
    label: "عدد الفواتير",
    value: "176K",
    color: "var(--accent-blue)",
    dim: "rgba(37,99,235,0.1)",
  },
  {
    id: "total-invoices-2",
    icon: Receipt,
    label: "عدد الفواتير",
    value: fmtK(totalInvoices),
    color: "var(--accent-purple)",
    dim: "rgba(124,58,237,0.1)",
  },
  {
    id: "total-voids",
    icon: AlertTriangle,
    label: "عدد الفواتير المرتجعة",
    value: String(totalVoids),
    color: "var(--accent-amber)",
    dim: "rgba(217,119,6,0.1)",
  },
  {
    id: "total-voids-2",
    icon: Package,
    label: "عدد المنتجات الملغية",
    value: "146",
    color: "var(--accent-red)",
    dim: "rgba(220,38,38,0.1)",
  },
];

const TransactionsStats = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
      {kpis.map((k, i) => (
        <motion.div
          key={k.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="glass-panel p-4 relative overflow-hidden"
        >
          <div
            className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl"
            style={{ background: k.color, opacity: 0.12 }}
          />
          <div className="relative">
            <div
              className="p-1.5 rounded-lg w-fit mb-2"
              style={{ background: k.dim }}
            >
              <k.icon size={12} style={{ color: k.color }} />
            </div>
            <p
              className="text-[15px] font-bold"
              style={{ color: k.color }}
              dir="ltr"
            >
              {k.value}
            </p>
            <p
              className="text-[9px] font-semibold mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {k.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TransactionsStats;
