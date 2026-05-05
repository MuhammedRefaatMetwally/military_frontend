import { motion } from "framer-motion";

import { Calendar, DollarSign, Percent, TrendingUp } from "lucide-react";
import { useState } from "react";

const totalP1 = 68000;
const totalP2 = 177000;
const salesChange = totalP2 - totalP1;
const salesChangePct = ((salesChange / totalP1) * 100).toFixed(2);

const TimeCompareStats = () => {
  const [period1] = useState({ from: "2020-02-17", to: "2021-01-27" });
  const [period2] = useState({ from: "2021-11-08", to: "2023-08-23" });
  return (
    <div className="glass-panel p-4">
      <div className="flex flex-wrap items-center gap-6 mb-4">
        {/* الفترة 1 */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2 py-1 rounded"
            style={{
              background: "rgba(4,120,87,0.1)",
              color: "var(--accent-green)",
            }}
          >
            الفترة 1
          </span>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Calendar size={12} style={{ color: "var(--text-muted)" }} />
            <span
              className="text-[11px] font-semibold"
              style={{ color: "var(--text-secondary)" }}
              dir="ltr"
            >
              {period1.from}
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              إلى
            </span>
            <span
              className="text-[11px] font-semibold"
              style={{ color: "var(--text-secondary)" }}
              dir="ltr"
            >
              {period1.to}
            </span>
          </div>
        </div>
        {/* الفترة 2 */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2 py-1 rounded"
            style={{
              background: "rgba(37,99,235,0.1)",
              color: "var(--accent-blue)",
            }}
          >
            الفترة 2
          </span>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Calendar size={12} style={{ color: "var(--text-muted)" }} />
            <span
              className="text-[11px] font-semibold"
              style={{ color: "var(--text-secondary)" }}
              dir="ltr"
            >
              {period2.from}
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              إلى
            </span>
            <span
              className="text-[11px] font-semibold"
              style={{ color: "var(--text-secondary)" }}
              dir="ltr"
            >
              {period2.to}
            </span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "صافي المبيعات الفترة 1",
            value: "68K",
            color: "var(--accent-green)",
            icon: DollarSign,
          },
          {
            label: "صافي المبيعات الفترة 2",
            value: "177K",
            color: "var(--accent-blue)",
            icon: DollarSign,
          },
          {
            label: "التغير في المبيعات",
            value: "109K",
            color: "var(--accent-cyan)",
            icon: TrendingUp,
          },
          {
            label: "% التغير في المبيعات",
            value: `${salesChangePct}%`,
            color: "var(--accent-amber)",
            icon: Percent,
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-lg"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <k.icon size={12} style={{ color: k.color }} />
              <span
                className="text-[9px] font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                {k.label}
              </span>
            </div>
            <p
              className="text-xl font-bold"
              style={{ color: k.color }}
              dir="ltr"
            >
              {k.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TimeCompareStats;
