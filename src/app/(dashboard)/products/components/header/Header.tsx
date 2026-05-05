import { motion } from "framer-motion";
import { Package } from "lucide-react";

const Header = () => {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-1">
        <Package size={22} style={{ color: "var(--accent-green)" }} />
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          أداء المنتجات
        </h1>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--accent-green)" }}
          />
          <span
            className="text-[10px]"
            style={{ color: "var(--accent-green)" }}
          >
            التقرير السادس
          </span>
        </div>
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        تحليل شامل: مبيعات الفئات، هوامش الربح، أفضل/أدنى المنتجات، وشبكة
        الارتباط
      </p>
    </motion.div>
  );
};

export default Header;
