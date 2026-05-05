import { branchScores } from "../../utils/branchScores";
import {
  AnalyticsBarCell,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";

const BranchPerformanceTableRows = () => {
  const maxProfit = Math.max(...branchScores.map((b) => b.profit), 1);
  const maxSales = Math.max(...branchScores.map((b) => b.sales), 1);
  const maxCosts = Math.max(...branchScores.map((b) => b.costs), 1);
  const maxEmpPerM = Math.max(
    ...branchScores.map((b) =>
      b.sales > 0 ? (b.employees / b.sales) * 1_000_000 : 0,
    ),
    1,
  );

  return branchScores.map((b) => {
    const empPerM = b.sales > 0 ? (b.employees / b.sales) * 1_000_000 : 0;

    return (
      <tr key={b.id}>
        <td
          style={{
            ...analyticsTdBaseStyle("right"),
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {b.name}
        </td>
        <AnalyticsBarCell
          value={b.profit}
          max={maxProfit}
          color="#3b82f6"
          text={b.profit.toLocaleString("en-US")}
        />
        <AnalyticsBarCell
          value={empPerM}
          max={maxEmpPerM}
          color="#3b82f6"
          text={`${b.employees} · ${empPerM.toFixed(1)}`}
        />
        <AnalyticsBarCell
          value={b.returns}
          max={10}
          color="#3b82f6"
          text={`${b.returns.toFixed(1)}%`}
        />
        <td style={analyticsTdBaseStyle("center")}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color:
                b.growth >= 0 ? "var(--accent-green)" : "var(--accent-amber)",
            }}
            dir="ltr"
          >
            {b.growth >= 0 ? "+" : ""}
            {b.growth.toFixed(1)}%
          </span>
        </td>
        <AnalyticsBarCell
          value={b.discount}
          max={10}
          color="#3b82f6"
          text={`${b.discount.toFixed(1)}%`}
        />
        <AnalyticsBarCell
          value={b.sales}
          max={maxSales}
          color="#3b82f6"
          text={b.sales.toLocaleString("en-US")}
        />
        <AnalyticsBarCell
          value={b.costs}
          max={maxCosts}
          color="#3b82f6"
          text={b.costs.toLocaleString("en-US")}
        />
      </tr>
    );
  });
};

export default BranchPerformanceTableRows;

