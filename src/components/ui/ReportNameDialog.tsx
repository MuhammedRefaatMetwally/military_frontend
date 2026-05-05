import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileBarChart2 } from "lucide-react";

export function ReportNameDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleConfirm = () => {
    const finalName = name.trim() || "تقرير مخصص";
    onConfirm(finalName);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background: "rgba(5,9,18,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 400,
          boxShadow:
            "0 20px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(0,229,160,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(0,229,160,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(0,229,160,0.25)",
              flexShrink: 0,
            }}
          >
            <FileBarChart2 size={17} style={{ color: "var(--accent-green)" }} />
          </div>
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              إنشاء تقرير جديد
            </p>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>
              سمّ التقرير ليسهل تتبّعه لاحقًا
            </p>
          </div>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            اسم التقرير
          </label>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
              if (e.key === "Escape") onCancel();
            }}
            placeholder="مثال: تقرير مبيعات الربع الأول 2025"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: 13,
              outline: "none",
              direction: "rtl",
              transition: "border-color .2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent-green)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-subtle)";
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px",
              borderRadius: 9,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "8px 20px",
              borderRadius: 9,
              background: "var(--btn-primary-bg)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "var(--btn-primary-shadow)",
            }}
          >
            <FileBarChart2 size={13} /> بدء الإنشاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
