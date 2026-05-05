import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import { fmt, salesTypeRows } from "../../utils/data";

const DetailsOfTypeOfSale = () => {
  return (
    <AnalyticsTableCard
      title="تفاصيل نوع البيع"
      flag="green"
      subtitles={
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          SalesType Breakdown
        </p>
      }
    >
      <AnalyticsTable
        headers={[
          { label: "نوع البيع", align: "right" },
          { label: "المبيعات", align: "center" },
          { label: "الربح", align: "center" },
          { label: "هامش الربح %", align: "center" },
        ]}
      >
        {(() => {
          const maxSales = Math.max(...salesTypeRows.map((r) => r.sales), 1);
          const maxVol = Math.max(...salesTypeRows.map((r) => r.volume), 1);
          return salesTypeRows.map((r) => (
            <tr
              key={r.type}
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <td style={{ ...analyticsTdBaseStyle("right") }}>
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {r.type}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {r.typeAr}
                  </p>
                </div>
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

export default DetailsOfTypeOfSale;
