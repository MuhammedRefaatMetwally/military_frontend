import { getReportJobs } from "@/lib/mockData";
import { motion } from "framer-motion";
const reports = getReportJobs();

const stats = [
  {
    label: "إجمالي التقارير",
    value: reports.length,
    color: "var(--accent-green)",
  },
  {
    label: "جاهزة",
    value: reports.filter((r) => r.status === "ready").length,
    color: "var(--accent-green)",
  },
  {
    label: "قيد المعالجة",
    value: reports.filter((r) => r.status === "processing").length,
    color: "var(--accent-purple)",
  },
  {
    label: "قيد الانتظار",
    value: reports.filter((r) => r.status === "pending").length,
    color: "var(--accent-amber)",
  },
];

const ReportsStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-4"
        >
          <p
            className="text-[11px] font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            {s.label}
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>
            {s.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default ReportsStats;
