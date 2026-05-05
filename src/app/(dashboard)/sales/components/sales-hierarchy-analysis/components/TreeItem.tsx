import { secondarySalesMetric } from "../utils/data";
import { motion } from "framer-motion";
import { LeadArrowIcon } from "../utils/LeadArrowIcon";

interface TreeNode {
  id: string;
  label: string;
  labelEn?: string;
  value: number;
  children?: TreeNode[];
}

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
  /** سهم قبل العنصر المحدد فقط (وليس بعد العمود). */
  showLeadArrow: boolean;
}) {
  const pct = Math.round((node.value / max) * 100);
  const sec = secondarySalesMetric(node);
  const pct2 = maxSecondary > 0 ? Math.round((sec / maxSecondary) * 100) : 0;
  const greenBar = selected ? "#16a34a" : "#22c55e";
  const greenMuted = selected ? "#15803d" : "var(--accent-green)";
  const btn = (
    <button
      type="button"
      onClick={onClick}
      className={`text-right transition-all rounded-md p-2 ${showLeadArrow ? "flex-1 min-w-0" : "w-full"} mb-0`}
      style={{
        background: selected ? "rgba(37,99,235,0.12)" : "transparent",
        border: `1px solid ${selected ? "#2563eb" : "transparent"}`,
      }}
    >
      <p
        className="text-[11px] font-medium leading-tight text-right truncate max-w-35 mb-1.5"
        style={{
          color: selected ? "var(--accent-blue)" : "var(--text-secondary)",
        }}
      >
        {node.label}
      </p>
      <div
        className="mb-1.5 h-1.25 rounded-full overflow-hidden"
        style={{ background: "var(--bg-elevated)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: selected ? "#2563eb" : "#3b82f6" }}
        />
      </div>
      <p
        className="text-[11px] font-semibold mt-0.5"
        style={{ color: "var(--accent-blue)" }}
        dir="ltr"
      >
        {node.value.toLocaleString("en-US")}
      </p>
      <div
        className="mt-1.5 h-1.25 rounded-full overflow-hidden"
        style={{ background: "var(--bg-elevated)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct2}%` }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="h-full rounded-full"
          style={{ background: greenBar }}
        />
      </div>
      <p
        className="text-[11px] font-semibold mt-0.5"
        style={{ color: greenMuted }}
        dir="ltr"
      >
        {sec.toLocaleString("en-US")}
      </p>
    </button>
  );

  if (!showLeadArrow) {
    return <div className="mb-1 w-full">{btn}</div>;
  }

  return (
    <div className="flex items-center gap-1 w-full mb-1" dir="ltr">
      <span
        className="shrink-0 flex items-center self-center pointer-events-none pl-0.5"
        style={{ color: "rgba(37,99,235,0.85)" }}
      >
        <LeadArrowIcon />
      </span>
      {btn}
    </div>
  );
}
