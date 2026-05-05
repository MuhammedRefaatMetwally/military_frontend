import { motion } from "framer-motion";

import {
  Clock,
  CreditCard,
  Repeat,
  ShoppingBag,
  UserCircle,
} from "lucide-react";

const CustomersStats = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {[
        {
          icon: UserCircle,
          label: "إجمالي العملاء",
          value: "92.5K",
          color: "var(--accent-green)",
        },
        {
          icon: ShoppingBag,
          label: "متوسط الفاتورة",
          value: "133 د.أ",
          color: "var(--accent-cyan)",
        },
        {
          icon: Clock,
          label: "ساعة الذروة",
          value: "10-12 ص",
          color: "var(--accent-amber)",
        },
        {
          icon: Repeat,
          label: "معدل العودة",
          value: "89%",
          color: "var(--accent-blue)",
        },
        {
          icon: CreditCard,
          label: "الدفع النقدي",
          value: "45%",
          color: "var(--accent-green)",
        },
      ].map((s) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-4 text-center"
        >
          <s.icon
            size={18}
            className="mx-auto mb-2"
            style={{ color: s.color }}
          />
          <p className="text-lg font-bold" style={{ color: s.color }}>
            {s.value}
          </p>
          <p
            className="text-[10px] font-semibold mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            {s.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default CustomersStats;
