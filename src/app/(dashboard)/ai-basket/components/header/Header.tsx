import AIBadge from "@/components/ui/AIBadge";
import { motion } from "framer-motion";
import { ShoppingBasket } from "lucide-react";

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
              background: "var(--accent-cyan-dim)",
              border: "1px solid rgba(8,145,178,0.2)",
            }}
          >
            <ShoppingBasket size={20} style={{ color: "var(--accent-cyan)" }} />
          </div>
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              تحليل سلة السوق
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              قواعد الارتباط والرفع والدعم — Market Basket Analysis
            </p>
          </div>
        </div>
      </div>
      <AIBadge label="Apriori + FP-Growth" size="md" confidence={91} />
    </motion.div>
  );
};

export default Header;
