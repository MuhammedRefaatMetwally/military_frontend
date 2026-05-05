import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export function ReportCreatingPopup({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "var(--bg-panel)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 14,
        boxShadow: "0 12px 40px rgba(0,0,0,.5), 0 0 0 1px rgba(0,229,160,0.15)",
        padding: "16px 22px",
        minWidth: 340,
        maxWidth: 440,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "2px solid rgba(0,229,160,0.2)",
          borderTop: "2px solid var(--accent-green)",
          animation: "spin 0.8s linear infinite",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 2px",
          }}
        >
          جاري إنشاء التقرير…
        </p>
        {name && (
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--accent-green)",
              margin: "0 0 4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            📄 {name}
          </p>
        )}
        <p
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          سيتم إعلامك فور جهوز التقرير — يمكنك متابعة العمل
        </p>
        <div
          style={{
            marginTop: 8,
            height: 3,
            borderRadius: 3,
            background: "var(--bg-elevated)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.5, ease: "linear" }}
            style={{
              height: "100%",
              borderRadius: 3,
              background:
                "linear-gradient(90deg, var(--accent-green), var(--accent-cyan))",
            }}
          />
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          color: "var(--text-muted)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 4,
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
