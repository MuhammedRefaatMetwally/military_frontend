/**
 * Product Analysis API Types
 * Comprehensive type definitions for all product analysis endpoints
 */

// ─── Base Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

// ─── C1.1: Net Sales by Category ───────────────────────────────────────────────

export interface NetSalesByCategoryItem {
  id: number;
  name: string;
  net_sales: number;
}

export interface NetSalesByCategoryResponse {
  status: "success" | "error";
  data: NetSalesByCategoryItem[];
}

export interface NetSalesByCategoryParams {
  groupLevel?: number; // 1, 2, 3, or product level
  regionId?: string | number;
  branchIds?: (string | number)[];
  group1Ids?: (string | number)[];
  group2Ids?: (string | number)[];
  group3Ids?: (string | number)[];
  fromDate?: string; // ISO date format: YYYY-MM-DD
  toDate?: string;   // ISO date format: YYYY-MM-DD
  years?: number[];
  quarter?: number[];
  month?: number[];
}

// ─── C1.2: Sales Volume & Margin (Scatter Data) ─────────────────────────────

export interface SalesVolumeMarginItem {
  id: number;
  code: string;
  name: string;
  net_sales: number;
  profit_margin: number;
}

export interface SalesVolumeMarginResponse {
  status: "success" | "error";
  level: "group1" | "group2" | "group3" | "products";
  data: SalesVolumeMarginItem[];
}

export interface SalesVolumeMarginParams {
  level: "group1" | "group2" | "group3" | "products";
  group1Ids?: (string | number)[];
  group2Ids?: (string | number)[];
  group3Ids?: (string | number)[];
  regionIds?: (string | number)[];
  branchIds?: (string | number)[];
  years?: number[];
  quarter?: number[];
  month?: number[];
}

// ─── C2.1: Top 10 Products ────────────────────────────────────────────────────

export interface MonthlyProfit {
  [month: number]: number;
}

export interface TopProductItem {
  id: number;
  code: string;
  name: string;
  total_profit: number;
  monthly: MonthlyProfit;
}

export interface Top10ProductsResponse {
  status: "success" | "error";
  years: number[];
  months: number[];
  products: TopProductItem[];
  year: number;
}

export interface Top10ProductsParams {
  year: number;
  regionIds?: (string | number)[];
  branchIds?: (string | number)[];
  group1Id?: string | number;
  group2Id?: string | number;
  group3Id?: string | number;
}

// ─── C2.2: Least 10 Products ──────────────────────────────────────────────────

export interface Least10ProductsResponse {
  status: "success" | "error";
  years: number[];
  months: number[];
  products: TopProductItem[];
  year: number;
}

export interface Least10ProductsParams {
  year: number;
  regionIds?: (string | number)[];
  branchIds?: (string | number)[];
  group1Id?: string | number;
  group2Id?: string | number;
  group3Id?: string | number;
}

// ─── C3.1: Sales & Profit Contribution ─────────────────────────────────────────

export interface SalesProfitProduct {
  id: number;
  code: string;
  name: string;
  sold_qty: number;
  profit: number;
  sales_volume_pct: number;
  profit_pct: number;
  combined_score: number;
}

export interface SalesProfitTotals {
  total_sold_qty: number;
  total_profit: number;
}

export interface SalesProfitContributionResponse {
  status: "success" | "error";
  data: {
    products: SalesProfitProduct[];
    totals: SalesProfitTotals;
  };
}

export interface SalesProfitContributionParams {
  year: number;
  regionIds?: (string | number)[];
  branchIds?: (string | number)[];
  group1Ids?: (string | number)[];
  group2Ids?: (string | number)[];
  group3Ids?: (string | number)[];
  quarter?: number[];
  month?: number[];
}

// ─── C3.2: Returns by Product ──────────────────────────────────────────────────

export interface ReturnByProductItem {
  id: number;
  code: string;
  name: string;
  return_qty: number;
  sold_qty: number;
  return_rate: number; // Percentage
}

export interface ReturnsByProductResponse {
  status: "success" | "error";
  data: ReturnByProductItem[];
}

export interface ReturnsByProductParams {
  year?: number;
  years?: number[];
  month?: number[];
  quarter?: number[];
  fromDate?: string;
  toDate?: string;
  regionIds?: (string | number)[];
  branchIds?: (string | number)[];
  group1Ids?: (string | number)[];
  group2Ids?: (string | number)[];
  group3Ids?: (string | number)[];
}

// ─── C5: Damaged Products Reasons ──────────────────────────────────────────────

export interface DamagedProductReason {
  id: number;
  name: string;
  num_of_damaged_products: number;
}

export interface DamagedProductsReasonsResponse {
  status: "success" | "error";
  data: DamagedProductReason[];
}

export interface DamagedProductsReasonsParams {
  year: number;
  years?: number[];
  regionIds?: (string | number)[];
  branchIds?: (string | number)[];
  group1Ids?: (string | number)[];
  group2Ids?: (string | number)[];
  group3Ids?: (string | number)[];
}

// ─── C6: Product Catalog ──────────────────────────────────────────────────────

export interface ProductCatalogChild {
  id: number;
  name: string;
  categoryAr?: string;
  price?: number;
  netSalesValue: number;
  netSalesPct: number;
  soldCount: number;
  return_product_qty: number;
  num_of_damaged_products: number;
  marginPct?: number;
  children?: ProductCatalogChild[];
}

export interface ProductCatalogItem extends ProductCatalogChild {}

export type ProductCatalogGroupLevel = "group1" | "group2" | "group3";

export type ProductCatalogResponse = ProductCatalogItem[];

export interface ProductCatalogParams {
  groupLevel: ProductCatalogGroupLevel;
  // Root-level multi-filters (used when querying from the store filters)
  group1Ids?: number[];
  group2Ids?: number[];
  group3Ids?: number[];
  // Single-parent filters for lazy-loading child levels:
  //   group1Id → required when groupLevel = "group2" (filter by parent group1)
  //   group2Id → required when groupLevel = "group3" (filter by parent group2)
  group1Id?: number;
  group2Id?: number;
  // Branch / region filters
  branchIds?: number[];
  regionIds?: number[];
  // Time filters
  years?: number[];
  quarter?: number[];
  month?: number[];
  fromDate?: string;
  toDate?: string;
}

// ─── Query Key Factory ─────────────────────────────────────────────────────────

export const productsAnalysisQueryKeys = {
  all: ["products-analysis"] as const,

  // C1.1: Net Sales by Category
  netSalesByCategory: (params: NetSalesByCategoryParams) =>
    [...productsAnalysisQueryKeys.all, "net-sales-by-category", params] as const,

  // C1.2: Sales Volume & Margin
  salesVolumeMargin: (params: SalesVolumeMarginParams) =>
    [...productsAnalysisQueryKeys.all, "sales-volume-margin", params] as const,

  // C2.1: Top 10 Products
  top10Products: (params: Top10ProductsParams) =>
    [...productsAnalysisQueryKeys.all, "top-10-products", params] as const,

  // C2.2: Least 10 Products
  least10Products: (params: Least10ProductsParams) =>
    [...productsAnalysisQueryKeys.all, "least-10-products", params] as const,

  // C3.1: Sales & Profit Contribution
  salesProfitContribution: (params: SalesProfitContributionParams) =>
    [...productsAnalysisQueryKeys.all, "sales-profit-contribution", params] as const,

  // C3.2: Returns by Product
  returnsByProduct: (params: ReturnsByProductParams) =>
    [...productsAnalysisQueryKeys.all, "returns-by-product", params] as const,

  // C5: Damaged Products Reasons
  damagedProductsReasons: (params: DamagedProductsReasonsParams) =>
    [...productsAnalysisQueryKeys.all, "damaged-products-reasons", params] as const,

  // C6: Product Catalog
  productCatalog: (params: ProductCatalogParams) =>
    [...productsAnalysisQueryKeys.all, "product-catalog", params] as const,
} as const;