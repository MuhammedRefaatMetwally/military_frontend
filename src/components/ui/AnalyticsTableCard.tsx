"use client";

import React from "react";
import {
  ChartTitleFlagBadge,
  type ChartCardTitleFlag,
} from "@/components/ui/ChartTitleFlagBadge";

export default function AnalyticsTableCard({
  title,
  flag,
  aiModule = false,
  subtitles,
  headerExtra,
  children,
  titleFlagNumber,
  footer,
}: {
  title: string;
  /** لون الشارة؛ الافتراضي أخضر. مرّر `false` لإخفاء الشارة. */
  flag?: ChartCardTitleFlag | false;
  /** شريط علوي متدرج (نمط `.ai-module` في globals.css) — صفحات التحليل/الذكاء. */
  aiModule?: boolean;
  /** One or many lines under the title (keeps same typography as existing tables). */
  subtitles?: React.ReactNode;
  /** Optional content inside the header block (e.g. legends). */
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  /** Optional strip under the table (pagination, totals, …). */
  footer?: React.ReactNode;
  titleFlagNumber?: number;
}) {
  return (
    <div
      className={`glass-panel overflow-hidden${aiModule ? " ai-module" : ""}`}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div>
          <div className="flex items-center gap-2">
            {flag !== false && (
              <ChartTitleFlagBadge
                flag={flag ?? "green"}
                size="sm"
                flagNumber={titleFlagNumber}
              />
            )}
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h3>
          </div>
          {subtitles}
        </div>
        {headerExtra}
      </div>
      <div className="overflow-x-auto">{children}</div>
      {footer}
    </div>
  );
}
