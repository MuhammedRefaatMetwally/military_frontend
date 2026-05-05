"use client";

export type ChartCardTitleFlag = "green" | "blue" | "red";

const TITLE_FLAG_STYLES: Record<
  ChartCardTitleFlag,
  { background: string; borderColor: string }
> = {
  green: {
    background: "linear-gradient(180deg, #4ade80 0%, #16a34a 100%)",
    borderColor: "rgba(22,163,74,0.35)",
  },
  blue: {
    background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
    borderColor: "rgba(37,99,235,0.35)",
  },
  red: {
    background: "linear-gradient(180deg, #f87171 0%, #dc2626 100%)",
    borderColor: "rgba(220,38,38,0.35)",
  },
};

export function ChartTitleFlagBadge({
  flag,
  flagNumber,
  size,
}: {
  flag: ChartCardTitleFlag;
  flagNumber?: number;
  size: "sm" | "lg";
}) {
  const { background, borderColor } = TITLE_FLAG_STYLES[flag];
  const showNum =
    flagNumber !== undefined &&
    flagNumber !== null &&
    !Number.isNaN(flagNumber);
  const isSm = size === "sm";

  return (
    <span
      className={
        showNum
          ? `shrink-0 rounded border shadow-sm inline-flex items-center justify-center font-semibold tabular-nums text-white ${isSm ? "h-4.5 min-w-4.5 px-1 text-[9px]" : "h-5.5 min-w-5.5 px-1.5 text-[10px]"}`
          : `shrink-0 rounded-sm border shadow-sm ${isSm ? "h-2.5 w-3.5" : "h-3 w-4.5"}`
      }
      style={{
        background,
        borderColor,
        ...(showNum ? { textShadow: "0 1px 1px rgba(0,0,0,0.2)" } : {}),
      }}
      aria-hidden={!showNum}
      {...(showNum ? { "aria-label": String(flagNumber) } : {})}
    >
      {showNum ? flagNumber : null}
    </span>
  );
}
