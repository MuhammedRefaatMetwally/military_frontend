"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import { forecastData } from "../../utils/forecastData";

const maxActual = Math.max(...forecastData.map((d) => d.actual));
const maxPred = Math.max(...forecastData.map((d) => d.predicted));

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const forecastHeaders = [
  { label: "التاريخ", align: "right" as const },
  { label: "المبيعات الفعلية", align: "center" as const },
  { label: "المبيعات المتوقعة", align: "center" as const },
  { label: "الانحراف", align: "center" as const },
  { label: "فرق الانحراف", align: "center" as const },
];

const DailyForecastDetails = () => {
  const palette = useResolvedAnalyticsPalette();

  return (
    <AnalyticsTableCard
      title="تفاصيل التوقع اليومي"
      flag={false}
      aiModule
      subtitles={
        <p
          className="text-[11px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          المبيعات الفعلية مقابل المتوقعة — Actual vs Predicted Daily
        </p>
      }
    >
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        <AnalyticsTable headers={forecastHeaders}>
          {[...forecastData].reverse().map((row) => {
            const deviation =
              ((row.actual - row.predicted) / row.actual) * 100;
            const devDiff = row.predicted - row.actual;
            const isUp = devDiff >= 0;
            const deviationAbs = Math.abs(deviation);

            return (
              <tr
                key={row.date}
                className="hover:bg-white/2 transition-colors"
              >
                <td
                  style={{
                    ...analyticsTdBaseStyle("right"),
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                  dir="ltr"
                >
                  {row.date}
                </td>

                <AnalyticsBarCell
                  value={row.actual}
                  max={maxActual}
                  color={palette.primaryBlue}
                  text={fmt(row.actual)}
                />

                <td
                  style={{
                    ...analyticsTdBaseStyle("center"),
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 4,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: `${Math.max(2, (row.predicted / Math.max(1, maxPred)) * 85)}%`,
                      height: 16,
                      background: palette.primaryBlue,
                      opacity: 0.2,
                      borderRadius: 3,
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--accent-blue)",
                    }}
                    dir="ltr"
                  >
                    {fmt(row.predicted)}
                  </span>
                </td>

                <td
                  style={{
                    ...analyticsTdBaseStyle("center"),
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 4,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: `${Math.min(deviationAbs * 40, 70)}%`,
                      height: 16,
                      background: palette.primaryGreen,
                      opacity: 0.25,
                      borderRadius: 2,
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
                    {deviationAbs.toFixed(2)}
                  </span>
                </td>

                <td style={{ ...analyticsTdBaseStyle("center") }}>
                  <div className="flex items-center justify-center gap-1">
                    {isUp ? (
                      <TrendingUp
                        size={11}
                        style={{ color: "var(--accent-green)" }}
                      />
                    ) : (
                      <TrendingDown
                        size={11}
                        style={{ color: "var(--accent-red)" }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: isUp
                          ? "var(--accent-green)"
                          : "var(--accent-red)",
                      }}
                      dir="ltr"
                    >
                      {devDiff >= 0 ? "" : "-"}
                      {Math.abs((devDiff / row.actual) * 100).toFixed(2)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </AnalyticsTable>
      </div>
    </AnalyticsTableCard>
  );
};

export default DailyForecastDetails;
