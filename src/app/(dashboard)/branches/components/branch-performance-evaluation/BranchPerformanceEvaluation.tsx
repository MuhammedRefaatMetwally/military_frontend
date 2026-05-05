import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import { BarChart3 } from "lucide-react";
import { branchScores } from "../utils/branchScores";
import { AnalyticsTable } from "@/components/ui/AnalyticsTable";
import { gColor, standardWeights, weightedBranchSchedule } from "./utils/data";
import BranchPerformanceTableRows from "./components/BranchPerformanceTableRows";
const donutC = 100;
const donutR = 77;
const avgScore = Math.round(
  branchScores.reduce((a, b) => a + b.score, 0) / branchScores.length,
);

const circumference = 2 * Math.PI * donutR;
const dashOffset = circumference - (avgScore / 100) * circumference;

const BranchPerformanceEvaluation = () => {
  return (
    <div className="glass-panel p-0 overflow-hidden">
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <ChartTitleFlagBadge flag="green" size="sm" />
          <div className="flex items-center gap-2">
            <BarChart3 size={16} style={{ color: "var(--accent-blue)" }} />
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              تقييم أداء الفروع
            </h3>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-0">
        {/* Simple Donut Gauge */}
        <div
          className="p-5 border-b xl:border-b-0 xl:border-l flex flex-col items-center justify-center"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p
            className="text-[11px] font-semibold mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            متوسط درجة أداء الفروع الكلية
          </p>
          <div className="relative" style={{ width: 200, height: 200 }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx={donutC}
                cy={donutC}
                r={donutR}
                fill="none"
                stroke="var(--bg-elevated)"
                strokeWidth="16"
              />
              <circle
                cx={donutC}
                cy={donutC}
                r={donutR}
                fill="none"
                stroke={gColor}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${donutC} ${donutC})`}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: gColor }}>
                {avgScore}%
              </span>
              <span
                className="text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                الأداء العام
              </span>
            </div>
          </div>
        </div>

        {/* الأوزان المعيارية */}
        <div className="xl:col-span-2 p-5">
          <div className="grid grid-cols-2 md:grid-cols-8 mb-5">
            {standardWeights.map((k) => (
              <div key={k.label} className="text-center">
                <p
                  className="text-[9px] leading-tight mb-1 whitespace-pre-line"
                  style={{ color: "var(--text-muted)" }}
                >
                  {k.label}
                </p>
                <p
                  className="text-xl font-bold"
                  style={{ color: "var(--accent-blue)" }}
                >
                  {k.value}
                </p>
              </div>
            ))}
          </div>

          {/* جدول الفروع المرجّح */}
          <div className="overflow-x-auto">
            <AnalyticsTable headers={[...weightedBranchSchedule]}>
              <BranchPerformanceTableRows />
            </AnalyticsTable>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchPerformanceEvaluation;
