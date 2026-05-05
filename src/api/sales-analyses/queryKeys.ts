import type {
  DetailedSalesBreakdownParams,
  DetailedTimeSalesParams,
  HierarchicalSalesParams,
  MonthlyProfitParams,
  NetSalesProfitChartParams,
  SalesProfitByCategoryParams,
  TransactionsWaterfallParams,
} from "./types";

export const salesAnalysesQueryKeys = {
  all: ["sales-analyses"] as const,
  netSalesProfitChart: (params: NetSalesProfitChartParams) =>
    ["sales-analyses", "net-sales-profit-chart", params] as const,
  salesProfitByCategory: (params: SalesProfitByCategoryParams) =>
    ["sales-analyses", "sales-profit-by-category", params] as const,
  hierarchicalSales: (params: HierarchicalSalesParams) =>
    ["sales-analyses", "hierarchical-sales", params] as const,
  monthlyProfit: (params: MonthlyProfitParams) =>
    ["sales-analyses", "monthly-profit", params] as const,
  detailedTimeSales: (params: DetailedTimeSalesParams) =>
    ["sales-analyses", "detailed-time-sales", params] as const,
  detailedSalesBreakdown: (params: DetailedSalesBreakdownParams) =>
    ["sales-analyses", "detailed-sales-breakdown", params] as const,
  transactionsWaterfall: (params: TransactionsWaterfallParams) =>
    ["sales-analyses", "transactions-waterfall", params] as const,
};
