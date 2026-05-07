/**
 * AccordionLabelCell - Expandable label cell with hierarchical indentation
 */

import { ChevronDown } from "lucide-react";
import { analyticsTdBaseStyle } from "@/components/ui/AnalyticsTable";

interface AccordionLabelCellProps {
  label: string;
  subtitle?: string;
  depth: 0 | 1 | 2;
  isOpen?: boolean;
  canExpand?: boolean;
  onToggle?: () => void;
}

export function AccordionLabelCell({
  label,
  subtitle,
  depth,
  isOpen,
  canExpand,
  onToggle,
}: AccordionLabelCellProps) {
  const paddingRight = 12 + depth * 22;

  return (
    <td
      style={{
        ...analyticsTdBaseStyle("right"),
        paddingRight,
        fontSize: 11,
        fontWeight: depth === 0 ? 800 : depth === 1 ? 700 : 600,
        color: depth === 0 ? "var(--text-primary)" : "var(--text-secondary)",
      }}
    >
      {canExpand ? (
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1.5"
          style={{
            border: 0,
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            color: "inherit",
            font: "inherit",
          }}
          aria-expanded={isOpen}
          aria-label={`Toggle ${label}`}
        >
          <ChevronDown
            size={14}
            style={{
              transition: "transform 160ms ease",
              transform: isOpen ? "rotate(0deg)" : "rotate(90deg)",
            }}
          />
          <span>{label}</span>
          {subtitle && (
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </span>
          )}
        </button>
      ) : (
        <div className="inline-flex items-center gap-1.5">
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 999,
              background: "var(--text-muted)",
              display: "inline-block",
              opacity: 0.65,
            }}
          />
          <span>{label}</span>
          {subtitle && (
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </td>
  );
}
