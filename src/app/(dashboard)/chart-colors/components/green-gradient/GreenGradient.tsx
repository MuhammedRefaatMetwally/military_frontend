import {
  DEFAULT_ANALYTICS_PALETTE,
  GREEN_SCALE_STEP_LABELS_AR,
  type AnalyticsPalette,
} from "@/lib/colors";
import type { AnalyticsPaletteState } from "@/store/analyticsPaletteStore";
import { normalizeHexInput } from "../../utils/normalizeHexInput";

type GreenGradientProps = {
  merged: AnalyticsPalette;
  setGreenScaleStep: AnalyticsPaletteState["setGreenScaleStep"];
};

const GreenGradient = ({ merged, setGreenScaleStep }: GreenGradientProps) => {
  return (
    <div className="glass-panel p-5 space-y-5">
      <h2
        className="text-sm font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        تدرج الأخضر (خريطة حرارية ومتسلسلات)
      </h2>
      <div className="space-y-4">
        {GREEN_SCALE_STEP_LABELS_AR.map((labelAr, i) => {
          const value =
            merged.greenScale[i] ?? DEFAULT_ANALYTICS_PALETTE.greenScale[i];
          const def = DEFAULT_ANALYTICS_PALETTE.greenScale[i];
          return (
            <div key={i} className="space-y-2">
              <label
                className="block text-[11px] font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {labelAr}
              </label>
              <div className="flex flex-wrap items-center gap-2" dir="ltr">
                <input
                  type="color"
                  value={value.length === 7 ? value : def}
                  onChange={(e) => setGreenScaleStep(i, e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border p-0.5"
                  style={{
                    borderColor: "var(--border-default)",
                    background: "var(--bg-input)",
                  }}
                  aria-label={labelAr}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    setGreenScaleStep(i, normalizeHexInput(e.target.value))
                  }
                  className="flex-1 min-w-30 px-2 py-1.5 rounded-md text-xs font-mono"
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  spellCheck={false}
                />
                <span
                  className="text-[10px] shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  افتراضي: {def}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GreenGradient;
