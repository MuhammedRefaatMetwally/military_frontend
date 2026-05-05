import { motion } from "framer-motion";
import { Hash, Link2, TrendingUp, Zap } from "lucide-react";

const kpis = [
  {
    icon: Link2,
    label: "ارتباطات مكتشفة",
    value: "1,247",
    color: "var(--accent-green)",
  },
  {
    icon: TrendingUp,
    label: "أعلى رفع (Lift)",
    value: "8.88",
    color: "var(--accent-cyan)",
  },
  {
    icon: Hash,
    label: "قواعد ارتباط",
    value: "342",
    color: "var(--accent-blue)",
  },
  {
    icon: Zap,
    label: "رفع البيع المتقاطع",
    value: "+18.2%",
    color: "var(--accent-amber)",
  },
];

const AiBasketStats = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="glass-panel ai-module p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <s.icon size={14} style={{ color: s.color }} />
            <span
              className="text-[11px] font-semibold"
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

export default AiBasketStats;
