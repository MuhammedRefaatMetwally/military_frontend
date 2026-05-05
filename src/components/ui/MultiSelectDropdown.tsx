import { useClickOutside } from "@/hooks/useClickOutside";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

export function MultiSelectDropdown({
  icon: Icon,
  label,
  selectedValues,
  options,
  onChange,
  accent = "var(--accent-green)",
  manyLabel,
}: {
  icon: React.ElementType;
  label: string;
  selectedValues: string[];
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
  accent?: string;
  manyLabel: (count: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  const allOption = options[0];
  const rest = options.slice(1);
  const isDefault = selectedValues.length === 0;

  const display = (() => {
    if (isDefault) return allOption.label;
    if (selectedValues.length === 1) {
      return rest.find((o) => o.value === selectedValues[0])?.label ?? label;
    }
    return manyLabel(selectedValues.length);
  })();

  const isChanged = !isDefault;

  const toggle = (value: string) => {
    if (value === allOption.value) {
      onChange([]);
      return;
    }
    const set = new Set(selectedValues);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    onChange([...set]);
  };

  const rowSelected = (value: string) =>
    value === allOption.value ? isDefault : selectedValues.includes(value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: isChanged
            ? `color-mix(in srgb, ${accent} 15%, transparent)`
            : "var(--bg-elevated)",
          border: `1px solid ${isChanged ? accent : "var(--border-subtle)"}`,
          color: isChanged ? accent : "var(--text-secondary)",
          whiteSpace: "nowrap",
          maxWidth: 240,
        }}
      >
        <Icon size={12} style={{ color: accent, flexShrink: 0 }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {display}
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
            className="z-1050"
            transition={{ duration: 0.13 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              right: 0,
              zIndex: 2050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,.4)",
              minWidth: 200,
              maxHeight: 280,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {options.map((o) => {
              const sel = rowSelected(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className="w-full text-right px-3 py-2 text-[11px] transition-colors hover:bg-white/5 flex items-center justify-between gap-2"
                  style={{
                    color: sel ? accent : "var(--text-secondary)",
                    fontWeight: sel ? 700 : 400,
                  }}
                >
                  <span className="min-w-0 flex-1">{o.label}</span>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: `1.5px solid ${sel ? accent : "var(--border-subtle)"}`,
                      background: sel
                        ? `color-mix(in srgb, ${accent} 22%, transparent)`
                        : "transparent",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {sel && (
                      <Check
                        size={12}
                        strokeWidth={3}
                        style={{ color: accent }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
