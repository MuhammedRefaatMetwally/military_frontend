import {
  AlertCircle,
  BarChart3,
  DollarSign,
  Percent,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { hexToRgba } from "../../utils/hexToRgba";
import { motion } from "framer-motion";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";

const DiscountsStats = () => {
  const palette = useResolvedAnalyticsPalette();

  const kpis = useMemo(
    () => [
      {
        icon: DollarSign,
        label: "صافي المبيعات",
        value: "425.92K",
        color: palette.primaryGreen,
        dim: hexToRgba(palette.primaryGreen, 0.1),
      },
      {
        icon: TrendingUp,
        label: "قيمة الربح",
        value: "155.52K",
        color: palette.primaryCyan,
        dim: hexToRgba(palette.primaryCyan, 0.1),
      },
      {
        icon: BarChart3,
        label: "قيمة التكلفة",
        value: "78.28K",
        color: palette.primaryBlue,
        dim: hexToRgba(palette.primaryBlue, 0.1),
      },
      {
        icon: Tag,
        label: "إجمالي الخصومات المطبقة",
        value: "169.47K",
        color: palette.primaryAmber,
        dim: hexToRgba(palette.primaryAmber, 0.1),
      },
      {
        icon: TrendingDown,
        label: "ربح المنتجات المخصومة",
        value: "43.61K",
        color: "#a855f7",
        dim: "rgba(168,85,247,0.1)",
      },
      {
        icon: Percent,
        label: "% مبيعات مخصومة",
        value: "21.31%",
        color: palette.primaryRed,
        dim: hexToRgba(palette.primaryRed, 0.1),
      },
      {
        icon: AlertCircle,
        label: "متوسط نسبة الخصم",
        value: "1.97%",
        color: "#0891b2",
        dim: "rgba(8,145,178,0.1)",
      },
    ],
    [palette],
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
      {kpis.map((k, i) => (
        <motion.div
          key={k.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-panel p-4 relative overflow-hidden"
        >
          <div
            className="absolute -top-4 -right-4 w-14 h-14 rounded-full blur-2xl"
            style={{ background: k.color, opacity: 0.15 }}
          />
          <div className="relative">
            <div
              className="p-1.5 rounded-lg w-fit mb-2"
              style={{ background: k.dim }}
            >
              <k.icon size={11} style={{ color: k.color }} />
            </div>
            <p
              className="text-[15px] font-bold"
              style={{ color: k.color }}
              dir="ltr"
            >
              {k.value}
            </p>
            <p
              className="text-[9px] font-semibold mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {k.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DiscountsStats;
