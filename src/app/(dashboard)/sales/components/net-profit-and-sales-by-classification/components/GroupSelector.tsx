/**
 * GroupSelector - Radio button group for selecting classification level
 */

import { GROUP_OPTIONS, type GroupLevel } from "../utils/classification.constants";

interface GroupSelectorProps {
  value: GroupLevel;
  onChange: (v: GroupLevel) => void;
  disabled: boolean;
}

export function GroupSelector({
  value,
  onChange,
  disabled,
}: GroupSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      <span
        className="text-[10px] shrink-0 select-none"
        style={{ color: "var(--text-muted)" }}
        id="group-label"
      >
        التصنيف:
      </span>

      <div
        role="radiogroup"
        aria-labelledby="group-label"
        className="flex items-center gap-1 flex-wrap"
        onKeyDown={(e) => {
          const idx = GROUP_OPTIONS.findIndex((o) => o.value === value);
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(GROUP_OPTIONS[(idx + 1) % GROUP_OPTIONS.length].value);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(
              GROUP_OPTIONS[
                (idx - 1 + GROUP_OPTIONS.length) % GROUP_OPTIONS.length
              ].value,
            );
          }
        }}
      >
        {GROUP_OPTIONS.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              tabIndex={isActive ? 0 : -1}
              className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
              style={{
                background: isActive
                  ? "var(--accent-green-dim)"
                  : "var(--bg-elevated)",
                color: isActive ? "var(--accent-green)" : "var(--text-muted)",
                border: `1px solid ${isActive ? "var(--accent-green)" : "var(--border-subtle)"}`,
                outlineColor: "var(--accent-green)",
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {disabled && (
        <span
          aria-hidden
          className="text-[9px] animate-pulse ml-1"
          style={{ color: "var(--accent-green)" }}
        >
          ● ● ●
        </span>
      )}
    </div>
  );
}
