import { GroupLevel } from "../utils/classification.constants";

interface BreadcrumbProps {
  drillStack: { level: GroupLevel; name: string }[];
  onNavigate: (toIndex: number) => void;
  accentColor: string;
}

export function Breadcrumb({
  drillStack,
  onNavigate,
  accentColor,
}: BreadcrumbProps) {
  if (drillStack.length === 0) return null;

  // Build crumbs: root + each drill step
  const crumbs = [
    { label: "المجموعة الأولى", index: -1 },
    ...drillStack.map((d, i) => ({ label: d.name, index: i })),
  ];

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
          <span key={idx} className="flex items-center gap-1">
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
              onClick={() => !isLast && onNavigate(crumb.index)}
              style={{
                color: isLast ? accentColor : "var(--text-muted)",
                fontWeight: isLast ? 600 : 400,
                cursor: isLast ? "default" : "pointer",
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 10,
                transition: "color .15s",
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              className={!isLast ? "hover:opacity-80" : ""}
            >
              {crumb.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}
