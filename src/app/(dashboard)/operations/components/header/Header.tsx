import { motion } from "framer-motion";
import { Settings2 } from "lucide-react";

const Header = () => {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-1">
        <Settings2 size={24} style={{ color: "var(--accent-green)" }} />
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          السلة
        </h1>
      </div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        تحليل الأداء التشغيلي حسب الأسواق — التقرير الثالث
      </p>
    </motion.div>
  );
};

export default Header;
