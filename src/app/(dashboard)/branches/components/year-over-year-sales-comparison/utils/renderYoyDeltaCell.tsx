import { analyticsTdBaseStyle } from "@/components/ui/AnalyticsTable";
import { fmtDelta, maxAbsDelta } from "../yearOverYearComparison";

export function renderYoyDeltaCell(delta: number) {
  const value = Math.abs(delta);
  const color = delta >= 0 ? "var(--accent-green)" : "rgb(239, 68, 68)";
  const text = fmtDelta(delta);
  const isPositive = delta >= 0;
  const widthPct = Math.max(2, (value / Math.max(1, maxAbsDelta)) * 50);

  return (
    <td
      style={{
        ...analyticsTdBaseStyle("center"),
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: isPositive ? "translateY(-50%)" : "translate(-100%, -50%)",
          height: 16,
          background: color,
          borderRadius: 3,
          width: `${widthPct}%`,
          opacity: 0.22,
        }}
      />
      <div
        style={{
          position: "relative",
          fontSize: 10,
          fontWeight: 600,
          color: "var(--text-secondary)",
        }}
        dir="ltr"
      >
        {text}
      </div>
    </td>
  );
}
