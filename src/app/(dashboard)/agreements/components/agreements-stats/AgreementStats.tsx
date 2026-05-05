import { BarChart3, FileText, Package, Percent } from "lucide-react";
import { agreements } from "../../utils/agreements";
import { motion } from "framer-motion";

const agreementsStats = [
  {
    icon: FileText,
    label: "إجمالي الاتفاقيات",
    value: agreements.length,
    color: "var(--accent-green)",
  },
  {
    icon: Package,
    label: "المواد المشمولة",
    value: agreements.reduce((a, b) => a + b.materials, 0),
    color: "var(--accent-blue)",
  },
  {
    icon: BarChart3,
    label: "متوسط الهامش",
    value: `${(agreements.filter((a) => a.profitMargin > 0).reduce((a, b) => a + b.profitMargin, 0) / agreements.filter((a) => a.profitMargin > 0).length).toFixed(0)}%`,
    color: "var(--accent-green)",
  },
  {
    icon: Percent,
    label: "متوسط الخصم",
    value: `${(agreements.filter((a) => a.discountRate > 0).reduce((a, b) => a + b.discountRate, 0) / agreements.filter((a) => a.discountRate > 0).length).toFixed(0)}%`,
    color: "var(--accent-amber)",
  },
];
const AgreementStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {agreementsStats.map((s) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <s.icon size={14} style={{ color: s.color }} />
            <span
              className="text-[11px] font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              {s.label}
            </span>
          </div>
          <p className="text-lg font-bold" style={{ color: s.color }}>
            {s.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default AgreementStats;
