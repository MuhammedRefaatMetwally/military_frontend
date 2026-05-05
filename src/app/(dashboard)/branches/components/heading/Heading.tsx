import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
const Heading = () => {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-1">
        <Building2 size={24} style={{ color: "var(--accent-green)" }} />
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          أداء الفروع
        </h1>
      </div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Branches & Product Category Performance Scores — التقرير الثاني
      </p>
    </motion.div>
  );
};

export default Heading;
