import AIBadge from "@/components/ui/AIBadge";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const Header = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between"
    >
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="p-2 rounded-lg"
            style={{
              background: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.2)",
            }}
          >
            <Brain size={20} style={{ color: "var(--accent-blue)" }} />
          </div>
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              توقع المبيعات AI
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              التقرير الحادي عشر — توقع مبيعات الأشهر القادمة باستخدام نماذج
              ذكاء اصطناعي
            </p>
          </div>
        </div>
      </div>
      <AIBadge label="ARIMA + XGBoost" size="md" confidence={99} />
    </motion.div>
  );
};

export default Header;
