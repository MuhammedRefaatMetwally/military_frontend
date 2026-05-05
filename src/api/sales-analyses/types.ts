export type SalesAnalysisLevel = "year" | "quarter" | "month";
export type SalesIndicator = "both" | "sales" | "profit";
export type GroupLevel = 1 | 2 | 3;

export type HierarchicalAt = "branch" | "group1" | "group2" | "group3" | "product";
export type BreakdownAt = "market" | "group1" | "group2" | "group3" | "product";
export type WaterfallGranularity = "year" | "quarter";

export interface SalesAnalysisBaseFilters {
  years?: number[];
  branchIds?: string[];
  regionIds?: string[];
  group1Ids?: string[];
  group2Ids?: string[];
  group3Ids?: string[];
  agreementId?: string;
}

export interface NetSalesProfitChartParams extends SalesAnalysisBaseFilters {
  level: SalesAnalysisLevel;
  indicator?: SalesIndicator;
  period?: number[];
}

export interface NetSalesProfitPoint {
  year: number;
  quarter: number | null;
  month: number | null;
  period_start: string;
  sales: number;
  profit: number;
}

export interface NetSalesProfitChartResponse {
  level: SalesAnalysisLevel;
  indicator: SalesIndicator;
  years: number[];
  period: number[] | null;
  data: NetSalesProfitPoint[];
}

export interface SalesProfitByCategoryParams extends SalesAnalysisBaseFilters {
  groupLevel: GroupLevel;
  level?: SalesAnalysisLevel;
  period?: number[];
  quarter?: number[];
}

export interface HierarchicalSalesParams extends SalesAnalysisBaseFilters {
  at: HierarchicalAt;
  level?: SalesAnalysisLevel;
  period?: number[];
  splitByPeriod?: boolean;
}

export interface MonthlyProfitParams extends SalesAnalysisBaseFilters {
  yearFrom?: number;
  yearTo?: number;
}

export interface DetailedTimeSalesParams extends SalesAnalysisBaseFilters {}

export interface DetailedSalesBreakdownParams extends SalesAnalysisBaseFilters {
  at: BreakdownAt;
}

export interface TransactionsWaterfallParams {
  granularity?: WaterfallGranularity;
  years?: number[];
  yearFrom?: number;
  yearTo?: number;
  branchIds?: string[];
  regionIds?: string[];
}

export interface SalesAnalysisRecord {
  [key: string]: string | number | boolean | null;
}

export type SalesAnalysisListResponse = SalesAnalysisRecord[];
