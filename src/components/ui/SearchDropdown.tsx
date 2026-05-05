import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ChevronDown, Search } from "lucide-react";

export function SearchDropdown({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  accent = "#a855f7",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => {
    setOpen(false);
    setQ("");
  });
  const filtered = options.filter((o) => o.includes(q));
  const isSet = !!value;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: isSet
            ? `color-mix(in srgb, ${accent} 15%, transparent)`
            : "var(--bg-elevated)",
          border: `1px solid ${isSet ? accent : "var(--border-subtle)"}`,
          color: isSet ? accent : "var(--text-secondary)",
          whiteSpace: "nowrap",
          maxWidth: 140,
        }}
      >
        <Icon size={12} style={{ color: accent }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 90,
          }}
        >
          {value || label}
        </span>
        <ChevronDown
          size={10}
          style={{
            opacity: 0.6,
            flexShrink: 0,
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
            transition={{ duration: 0.13 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              left: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,.4)",
              width: 200,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "8px 8px 4px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: 7,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <Search
                  size={10}
                  style={{ color: "var(--text-muted)", flexShrink: 0 }}
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="بحث..."
                  autoFocus
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: 11,
                    color: "var(--text-primary)",
                    width: "100%",
                    direction: "rtl",
                  }}
                />
              </div>
            </div>
            <div style={{ maxHeight: 180, overflowY: "auto" }}>
              {value && (
                <button
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                    setQ("");
                  }}
                  className="w-full text-right px-3 py-1.5 text-[10px] transition-colors hover:bg-white/5 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  ✕ إلغاء الاختيار
                </button>
              )}
              {filtered.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                    setQ("");
                  }}
                  className="w-full text-right px-3 py-1.5 text-[11px] transition-colors hover:bg-white/5 block"
                  style={{
                    color: o === value ? accent : "var(--text-secondary)",
                    fontWeight: o === value ? 700 : 400,
                  }}
                >
                  {o}
                </button>
              ))}
              {filtered.length === 0 && (
                <p
                  style={{
                    padding: "8px 12px",
                    fontSize: 10,
                    color: "var(--text-muted)",
                  }}
                >
                  لا توجد نتائج
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
