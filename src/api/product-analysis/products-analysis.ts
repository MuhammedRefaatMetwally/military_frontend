/**
 * Product Analysis API
 * Handles all product analysis data fetching with parameter normalization
 */

import axiosInstance from '../axiosInstance';
import type {
  Least10ProductsParams,
  Least10ProductsResponse,
  NetSalesByCategoryParams,
  NetSalesByCategoryResponse,
  SalesVolumeMarginParams,
  SalesVolumeMarginResponse,
  Top10ProductsParams,
  Top10ProductsResponse,
  SalesProfitContributionParams,
  SalesProfitContributionResponse,
  ReturnsByProductParams,
  ReturnsByProductResponse,
  DamagedProductsReasonsParams,
  DamagedProductsReasonsResponse,
  ProductCatalogParams,
  ProductCatalogResponse,
} from './types/products-analysis';

const BASE_URL = '/api/products-analysis';

// ─── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Converts array of values to comma-separated string or undefined if empty
 */
export const toCsv = (values?: (string | number)[]): string | undefined => {
  if (!values || values.length === 0) return undefined;
  return values.join(',');
};

/**
 * Filters out undefined, null, and empty string values from object
 */
export const withDefinedParams = (
  params: Record<string, unknown>,
): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );
};

// ─── C1.1: Net Sales by Category ───────────────────────────────────────────────

/**
 * Fetches net sales by category with optional filtering
 * Supports grouping by category level and filtering by date range or periods
 */
export const getNetSalesByCategory = async (
  params: NetSalesByCategoryParams,
): Promise<NetSalesByCategoryResponse> => {
  const response = await axiosInstance.get<NetSalesByCategoryResponse>(
    `${BASE_URL}/net-sales-by-category`,
    {
      params: withDefinedParams({
        group_level: params.groupLevel,
        region: params.regionId,
        branch: toCsv(params.branchIds),
        group1: toCsv(params.group1Ids),
        group2: toCsv(params.group2Ids),
        group3: toCsv(params.group3Ids),
        from_date: params.fromDate,
        to_date: params.toDate,
        year: toCsv(params.years),
        quarter: toCsv(params.quarter),
        month: toCsv(params.month),
      }),
    },
  );

  return response.data;
};

// ─── C1.2: Sales Volume & Margin ───────────────────────────────────────────────

/**
 * Fetches sales volume and profit margin data organized by category level
 * Commonly used for scatter plot/bubble chart visualizations
 * Requires parent level IDs when querying deeper hierarchies
 */
export const getSalesVolumeMargin = async (
  params: SalesVolumeMarginParams,
): Promise<SalesVolumeMarginResponse> => {
  const response = await axiosInstance.get<SalesVolumeMarginResponse>(
    `${BASE_URL}/sales-volume-margin`,
    {
      params: withDefinedParams({
        level: params.level,
        group1: toCsv(params.group1Ids),
        group2: toCsv(params.group2Ids),
        group3: toCsv(params.group3Ids),
        region: toCsv(params.regionIds),
        branch: toCsv(params.branchIds),
        year: toCsv(params.years),
        quarter: toCsv(params.quarter),
        month: toCsv(params.month),
      }),
    },
  );

  return response.data;
};

// ─── C2.1: Top 10 Products ────────────────────────────────────────────────────

/**
 * Fetches the top 10 performing products by profit
 * Can be filtered by year, region, branch, or product hierarchy
 * Returns monthly profit breakdown within each year
 */
export const getTop10Products = async (
  params: Top10ProductsParams,
): Promise<Top10ProductsResponse> => {
  const response = await axiosInstance.get<Top10ProductsResponse>(
    `${BASE_URL}/top-10-products`,
    {
      params: withDefinedParams({
        year: params.year,
        region: toCsv(params.regionIds),
        branch: toCsv(params.branchIds),
        group1: params.group1Id,
        group2: params.group2Id,
        group3: params.group3Id,
      }),
    },
  );

  return response.data;
};

// ─── C2.2: Least 10 Products ──────────────────────────────────────────────────

/**
 * Fetches the least 10 performing products by profit
 * Can be filtered by year, region, branch, or product hierarchy
 * Returns monthly profit breakdown within each year
 */
export const getLeast10Products = async (
  params: Least10ProductsParams,
): Promise<Least10ProductsResponse> => {
  const response = await axiosInstance.get<Least10ProductsResponse>(
    `${BASE_URL}/least-10-products`,
    {
      params: withDefinedParams({
        year: params.year,
        region: toCsv(params.regionIds),
        branch: toCsv(params.branchIds),
        group1: params.group1Id,
        group2: params.group2Id,
        group3: params.group3Id,
      }),
    },
  );

  return response.data;
};

// ─── C3.1: Sales & Profit Contribution ─────────────────────────────────────────

/**
 * Fetches detailed sales and profit contribution data by product
 * Includes individual and combined scoring metrics
 * Returns aggregated totals for quick KPI calculation
 */
export const getSalesProfitContribution = async (
  params: SalesProfitContributionParams,
): Promise<SalesProfitContributionResponse> => {
  const response = await axiosInstance.get<SalesProfitContributionResponse>(
    `${BASE_URL}/sales-profit-contribution`,
    {
      params: withDefinedParams({
        year: params.year,
        region: toCsv(params.regionIds),
        branch: toCsv(params.branchIds),
        group1: toCsv(params.group1Ids),
        group2: toCsv(params.group2Ids),
        group3: toCsv(params.group3Ids),
        quarter: toCsv(params.quarter),
        month: toCsv(params.month),
      }),
    },
  );

  return response.data;
};

// ─── C3.2: Returns by Product ──────────────────────────────────────────────────

/**
 * Fetches product return quantities and return rates
 * Can be filtered by temporal dimensions (year, month, quarter)
 * or categorical dimensions (region, branch, product hierarchy)
 */
export const getReturnsByProduct = async (
  params: ReturnsByProductParams,
): Promise<ReturnsByProductResponse> => {
  const response = await axiosInstance.get<ReturnsByProductResponse>(
    `${BASE_URL}/returns-by-product`,
    {
      params: withDefinedParams({
        year: params.year,
        years: toCsv(params.years),
        month: toCsv(params.month),
        quarter: toCsv(params.quarter),
        region: toCsv(params.regionIds),
        branch: toCsv(params.branchIds),
        group1: toCsv(params.group1Ids),
        group2: toCsv(params.group2Ids),
        group3: toCsv(params.group3Ids),
      }),
    },
  );

  return response.data;
};

// ─── C5: Damaged Products Reasons ──────────────────────────────────────────────

/**
 * Fetches counts of damaged products categorized by damage reason
 * Can be filtered by year and various dimensions
 */
export const getDamagedProductsReasons = async (
  params: DamagedProductsReasonsParams,
): Promise<DamagedProductsReasonsResponse> => {
  const response = await axiosInstance.get<DamagedProductsReasonsResponse>(
    `${BASE_URL}/damaged-products-reasons`,
    {
      params: withDefinedParams({
        year: params.year,
        years: toCsv(params.years),
        region: toCsv(params.regionIds),
        branch: toCsv(params.branchIds),
        group1: toCsv(params.group1Ids),
        group2: toCsv(params.group2Ids),
        group3: toCsv(params.group3Ids),
      }),
    },
  );

  return response.data;
};

// ─── C6: Product Catalog ──────────────────────────────────────────────────────

/**
 * Fetches hierarchical product catalog with sales and margin data
 * Returns nested structure from category level down to individual products
 * Can be filtered by date range and various dimensions
 */
export const getProductCatalog = async (
  params: ProductCatalogParams,
): Promise<ProductCatalogResponse> => {
  const response = await axiosInstance.get<ProductCatalogResponse>(
    `${BASE_URL}/product-catalog`,
    {
      params: withDefinedParams({
        year: toCsv(params.years),
        month: toCsv(params.month),
        quarter: toCsv(params.quarter),
        from_date: params.fromDate,
        to_date: params.toDate,
        region: toCsv(params.regionIds),
        branch: toCsv(params.branchIds),
        group1: toCsv(params.group1Ids),
        group2: toCsv(params.group2Ids),
        group3: toCsv(params.group3Ids),
      }),
    },
  );

  return response.data;
};

// Export all types for convenience
export * from './types/products-analysis';
