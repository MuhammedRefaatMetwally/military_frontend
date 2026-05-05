import { Download, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
type report = {
  id: string;
  name: string;
  formats: string[];
};
const Ready = ({ report }: { report: report }) => {
  const router = useRouter();
  return (
    <>
      <button
        onClick={() => router.push("/sales")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-secondary)",
        }}
      >
        <Eye size={12} /> عرض
      </button>
      {report.formats.map((f) => (
        <button
          key={f}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          <Download size={12} />
          {f.toUpperCase()}
        </button>
      ))}
    </>
  );
};

export default Ready;
