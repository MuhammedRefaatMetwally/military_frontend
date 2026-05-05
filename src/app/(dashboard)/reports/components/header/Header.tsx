import { motion } from "framer-motion";
import { FileBarChart } from "lucide-react";

const Header = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between"
    >
      <div>
        <div className="flex items-center gap-3 mb-1">
          <FileBarChart size={24} style={{ color: "var(--accent-green)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            مركز التقارير
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          تتبّع حالة التقارير المطلوبة — يتم إنشاؤها تلقائيًا من شريط الفلاتر
        </p>
      </div>
    </motion.div>
  );
};

export default Header;
