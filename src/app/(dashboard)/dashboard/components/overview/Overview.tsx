import { getArabicDate } from "@/utils/getArabicDate";
import { Calendar } from "lucide-react";

const Overview = () => {
  return (
    <div>
      <h1
        className="text-xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        نظرة عامة على مركز القيادة
      </h1>
      <div className="flex items-center gap-3 mt-1">
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <Calendar size={13} />
          {getArabicDate()}
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--accent-green)" }}
          />
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--accent-green)" }}
          >
            بيانات مباشرة
          </span>
        </div>
      </div>
    </div>
  );
};

export default Overview;
