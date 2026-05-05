import {
  ANALYTICS_PRIMARY_FIELD_META,
  DEFAULT_ANALYTICS_PALETTE,
  type AnalyticsPalette,
} from "@/lib/colors";
import type { AnalyticsPaletteState } from "@/store/analyticsPaletteStore";
import { normalizeHexInput } from "../../utils/normalizeHexInput";

type PrimaryColorsProps = {
  merged: AnalyticsPalette;
  setField: AnalyticsPaletteState["setField"];
};

const PrimaryColors = ({ merged, setField }: PrimaryColorsProps) => {
  return (
    <div className="glass-panel p-5 space-y-6">
      <h2
        className="text-sm font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        الألوان الأساسية
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ANALYTICS_PRIMARY_FIELD_META.map(({ key, labelAr }) => {
          const value = merged[key];
          const def = DEFAULT_ANALYTICS_PALETTE[key];
          return (
            <div key={key} className="space-y-2">
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
                  onChange={(e) => setField(key, e.target.value)}
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
                    setField(key, normalizeHexInput(e.target.value))
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

export default PrimaryColors;
