import { motion } from "framer-motion";
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  BarChart3,
  Undo2,
} from "lucide-react";
const operationalKPIs = [
  {
    icon: BarChart3,
    label: "الأرباح",
    value: "8.6M",
    sublabel: "صافي الأرباح",
    color: "var(--accent-green)",
  },
  {
    icon: Truck,
    label: "المبيعات",
    value: "24.6M",
    sublabel: "إجمالي المبيعات",
    color: "var(--accent-cyan)",
  },
  {
    icon: Undo2,
    label: "المرتجعات",
    value: "1.2M",
    sublabel: "قيمة المرتجعات",
    color: "var(--accent-red)",
  },
  {
    icon: Package,
    label: "الفواتير",
    value: "184.5K",
    sublabel: "عدد الفواتير",
    color: "var(--accent-blue)",
  },
  {
    icon: CheckCircle,
    label: "هامش الربح",
    value: "34.9%",
    sublabel: "متوسط الهامش",
    color: "var(--accent-green)",
  },
  {
    icon: Clock,
    label: "متوسط المعالجة",
    value: "2.4 س",
    sublabel: "وقت الطلب",
    color: "var(--accent-amber)",
  },
];

const OperationsStats = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {operationalKPIs.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          className="glass-panel p-4 text-center"
        >
          <kpi.icon
            size={20}
            className="mx-auto mb-2"
            style={{ color: kpi.color }}
          />
          <p
            className="text-xl font-bold"
            style={{ color: kpi.color }}
            dir="ltr"
          >
            {kpi.value}
          </p>
          <p
            className="text-[10px] font-semibold mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            {kpi.label}
          </p>
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {kpi.sublabel}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default OperationsStats;
