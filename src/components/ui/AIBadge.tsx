"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface AIBadgeProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  confidence?: number;
}

export default function AIBadge({
  label = "AI Powered",
  size = "sm",
  confidence,
}: AIBadgeProps) {
  const sizes = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-3 py-1 gap-1.5",
    lg: "text-sm px-4 py-1.5 gap-2",
  };

  const iconSizes = { sm: 10, md: 14, lg: 16 };

  return (
    <motion.div
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider ${sizes[size]}`}
      style={{
        background: "rgba(0, 212, 255, 0.1)",
        color: "#00d4ff",
        border: "1px solid rgba(0, 212, 255, 0.25)",
        boxShadow: "0 0 12px rgba(0, 212, 255, 0.1)",
      }}
      animate={{
        boxShadow: [
          "0 0 12px rgba(0,212,255,0.1)",
          "0 0 20px rgba(0,212,255,0.2)",
          "0 0 12px rgba(0,212,255,0.1)",
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <Brain size={iconSizes[size]} />
      {label}
      {confidence !== undefined && (
        <span className="ml-1 opacity-70">{confidence}%</span>
      )}
    </motion.div>
  );
}
