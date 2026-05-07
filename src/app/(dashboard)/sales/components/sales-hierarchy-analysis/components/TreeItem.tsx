import { secondarySalesMetric } from "../utils/data";
import { motion } from "framer-motion";
import { LeadArrowIcon } from "./LeadArrowIcon";

interface TreeNode {
  id: string;
  label: string;
  labelEn?: string;
  value: number;
  profit?: number;
  children?: TreeNode[];
}

const formatCompact = (v: number) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
    ? `${(v / 1_000).toFixed(0)}K`
    : v.toLocaleString("en-US");

export function TreeItem({
  node,
  max,
  maxSecondary,
  selected,
  onClick,
  showLeadArrow,
}: {
  node: TreeNode;
  max: number;
  maxSecondary: number;
  selected: boolean;
  onClick: () => void;
  showLeadArrow: boolean;
}) {
  const pct  = max > 0 ? Math.min(100, Math.round((node.value / max) * 100)) : 0;
  const sec  = secondarySalesMetric(node);
  const pct2 = maxSecondary > 0 ? Math.min(100, Math.round((sec / maxSecondary) * 100)) : 0;

  const isNegativeProfit = sec < 0;

  const profitColor = isNegativeProfit
    ? "var(--accent-red)"
    : selected
    ? "#15803d"
    : "var(--accent-green)";

  const profitBarColor = isNegativeProfit
    ? "#ef4444"
    : selected
    ? "#16a34a"
    : "#22c55e";

  const btn = (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-right transition-all rounded-lg p-2.5 ${showLeadArrow ? "flex-1 min-w-0" : "w-full"}`}
      style={{
        background: selected
          ? "rgba(37,99,235,0.1)"
          : "var(--bg-elevated)",
        border: `1px solid ${selected ? "rgba(37,99,235,0.35)" : "transparent"}`,
        // Slight left accent line when selected
        boxShadow: selected
          ? "inset 3px 0 0 #2563eb"
          : "none",
        outline: "none",
      }}
    >
      {/* Label row */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <p
          className="text-[11px] font-medium leading-tight"
          style={{
            color: selected ? "var(--accent-blue)" : "var(--text-primary)",
            // Clamp to 2 lines instead of hard truncate — shows more context
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
            flex: 1,
          }}
          title={node.label}
        >
          {node.label}
        </p>

        {/* Percentage badge */}
        {pct > 0 && (
          <span
            className="shrink-0 text-[9px] font-semibold px-1 py-0.5 rounded"
            style={{
              background: selected
                ? "rgba(37,99,235,0.15)"
                : "var(--bg-card)",
              color: selected ? "var(--accent-blue)" : "var(--text-muted)",
              lineHeight: 1,
              marginTop: 1,
            }}
          >
            {pct}%
          </span>
        )}
      </div>

      {/* Sales bar + value */}
      <div className="space-y-0.5 mb-2">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--bg-card)" }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: selected ? "#2563eb" : "#3b82f6" }}
          />
        </div>
        <p
          className="text-[10px] font-semibold tabular-nums"
          style={{ color: "var(--accent-blue)" }}
          dir="ltr"
        >
          {formatCompact(node.value)}
          <span
            className="font-normal ms-1"
            style={{ color: "var(--text-muted)", fontSize: 9 }}
          >
            مبيعات
          </span>
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "var(--border-subtle)",
          marginBottom: 8,
          opacity: 0.5,
        }}
      />

      {/* Profit bar + value */}
      <div className="space-y-0.5">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--bg-card)" }}
          role="progressbar"
          aria-valuenow={Math.abs(pct2)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.abs(pct2)}%` }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.06 }}
            className="h-full rounded-full"
            style={{ background: profitBarColor }}
          />
        </div>
        <p
          className="text-[10px] font-semibold tabular-nums"
          style={{ color: profitColor }}
          dir="ltr"
        >
          {isNegativeProfit && "−"}
          {formatCompact(Math.abs(sec))}
          <span
            className="font-normal ms-1"
            style={{ color: "var(--text-muted)", fontSize: 9 }}
          >
            ربح
          </span>
        </p>
      </div>
    </button>
  );

  if (!showLeadArrow) {
    return <div className="mb-1.5 w-full">{btn}</div>;
  }

  return (
    <div className="flex items-stretch gap-1 w-full mb-1.5" dir="ltr">
      <span
        className="shrink-0 flex items-center self-stretch pointer-events-none"
        style={{ color: "rgba(37,99,235,0.7)", paddingTop: 2 }}
      >
        <LeadArrowIcon />
      </span>
      {btn}
    </div>
  );
}