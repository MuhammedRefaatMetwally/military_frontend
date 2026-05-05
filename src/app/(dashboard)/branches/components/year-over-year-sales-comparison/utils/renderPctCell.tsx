import { pct } from "../yearOverYearComparison";

export function renderPctCell(ac: number, py: number, small: boolean) {
  const p = pct(ac, py);
  return (
    <div className="flex items-center justify-center gap-1" dir="ltr">
      <span
        className={
          small ? "text-[10px] font-semibold" : "text-[11px] font-bold"
        }
        style={{
          color: p >= 0 ? "var(--accent-green)" : "var(--accent-red)",
        }}
      >
        {p >= 0 ? "+" : ""}
        {p.toFixed(1)}
      </span>
      <span
        style={{
          width: small ? 5 : 6,
          height: small ? 5 : 6,
          borderRadius: "50%",
          background: p >= 0 ? "var(--accent-green)" : "var(--accent-red)",
          display: "inline-block",
        }}
      />
    </div>
  );
}
