import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import { rules } from "../../utils/rules";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";

const associationRulesHeaders = [
  { label: "السلة", align: "right" as const },
  { label: "الدعم", align: "center" as const },
  { label: "ثقة المنتج الأول", align: "center" as const },
  { label: "ثقة المنتج الثاني", align: "center" as const },
  { label: "الرفع", align: "center" as const },
];

const maxSupport = Math.max(...rules.map((r) => r.support));
const maxLift = Math.max(...rules.map((r) => r.lift));
const CONF_SCALE_MAX = 25;

const RulesOfAssociation = () => {
  const palette = useResolvedAnalyticsPalette();

  return (
    <AnalyticsTableCard
      title="قواعد الارتباط"
      flag={false}
      aiModule
      subtitles={
        <p
          className="text-[11px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          الدعم، الثقة، الرفع — Association Rules
        </p>
      }
    >
      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        <AnalyticsTable
          headers={associationRulesHeaders}
          thead={
            <tr
              style={{
                background: "var(--bg-elevated)",
                borderBottom: "1px solid var(--border-subtle)",
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              {associationRulesHeaders.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "9px 12px",
                    textAlign: h.align ?? "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                    background: "var(--bg-elevated)",
                  }}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          }
        >
          {rules.map((rule) => (
            <tr
              key={rule.basket}
              className="hover:bg-white/2 transition-colors"
            >
              <td
                style={{
                  ...analyticsTdBaseStyle("right"),
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {rule.basket}
              </td>
              <AnalyticsBarCell
                value={rule.support}
                max={maxSupport}
                color={palette.primaryBlue}
                text={`${(rule.support * 100).toFixed(2)}%`}
              />
              <AnalyticsBarCell
                value={rule.confA}
                max={CONF_SCALE_MAX}
                color={palette.primaryBlue}
                text={rule.confA.toFixed(2)}
              />
              <AnalyticsBarCell
                value={rule.confB}
                max={CONF_SCALE_MAX}
                color={palette.primaryBlue}
                text={rule.confB.toFixed(2)}
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
                    width: `${Math.max(2, (rule.lift / Math.max(1, maxLift)) * 85)}%`,
                    height: 16,
                    background: palette.primaryGreen,
                    opacity: 0.25,
                    borderRadius: 3,
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--accent-green)",
                  }}
                  dir="ltr"
                >
                  {rule.lift.toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </AnalyticsTable>
      </div>
    </AnalyticsTableCard>
  );
};

export default RulesOfAssociation;
