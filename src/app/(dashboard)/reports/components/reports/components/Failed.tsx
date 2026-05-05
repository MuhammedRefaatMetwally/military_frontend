import { RefreshCw } from "lucide-react";

const Failed = () => {
  return (
    <button
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
      style={{
        background: "rgba(220,38,38,0.1)",
        color: "var(--accent-red)",
        border: "1px solid rgba(220,38,38,0.2)",
      }}
    >
      <RefreshCw size={12} /> إعادة المحاولة
    </button>
  );
};

export default Failed;
