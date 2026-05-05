import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import { fmt, paymentRows } from "../../utils/data";

const PaymentMethodDetails = () => {
  return (
    <AnalyticsTableCard
      title="تفاصيل طريقة الدفع"
      flag="green"
      subtitles={
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Payment Type Breakdown
        </p>
      }
    >
      <AnalyticsTable
        headers={[
          { label: "طريقة الدفع", align: "right" },
          { label: "المبيعات", align: "center" },
          { label: "الربح", align: "center" },
          { label: "هامش الربح %", align: "center" },
        ]}
      >
        {(() => {
          const maxSales = Math.max(...paymentRows.map((r) => r.sales), 1);
          const maxVol = Math.max(...paymentRows.map((r) => r.volume), 1);
          return paymentRows.map((r) => (
            <tr
              key={r.method}
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <td
                style={{
                  ...analyticsTdBaseStyle("right"),
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {r.method}
              </td>
              <AnalyticsBarCell
                value={r.sales}
                max={maxSales}
                color="#3b82f6"
                text={fmt(r.sales)}
              />
              <AnalyticsBarCell
                value={r.volume}
                max={maxVol}
                color="#3b82f6"
                text={fmt(r.volume)}
              />
              <td style={analyticsTdBaseStyle("center")} dir="ltr">
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                  }}
                >
                  {r.margin}%
                </span>
              </td>
            </tr>
          ));
        })()}
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
};

export default PaymentMethodDetails;
