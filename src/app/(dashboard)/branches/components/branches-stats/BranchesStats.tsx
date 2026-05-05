import { motion } from "framer-motion";

import { branchesStats } from "./utils/branchesStats";

const BranchesStats = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {branchesStats.map((s) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-4"
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

export default BranchesStats;
