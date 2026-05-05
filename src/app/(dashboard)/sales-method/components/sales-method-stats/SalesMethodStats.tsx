import { motion } from "framer-motion";

import {
  ArrowLeftRight,
  CreditCard,
  DollarSign,
  Globe,
  Shield,
  ShoppingBag,
  Zap,
} from "lucide-react";

const stats = [
  {
    icon: CreditCard,
    label: "طرق الدفع",
    value: "4",
    color: "var(--accent-green)",
  },
  {
    icon: DollarSign,
    label: "نقدي",
    value: "42%",
    color: "var(--accent-green)",
  },
  {
    icon: ShoppingBag,
    label: "فيزا/بطاقة",
    value: "32%",
    color: "var(--accent-blue)",
  },
  {
    icon: ArrowLeftRight,
    label: "كوبون/قسيمة",
    value: "4%",
    color: "var(--accent-amber)",
  },
  {
    icon: Shield,
    label: "ذمم (كتب رسمية)",
    value: "46.5%",
    color: "var(--accent-cyan)",
  },
  {
    icon: Globe,
    label: "بيع إلكتروني",
    value: "36.6%",
    color: "var(--accent-purple)",
  },
  {
    icon: Zap,
    label: "دفع فوري",
    value: "16.9%",
    color: "var(--accent-amber)",
  },
];
const SalesMethodStats = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {stats.map((s) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <s.icon size={14} style={{ color: s.color }} />
            <span
              className="text-[10px] font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              {s.label}
            </span>
          </div>
          <p className="text-lg font-bold" style={{ color: s.color }}>
            {s.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default SalesMethodStats;
