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

export interface DetailedSalesBreakdownParams {
  at: BreakdownAt;
  // base fields (copied from SalesAnalysisBaseFilters)
  years?: number[];
  branchIds?: string;        // ← single string, not array
  regionIds?: string[];
  group1Ids?: string[];
  group2Ids?: string[];
  group3Ids?: string[];
  agreementId?: string;
}


export interface TransactionsWaterfallParams {
  granularity: WaterfallGranularity;
  /** Option A — explicit list */
  years?: number[];
  /** Option B — range (both required together) */
  yearFrom?: number;
  yearTo?: number;
  branchIds?: string[];
  regionIds?: string[];
}
export interface WaterfallYearMarket {
  // extend when the API returns real market fields
  [key: string]: unknown;
}
export interface WaterfallYearEntry {
  year: number;
  total: number;
  markets: WaterfallYearMarket[];
}

export interface WaterfallYearResponse {
  data: WaterfallYearEntry[];
}

export interface WaterfallQuarterPeriod {
  [key: string]: unknown;
}

export interface WaterfallQuarterResponse {
  granularity: "quarter";
  years: number[];
  branch_ids: number[];
  metric: string;
  max_value: number;
  periods: WaterfallQuarterPeriod[];
}

export type TransactionsWaterfallResponse = | WaterfallYearResponse| WaterfallQuarterResponse;

export const isWaterfallYearResponse = (
  r: TransactionsWaterfallResponse,
): r is WaterfallYearResponse => "data" in r;

export const isWaterfallQuarterResponse = (
  r: TransactionsWaterfallResponse,
): r is WaterfallQuarterResponse => "granularity" in r;

export interface SalesAnalysisRecord {
  [key: string]: string | number | boolean | null;
}

export type SalesAnalysisListResponse = SalesAnalysisRecord[];


export interface CategoryRow {
  id: number;
  code: string;
  name: string;
  quantity_sold: number;
  sales: number;
  profit: number;
}

export interface SalesProfitByCategoryResponse {
  group_level: GroupLevel;
  years: number[];
  data: CategoryRow[];
}


export interface HierarchicalSalesRow {
  id: number;
  code: string;
  name: string;
  sales: number;
  profit: number;
}

export interface HierarchicalSalesResponse {
  at: HierarchicalAt;
  level: SalesAnalysisLevel;
  split_by_period: boolean;
  years: number[];
  period: number[] | null;
  quarters?: number[];
  filters: {
    branch: number[];
    group1: number[];
    group2: number[];
    group3: number[];
  };
  data: HierarchicalSalesRow[];
}


export interface DetailedTimeSalesItem {
  year: number;
  quarter: number;
  month: number;
  net_sales: number;
  net_sales_yoy: number;
  yoy_growth_pct: number;
  mom_growth_pct: number;
  quarter_growth_pct: number;
  invoice_count: number;
  profit_margin_pct: number;
}

export interface DetailedTimeSalesResponse {
  years: number[];
  max_net_sales: number;
  max_invoice_count: number;
  data: DetailedTimeSalesItem[];
}



export interface SalesBreakdownFilters {
  at: BreakdownAt;
  years?: number[];
  regionIds?: string;
  branchIds?: string[];
  group1Ids?: string[];
  group2Ids?: string[];
  group3Ids?: string[];
}

export interface SalesBreakdownRecord {
  id: number | null;
  code: string | null;
  name: string;
  total_sales: number;
  net_sales: number;
  discount_value: number;
  discount_pct: number;
  avg_discount_pct: number;
  return_amount: number;
  returned_qty: number;
  return_ratio_pct: number;
  total_profit: number;
  sold_qty: number;
  sold_items_value: number;
  item_count: number;
  avg_price: number;
  total_damaged_products: number;
  invoice_count: number | null;
}

export interface SalesBreakdownMaxima {
  total_sales: number;
  net_sales: number;
  discount_value: number;
  return_amount: number;
  returned_qty: number;
  sold_qty: number;
  sold_items_value: number;
  item_count: number;
  total_profit: number;
  total_damaged_products: number;
}

export interface SalesBreakdownResponse {
  at: BreakdownAt;
  years: number[];
  filters: {
    branch?: number[];
    group1?: number[];
    group2?: number[];
    group3?: number[];
    region?: number[];
  };
  maxima: SalesBreakdownMaxima;
  data: SalesBreakdownRecord[];
  totals: SalesBreakdownRecord;
}