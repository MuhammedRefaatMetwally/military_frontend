import { motion } from "framer-motion";
import { Percent } from "lucide-react";

const Header = () => {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-1">
        <Percent size={22} style={{ color: "var(--accent-amber)" }} />
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          تحليل الخصومات
        </h1>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--accent-amber)" }}
          />
          <span
            className="text-[10px]"
            style={{ color: "var(--accent-amber)" }}
          >
            التقرير السابع
          </span>
        </div>
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        تحليل الخصومات: الهوامش، نطاقات الخصم، أداء الفروع، والمواسم
      </p>
    </motion.div>
  );
};

export default Header;
