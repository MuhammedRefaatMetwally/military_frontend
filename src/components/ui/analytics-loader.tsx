"use client";

import { motion } from "framer-motion";

interface AnalyticsLoaderProps {
  title?: string;
  variant?: "default" | "compact" | "fullscreen";
}

function CircularSpinner({ size = 40 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: "3px solid var(--border-subtle)" }}
      />
      {/* Spinning arc */}
      <svg className="absolute inset-0" viewBox="0 0 40 40">
        <motion.circle
          cx="20"
          cy="20"
          r="17"
          fill="none"
          stroke="url(#loaderGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="80 106"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transformOrigin: "center" }}
        />
        <defs>
          <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-green)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function AnalyticsLoader({
  title = "جاري تحميل البيانات",
  variant = "default",
}: AnalyticsLoaderProps) {
  // Compact variant - small centered loader box, doesn't cover the whole chart
  if (variant === "compact") {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex flex-col items-center justify-center gap-2 rounded-xl px-6 py-4"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <CircularSpinner size={32} />
          <span
            className="text-xs font-medium whitespace-nowrap"
            style={{ color: "var(--text-secondary)" }}
          >
            {title}
          </span>
        </motion.div>
      </div>
    );
  }

  // Fullscreen variant - for page transitions
  if (variant === "fullscreen") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 backdrop-blur-md"
        style={{ background: "var(--bg-primary)", opacity: 0.98 }}
      >
        <CircularSpinner size={56} />
        <span
          className="text-base font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </span>
      </motion.div>
    );
  }

  // Default variant - standalone card-style loader
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass-panel rounded-xl flex flex-col items-center justify-center gap-4 py-16 px-8"
    >
      <CircularSpinner size={48} />
      <span
        className="text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {title}
      </span>
    </motion.div>
  );
}

export default AnalyticsLoader;
