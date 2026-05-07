/**
 * SubPeriodRow - Toggle controls for quarters and months
 */

import {
  type LevelType,
  type QuarterType,
  ARABIC_MONTHS_SHORT,
  QUARTER_LABELS,
} from "../utils/date-based-sales.constants";

interface SubPeriodRowProps {
  level: LevelType;
  selectedQuarters: QuarterType[];
  toggleQuarter: (q: QuarterType) => void;
  selectedMonths: number[];
  toggleMonth: (m: number) => void;
  accentColor: string;
  disabled: boolean;
  drillYear: number | null;
  drillQuarter: QuarterType | null;
}

export function SubPeriodRow({
  level,
  selectedQuarters,
  toggleQuarter,
  selectedMonths,
  toggleMonth,
  accentColor,
  disabled,
}: SubPeriodRowProps) {
  if (level === "year") return null;

  const getStyle = (active: boolean) => ({
    background: active ? `${accentColor}25` : "var(--bg-elevated)",
    color: active ? accentColor : "var(--text-muted)",
    border: `1px solid ${active ? accentColor : "var(--border-subtle)"}`,
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap" as const,
    transition: "all .15s",
    opacity: disabled ? 0.5 : 1,
  });

  if (level === "quarter") {
    return (
      <div className="flex items-center gap-1 flex-wrap justify-end">
        <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
          الفترة:
        </span>
        {([1, 2, 3, 4] as QuarterType[]).map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => toggleQuarter(q)}
            style={getStyle(selectedQuarters.includes(q))}
            aria-pressed={selectedQuarters.includes(q)}
          >
            {QUARTER_LABELS[q]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap justify-end">
      <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
        الشهر:
      </span>
      {ARABIC_MONTHS_SHORT.map((label, idx) => {
        const m = idx + 1;
        return (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => toggleMonth(m)}
            style={getStyle(selectedMonths.includes(m))}
            aria-pressed={selectedMonths.includes(m)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
