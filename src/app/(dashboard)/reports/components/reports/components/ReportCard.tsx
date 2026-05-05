import { motion } from "framer-motion";
import { reportNamesAr, typeLabels } from "../data";
import Ready from "./Ready";
import Failed from "./Failed";

type report = {
  id: string;
  name: string;
  formats: string[];
  status: string;
  type: string;
  createdAt: string;
  progress: number;
};

type ReportCard = {
  report: report;
  i: number;
  cfg: { icon: React.ElementType; label: string; cls: string; color: string };
  StatusIcon: React.ElementType;
};
const ReportCard = ({ report, i, cfg, StatusIcon }: ReportCard) => {
  return (
    <motion.div
      key={report.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.05 }}
    >
      <div
        className={`glass-panel p-5 transition-colors hover:border-(--border-default)`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${cfg.cls}`}
              >
                <span className="flex items-center gap-1">
                  <StatusIcon
                    size={11}
                    className={
                      report.status === "processing" ? "animate-spin" : ""
                    }
                  />
                  {cfg.label}
                </span>
              </span>
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {typeLabels[report.type] ?? report.type}
              </span>
            </div>
            <h3
              className="text-sm font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {reportNamesAr[report.id] || report.name}
            </h3>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              تم الطلب: {new Date(report.createdAt).toLocaleDateString("ar-JO")}
            </p>
            {(report.status === "processing" ||
              report.status === "pending") && (
              <div className="mt-3 progress-bar w-64">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${report.progress}%`,
                    background: cfg.color,
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {report.status === "ready" && <Ready report={report} key={i} />}
            {report.status === "failed" && <Failed key={i} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportCard;
