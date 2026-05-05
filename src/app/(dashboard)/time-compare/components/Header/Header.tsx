import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const Header = () => {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-1">
        <Clock size={22} style={{ color: "var(--accent-blue)" }} />
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          التحليل والمقارنة الزمنية
        </h1>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--accent-blue)" }}
          />
          <span className="text-[10px]" style={{ color: "var(--accent-blue)" }}>
            التقرير الثالث عشر
          </span>
        </div>
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        تحليل ومقارنة الأداء خلال فترة زمنية محددة لدعم اتخاذ القرار — Period
        Comparison Analysis
      </p>
    </motion.div>
  );
};

export default Header;
