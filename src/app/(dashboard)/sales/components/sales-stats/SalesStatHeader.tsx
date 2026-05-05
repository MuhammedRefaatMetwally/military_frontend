import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
const SalesStatHeader = () => {
  const palette = useResolvedAnalyticsPalette();

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-1">
        <TrendingUp size={24} style={{ color: palette.primaryGreen }} />
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          أداء المبيعات
        </h1>
      </div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        تحليل شامل للمبيعات — التقرير الأول
      </p>
    </motion.div>
  );
};

export default SalesStatHeader;
