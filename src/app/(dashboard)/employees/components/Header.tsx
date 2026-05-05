import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

const Header = () => {
  const palette = useResolvedAnalyticsPalette();

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-1">
        <Users size={22} style={{ color: "var(--text-primary)" }} />
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          الموظفين
        </h1>
        <div className="flex items-center gap-1.5 mr-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: palette.primaryGreen }}
          />
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            بيانات مباشرة
          </span>
        </div>
      </div>
      <p className="text-xs" style={{ color: "var(--text-primary)" }}>
        تحليل أداء الكاشيرات — مبيعات، معاملات، نسبة الإلغاء، ودرجة الأداء الكلي
      </p>
    </motion.div>
  );
};

export default Header;
