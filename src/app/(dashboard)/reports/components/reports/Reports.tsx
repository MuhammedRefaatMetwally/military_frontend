import { getReportJobs } from "@/lib/mockData";
import { statusConfig } from "./data";

import ReportCard from "./components/ReportCard";

const reports = getReportJobs();

const Reports = () => {
  return (
    <div className="space-y-3">
      {reports.map((report, i) => {
        const cfg = statusConfig[report.status];
        const StatusIcon = cfg.icon;

        return (
          <ReportCard
            key={report.id}
            report={report}
            i={i}
            cfg={cfg}
            StatusIcon={StatusIcon}
          />
        );
      })}
    </div>
  );
};

export default Reports;
