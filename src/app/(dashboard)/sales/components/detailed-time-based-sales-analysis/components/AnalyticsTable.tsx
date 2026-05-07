"use client";

import React from "react";

export type AnalyticsTableHeader = {
  label: React.ReactNode;
  align?: "right" | "center" | "left";
  width?: number | string;
};

export function AnalyticsTable({
  headers,
  thead,
  children,
  minWidth,
}: {
  headers: AnalyticsTableHeader[];
  thead?: React.ReactNode;
  children: React.ReactNode;
  minWidth?: number | string;
}) {
  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
      }}
    >
      <table
        dir="rtl"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          ...(minWidth ? { minWidth } : {}),
        }}
      >
        <thead>
          {thead ?? (
            <tr
              style={{
                background: "var(--bg-elevated)",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              {headers.map((h, i) => (
                <th
                  key={`${i}`}
                  style={{
                    padding: "9px 12px",
                    textAlign: h.align ?? "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                    ...(h.width ? { width: h.width } : {}),
                  }}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          )}
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function analyticsTdBaseStyle(
  align: "right" | "center" | "left" = "center",
): React.CSSProperties {
  return {
    padding: "7px 12px",
    textAlign: align,
    borderBottom: "1px solid var(--border-subtle)",
    whiteSpace: "nowrap",
  };
}

/** Inner bar + label. Use inside a `position: relative` cell. */
export function AnalyticsBarCellContent({
  value,
  max,
  color,
  text,
}: {
  value: number;
  max: number;
  color: string;
  text: string;
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 4,
          top: "50%",
          transform: "translateY(-50%)",
          width: `${Math.max(2, (value / Math.max(1, max)) * 85)}%`,
          height: 16,
          background: color,
          opacity: 0.25,
          borderRadius: 3,
        }}
      />

      <span
        style={{
          position: "relative",
          fontSize: 10,
          fontWeight: 600,
          color: "var(--text-secondary)",
        }}
        dir="ltr"
      >
        {text}
      </span>
    </>
  );
}

export function AnalyticsBarCell({
  value,
  max,
  color,
  text,
}: {
  value: number;
  max: number;
  color: string;
  text: string;
}) {
  return (
    <td
      style={{
        ...analyticsTdBaseStyle("center"),
        position: "relative",
      }}
    >
      <AnalyticsBarCellContent
        value={value}
        max={max}
        color={color}
        text={text}
      />
    </td>
  );
}
