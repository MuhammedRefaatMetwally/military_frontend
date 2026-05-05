import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "@/hooks/useClickOutside";
import { QUICK_PERIODS } from "@/utils/filterUtils";
import { Calendar, ChevronDown } from "lucide-react";

export function DateFilterDropdown({
  activePeriod,
  setActivePeriod,
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  quickPeriodOptions = QUICK_PERIODS,
  /** صفحة /sales: وضع «فترة محددة» يستخدم حقول شهر/سنة. */
  useMonthRangePickers = false,
  /** عند اختيار فترة سريعة: تعبئة من/إلى (مثلاً صفحة المبيعات). */
  fillQuickPeriodDates,
  /** عند الفترة السريعة = شهر فقط (فروع): «فترة محددة» إما يوم أو شهر. */
  rangeGranularity = "month",
}: {
  activePeriod: string;
  setActivePeriod: (v: string) => void;
  dateFrom: string;
  dateTo: string;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  quickPeriodOptions?: { value: string; label: string }[];
  useMonthRangePickers?: boolean;
  fillQuickPeriodDates?: (value: string) => { from: string; to: string } | null;
  rangeGranularity?: "month" | "day";
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"quick" | "range">("quick");
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const label =
    mode === "range" && dateFrom
      ? `${dateFrom}${dateTo ? " → " + dateTo : ""}`
      : (quickPeriodOptions.find((p) => p.value === activePeriod)?.label ??
        "التاريخ");

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background:
            "color-mix(in srgb, var(--accent-green) 12%, transparent)",
          border: "1px solid var(--accent-green)",
          color: "var(--accent-green)",
          whiteSpace: "nowrap",
        }}
      >
        <Calendar size={12} style={{ color: "var(--accent-green)" }} />
        {label}
        <ChevronDown
          size={10}
          style={{
            opacity: 0.6,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              right: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              boxShadow: "0 8px 30px rgba(0,0,0,.45)",
              width: 240,
              overflow: "hidden",
            }}
          >
            {/* Tabs */}
            <div style={{ display: "flex", padding: "8px 8px 0", gap: 4 }}>
              {(["quick", "range"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-1.5 rounded-md text-[10px] font-semibold transition-all"
                  style={{
                    background:
                      mode === m
                        ? "rgba(0,229,160,0.12)"
                        : "var(--bg-elevated)",
                    color:
                      mode === m ? "var(--accent-green)" : "var(--text-muted)",
                    border: `1px solid ${mode === m ? "rgba(0,229,160,0.3)" : "var(--border-subtle)"}`,
                  }}
                >
                  {m === "quick" ? "⚡ سريع" : "📅 فترة محددة"}
                </button>
              ))}
            </div>
            <div style={{ padding: "8px" }}>
              {mode === "quick" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 4,
                  }}
                >
                  {quickPeriodOptions.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setActivePeriod(p.value);
                        const filled = fillQuickPeriodDates?.(p.value);
                        if (filled?.from && filled?.to) {
                          setDateFrom(filled.from);
                          setDateTo(filled.to);
                        } else {
                          setDateFrom("");
                          setDateTo("");
                        }
                        setOpen(false);
                      }}
                      className="py-2 rounded-lg text-[11px] font-medium transition-all hover:scale-[1.02]"
                      style={{
                        background:
                          activePeriod === p.value
                            ? "rgba(0,229,160,0.12)"
                            : "var(--bg-elevated)",
                        border: `1px solid ${activePeriod === p.value ? "var(--accent-green)" : "var(--border-subtle)"}`,
                        color:
                          activePeriod === p.value
                            ? "var(--accent-green)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {[
                    { label: "من", val: dateFrom, set: setDateFrom },
                    { label: "إلى", val: dateTo, set: setDateTo },
                  ].map((f, idx) => {
                    // /branches: نطاق باليوم
                    if (rangeGranularity === "day") {
                      return (
                        <div key={f.label}>
                          <label
                            style={{
                              fontSize: 9,
                              color: "var(--text-muted)",
                              display: "block",
                              marginBottom: 3,
                            }}
                          >
                            {f.label}
                          </label>
                          <input
                            type="date"
                            value={f.val}
                            onChange={(e) => f.set(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "5px 8px",
                              borderRadius: 7,
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-primary)",
                              fontSize: 11,
                              outline: "none",
                            }}
                          />
                        </div>
                      );
                    }

                    // /sales في «فترة محددة»: شهر/سنة فقط
                    if (useMonthRangePickers && rangeGranularity === "month") {
                      // Derive YYYY-MM for the month input from stored ISO date (if any)
                      const ym =
                        f.val && f.val.length >= 7 ? f.val.slice(0, 7) : "";

                      const handleMonthChange = (value: string) => {
                        if (!value) {
                          f.set("");
                          return;
                        }
                        const [yearStr, monthStr] = value.split("-");
                        const year = Number(yearStr);
                        const month = Number(monthStr); // 1-12
                        if (!year || !month) {
                          f.set("");
                          return;
                        }
                        if (idx === 0) {
                          // from: first day of month
                          f.set(`${yearStr}-${monthStr}-${"01"}`);
                        } else {
                          // to: last day of month
                          const lastDay = new Date(year, month, 0).getDate();
                          const dd = String(lastDay).padStart(2, "0");
                          f.set(`${yearStr}-${monthStr}-${dd}`);
                        }
                      };

                      return (
                        <div key={f.label}>
                          <label
                            style={{
                              fontSize: 9,
                              color: "var(--text-muted)",
                              display: "block",
                              marginBottom: 3,
                            }}
                          >
                            {f.label}
                          </label>
                          <input
                            type="month"
                            value={ym}
                            onChange={(e) => handleMonthChange(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "5px 8px",
                              borderRadius: 7,
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-primary)",
                              fontSize: 11,
                              outline: "none",
                            }}
                          />
                        </div>
                      );
                    }

                    // Default behaviour: full date
                    return (
                      <div key={f.label}>
                        <label
                          style={{
                            fontSize: 9,
                            color: "var(--text-muted)",
                            display: "block",
                            marginBottom: 3,
                          }}
                        >
                          {f.label}
                        </label>
                        <input
                          type="date"
                          value={f.val}
                          onChange={(e) => f.set(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "5px 8px",
                            borderRadius: 7,
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            fontSize: 11,
                            outline: "none",
                          }}
                        />
                      </div>
                    );
                  })}
                  {(dateFrom || dateTo) && (
                    <button
                      onClick={() => setOpen(false)}
                      style={{
                        padding: "6px 0",
                        borderRadius: 7,
                        background: "var(--btn-primary-bg)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      تطبيق
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
