import type { AnalyticsPalette } from "@/lib/colors";
import type { AnalyticsPaletteState } from "@/store/analyticsPaletteStore";
import { RotateCcw } from "lucide-react";
import { useMemo } from "react";

type QuickPreviewProps = {
  merged: AnalyticsPalette;
  onReset: AnalyticsPaletteState["reset"];
};

const QuickPreview = ({ merged, onReset }: QuickPreviewProps) => {
  const previewPrimaries = useMemo(
    () => [
      merged.primaryGreen,
      merged.primaryCyan,
      merged.primaryIndigo,
      merged.primaryAmber,
      merged.primarySlate,
      merged.primaryBlue,
      merged.primaryRed,
      merged.primaryPurple,
    ],
    [merged],
  );

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          معاينة سريعة
        </h2>
        <button
          type="button"
          onClick={() => onReset()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <RotateCcw size={14} />
          استعادة الافتراضي
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {previewPrimaries.map((c, i) => (
          <div
            key={i}
            title={c}
            className="rounded-md border shrink-0"
            style={{
              width: 36,
              height: 36,
              background: c,
              borderColor: "var(--border-default)",
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {merged.greenScale.map((c, i) => (
          <div
            key={i}
            title={c}
            className="h-8 flex-1 min-w-10 max-w-18 rounded border"
            style={{ background: c, borderColor: "var(--border-subtle)" }}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickPreview;
