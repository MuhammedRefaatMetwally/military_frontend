"use client";

import React from "react";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import {
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import { fmt, pct, yoyData, yoyKey } from "./yearOverYearComparison";
import { renderPctCell } from "./utils/renderPctCell";
import { chevron } from "./utils/chevron";
import { renderYoyDeltaCell } from "./utils/renderYoyDeltaCell";

type Props = {
  expandedCats: Record<string, boolean>;
  setExpandedCats: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
};

export default function YearOverYearSalesComparison({
  expandedCats,
  setExpandedCats,
}: Props) {
  return (
    <div className="glass-panel p-0 overflow-hidden">
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <ChartTitleFlagBadge flag="green" size="sm" />
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            مقارنة المبيعات: السنة الحالية مقابل السابقة
          </h3>
        </div>
        <p
          className="text-[10px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          تسلسل: سوق ← سنة ← ربع سنوي ← شهر — كل مستوى مغلق افتراضياً
        </p>
      </div>
      <div className="overflow-x-auto w-full min-w-0">
        <AnalyticsTable
          minWidth={780}
          headers={[
            {
              label: "سوق / سنة / ربع / شهر",
              align: "right",
              width: 160,
            },
            { label: "مبيعات العام الحالي", align: "center", width: 88 },
            { label: "مبيعات العام السابق", align: "center", width: 88 },
            { label: "الفرق", align: "center", width: 300 },
            { label: "التغير%", align: "center", width: 88 },
          ]}
        >
          {yoyData.map((d) => {
            const delta = d.ac - d.py;
            const branchOpen = !!expandedCats[yoyKey.branch(d.branch)];
            return (
              <React.Fragment key={d.branch}>
                <tr
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setExpandedCats((p) => ({
                      ...p,
                      [yoyKey.branch(d.branch)]: !p[yoyKey.branch(d.branch)],
                    }))
                  }
                >
                  <td
                    style={{
                      ...analyticsTdBaseStyle("right"),
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      {chevron(branchOpen)}
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-muted)",
                        }}
                      >
                        سوق
                      </span>
                      {d.branch}
                    </div>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    {fmt(d.ac)}
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    {fmt(d.py)}
                  </td>
                  {renderYoyDeltaCell(delta)}
                  <td style={analyticsTdBaseStyle("center")}>
                    {renderPctCell(d.ac, d.py, false)}
                  </td>
                </tr>
                {branchOpen &&
                  d.years.map((y) => {
                    const yk = yoyKey.year(d.branch, y.year);
                    const yearOpen = !!expandedCats[yk];
                    const yDelta =
                      y.ac !== null ? (y.ac as number) - y.py : null;
                    const yPct =
                      y.ac !== null ? pct(y.ac as number, y.py) : null;
                    return (
                      <React.Fragment key={y.year}>
                        <tr
                          style={{
                            cursor: "pointer",
                            background: "var(--bg-elevated)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCats((p) => ({
                              ...p,
                              [yk]: !p[yk],
                            }));
                          }}
                        >
                          <td
                            style={{
                              ...analyticsTdBaseStyle("right"),
                              paddingInlineStart: 22,
                              color: "var(--text-muted)",
                              fontSize: 12,
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              {chevron(yearOpen)}
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                style={{
                                  background: "var(--bg-elevated)",
                                  color: "var(--text-muted)",
                                }}
                              >
                                سنة
                              </span>
                              <span style={{ marginInlineEnd: 4 }}>┃</span>
                              {y.year}
                            </div>
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              color: "var(--text-muted)",
                              fontSize: 12,
                            }}
                            dir="ltr"
                          >
                            {fmt(y.py)}
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              color: "var(--text-muted)",
                              fontSize: 12,
                            }}
                            dir="ltr"
                          >
                            {y.ac !== null ? fmt(y.ac as number) : ""}
                          </td>
                          {yDelta !== null ? (
                            renderYoyDeltaCell(yDelta)
                          ) : (
                            <td style={analyticsTdBaseStyle("center")} />
                          )}
                          <td style={analyticsTdBaseStyle("center")}>
                            {yPct !== null &&
                              renderPctCell(y.ac as number, y.py, true)}
                          </td>
                        </tr>
                        {yearOpen &&
                          y.quarters.map((q) => {
                            const qk = yoyKey.quarter(
                              d.branch,
                              y.year,
                              q.label,
                            );
                            const qOpen = !!expandedCats[qk];
                            const qDelta = q.ac !== null ? q.ac - q.py : null;
                            const qPct = q.ac !== null ? pct(q.ac, q.py) : null;
                            return (
                              <React.Fragment key={q.label}>
                                <tr
                                  style={{
                                    cursor: "pointer",
                                    background: "rgba(0,0,0,0.02)",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedCats((p) => ({
                                      ...p,
                                      [qk]: !p[qk],
                                    }));
                                  }}
                                >
                                  <td
                                    style={{
                                      ...analyticsTdBaseStyle("right"),
                                      paddingInlineStart: 40,
                                      color: "var(--text-secondary)",
                                      fontSize: 12,
                                    }}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {chevron(qOpen)}
                                      <span
                                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                        style={{
                                          background: "var(--bg-elevated)",
                                          color: "var(--text-muted)",
                                        }}
                                      >
                                        ربع
                                      </span>
                                      <span
                                        style={{
                                          marginInlineEnd: 4,
                                          color: "var(--text-muted)",
                                        }}
                                      >
                                        ┃
                                      </span>
                                      {q.label}
                                    </div>
                                  </td>
                                  <td
                                    style={{
                                      ...analyticsTdBaseStyle("center"),
                                      fontSize: 12,
                                      color: "var(--text-secondary)",
                                    }}
                                    dir="ltr"
                                  >
                                    {fmt(q.py)}
                                  </td>
                                  <td
                                    style={{
                                      ...analyticsTdBaseStyle("center"),
                                      fontSize: 12,
                                      color: "var(--text-secondary)",
                                    }}
                                    dir="ltr"
                                  >
                                    {q.ac !== null ? fmt(q.ac) : ""}
                                  </td>
                                  {qDelta !== null ? (
                                    renderYoyDeltaCell(qDelta)
                                  ) : (
                                    <td
                                      style={analyticsTdBaseStyle("center")}
                                    />
                                  )}
                                  <td style={analyticsTdBaseStyle("center")}>
                                    {qPct !== null &&
                                      q.ac !== null &&
                                      renderPctCell(q.ac, q.py, true)}
                                  </td>
                                </tr>
                                {qOpen &&
                                  q.months.map((m) => {
                                    const mDelta =
                                      m.ac !== null ? m.ac - m.py : null;
                                    const mPct =
                                      m.ac !== null ? pct(m.ac, m.py) : null;
                                    return (
                                      <tr
                                        key={m.name}
                                        style={{
                                          background: "var(--bg-elevated)",
                                        }}
                                      >
                                        <td
                                          style={{
                                            ...analyticsTdBaseStyle("right"),
                                            paddingInlineStart: 58,
                                            color: "var(--text-muted)",
                                            fontSize: 11,
                                          }}
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <span
                                              style={{
                                                display: "inline-block",
                                                width: 14,
                                              }}
                                            />
                                            <span
                                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                                              style={{
                                                background:
                                                  "var(--bg-elevated)",
                                                color: "var(--text-muted)",
                                              }}
                                            >
                                              شهر
                                            </span>
                                            <span
                                              style={{ marginInlineEnd: 4 }}
                                            >
                                              ┃
                                            </span>
                                            {m.name}
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            ...analyticsTdBaseStyle("center"),
                                            fontSize: 11,
                                            color: "var(--text-muted)",
                                          }}
                                          dir="ltr"
                                        >
                                          {fmt(m.py)}
                                        </td>
                                        <td
                                          style={{
                                            ...analyticsTdBaseStyle("center"),
                                            fontSize: 11,
                                            color: "var(--text-muted)",
                                          }}
                                          dir="ltr"
                                        >
                                          {m.ac !== null ? fmt(m.ac) : ""}
                                        </td>
                                        {mDelta !== null ? (
                                          renderYoyDeltaCell(mDelta)
                                        ) : (
                                          <td
                                            style={analyticsTdBaseStyle(
                                              "center",
                                            )}
                                          />
                                        )}
                                        <td
                                          style={analyticsTdBaseStyle("center")}
                                        >
                                          {mPct !== null && m.ac !== null && (
                                            <div
                                              className="flex items-center justify-center gap-1"
                                              dir="ltr"
                                            >
                                              <span
                                                className="text-[9px] font-semibold"
                                                style={{
                                                  color:
                                                    mPct >= 0
                                                      ? "var(--accent-green)"
                                                      : "var(--accent-red)",
                                                }}
                                              >
                                                {mPct >= 0 ? "+" : ""}
                                                {mPct.toFixed(1)}
                                              </span>
                                              <span
                                                style={{
                                                  width: 4,
                                                  height: 4,
                                                  borderRadius: "50%",
                                                  background:
                                                    mPct >= 0
                                                      ? "var(--accent-green)"
                                                      : "var(--accent-red)",
                                                  display: "inline-block",
                                                }}
                                              />
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </React.Fragment>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </AnalyticsTable>
      </div>
    </div>
  );
}
