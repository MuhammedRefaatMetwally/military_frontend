/**
 * Breadcrumb - Navigation breadcrumb for drill-down levels
 */

import { type LevelType, type QuarterType, QUARTER_SHORT } from "../utils/date-based-sales.constants";

interface BreadcrumbProps {
  level: LevelType;
  drillYear: number | null;
  drillQuarter: QuarterType | null;
  onNavigate: (l: LevelType) => void;
  accentColor: string;
}

export function Breadcrumb({
  level,
  drillYear,
  drillQuarter,
  onNavigate,
  accentColor,
}: BreadcrumbProps) {
  if (level === "year") return null;

  const crumbs: { label: string; level: LevelType }[] = [
    { label: "سنوي", level: "year" },
  ];

  if (drillYear !== null) {
    crumbs.push({ label: String(drillYear), level: "quarter" });
  }

  if (level === "month" && drillQuarter !== null) {
    crumbs.push({ label: QUARTER_SHORT[drillQuarter], level: "month" });
  }

  return (
    <div
      className="flex items-center gap-1"
      dir="ltr"
      style={{
        padding: "3px 8px",
        borderRadius: 6,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        fontSize: 10,
      }}
    >
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={crumb.level} className="flex items-center gap-1">
            {idx > 0 && (
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: 9,
                  opacity: 0.6,
                }}
              >
                ›
              </span>
            )}
            <button
              type="button"
              onClick={() => !isLast && onNavigate(crumb.level)}
              style={{
                color: isLast ? accentColor : "var(--text-muted)",
                fontWeight: isLast ? 600 : 400,
                cursor: isLast ? "default" : "pointer",
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 10,
              }}
              aria-current={isLast ? "page" : undefined}
            >
              {crumb.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}
