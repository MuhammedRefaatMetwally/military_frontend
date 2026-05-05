import { motion } from "framer-motion";
import { salesStats } from "./utils/salesStats";

const SalesStatCard = ({ s, i }: { s: (typeof salesStats)[0]; i: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: i * 0.03 }}
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
      <p className="text-lg font-bold" style={{ color: s.color }} dir="ltr">
        {s.value}
      </p>
      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
        {s.sublabel}
      </p>
    </motion.div>
  );
};

export default SalesStatCard;
