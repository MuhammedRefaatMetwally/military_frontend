import { motion, AnimatePresence } from "framer-motion";
import type React from "react";
import {
  ChartCardTitleFlag,
  ChartTitleFlagBadge,
} from "../ChartTitleFlagBadge";
import { X } from "lucide-react";

interface FullScreenChartProps {
  isDark: boolean;
  toggleFullscreen: () => void;
  showTitleBlock: boolean;
  titleLeading?: React.ReactNode;
  titleFlag?: ChartCardTitleFlag;
  titleFlagNumber?: number;
  title: string;
  subtitle?: string;
  headerExtra?: React.ReactNode;
  setIsFullscreen: (isFullscreen: boolean) => void;
  chartEl: React.ReactNode;
}

const FullScreenChart = ({
  isDark,
  toggleFullscreen,
  showTitleBlock,
  titleLeading,
  titleFlag,
  titleFlagNumber,
  title,
  subtitle,
  headerExtra,
  setIsFullscreen,
  chartEl,
}: FullScreenChartProps) => {
  return (
    <AnimatePresence>
      <motion.div
        key="fs-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: isDark ? "rgba(5,9,18,0.85)" : "rgba(15,23,42,0.5)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px",
        }}
        onClick={toggleFullscreen}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-panel overflow-hidden"
          style={{
            width: "min(96vw, 1600px)",
            height: "min(92vh, calc(100dvh - 24px))",
            maxHeight: "96vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className={`flex items-center px-6 py-3 border-b gap-3 ${showTitleBlock ? "justify-between" : "justify-end"}`}
            style={{ borderColor: "var(--border-subtle)", flexShrink: 0 }}
          >
            {showTitleBlock && (
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  {titleLeading}
                  {titleFlag && (
                    <ChartTitleFlagBadge
                      flag={titleFlag}
                      flagNumber={titleFlagNumber}
                      size="lg"
                    />
                  )}
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {title}
                  </h2>
                </div>
                {subtitle && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 shrink-0">
              {headerExtra}
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg transition-all hover:scale-110"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            >
              {chartEl}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullScreenChart;
