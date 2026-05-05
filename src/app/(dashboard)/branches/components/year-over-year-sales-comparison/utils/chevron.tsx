import { ChevronDown, ChevronLeft } from "lucide-react";

export function chevron(open: boolean) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: 14,
        height: 14,
        borderRadius: 3,
        background: open ? "rgba(37,99,235,0.12)" : "var(--bg-elevated)",
      }}
    >
      {open ? (
        <ChevronDown size={10} style={{ color: "var(--accent-blue)" }} />
      ) : (
        <ChevronLeft size={10} style={{ color: "var(--text-muted)" }} />
      )}
    </span>
  );
}
