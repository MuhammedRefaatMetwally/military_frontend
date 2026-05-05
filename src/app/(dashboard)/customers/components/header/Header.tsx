import { motion } from "framer-motion";
import { UserCircle } from "lucide-react";

const Header = () => {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-1">
        <UserCircle size={24} style={{ color: "var(--accent-green)" }} />
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          سلوك العملاء
        </h1>
      </div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        تحليل المستهلك: الفاتورة، الذروة، الخصومات، الدفع — التقرير الخامس
      </p>
    </motion.div>
  );
};

export default Header;
