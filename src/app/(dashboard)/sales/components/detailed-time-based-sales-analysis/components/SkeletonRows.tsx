/**
 * SkeletonRows - Loading skeleton for table rows
 */

import { analyticsTdBaseStyle } from "@/components/ui/AnalyticsTable";

interface SkeletonRowsProps {
  count?: number;
}

export function SkeletonRows({ count = 4 }: SkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr
          key={i}
          style={{ background: i % 2 === 0 ? "var(--bg-elevated)" : undefined }}
        >
          {Array.from({ length: 7 }).map((_, j) => (
            <td
              key={j}
              style={analyticsTdBaseStyle(j === 0 ? "right" : "center")}
            >
              <div
                style={{
                  height: 10,
                  borderRadius: 4,
                  width: j === 0 ? 80 : 60,
                  background: "var(--bg-elevated)",
                  animation: "pulse 1.5s ease-in-out infinite",
                  margin: "0 auto",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
