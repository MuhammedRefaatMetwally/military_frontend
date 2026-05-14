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

// ─── C5: Damaged Products Reasons ──────────────────────────────────────────────

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
 * API contract for group_level drill-down:
 *
 *   group_level=group1               → root, no parent filter needed
 *   group_level=group2 + group1=[id] → children of a specific group1 row
 *   group_level=group3 + group2=[id] → children of a specific group2 row
 *
 * The component passes either:
 *   - group1Ids / group2Ids / group3Ids (arrays) for store-level filters on the root query
 *   - group1Id / group2Id (single integers) for the lazy-load parent filter
 *
 * Both are handled here and sent as the appropriate query param.
 */
export const getProductCatalog = async (
  params: ProductCatalogParams,
): Promise<ProductCatalogResponse> => {
  const response = await axiosInstance.get<ProductCatalogResponse>(
    `${BASE_URL}/product-catalog`,
    {
      params: withDefinedParams({
        group_level: params.groupLevel,
        // Single-parent drill-down filters (integer, not CSV)
        group1:      params.group1Id   ?? toCsv(params.group1Ids),
        group2:      params.group2Id   ?? toCsv(params.group2Ids),
        group3:      toCsv(params.group3Ids),
        // Other filters
        branch:      toCsv(params.branchIds),
        region:      toCsv(params.regionIds),
        year:        toCsv(params.years),
        quarter:     toCsv(params.quarter),
        month:       toCsv(params.month),
        from_date:   params.fromDate,
        to_date:     params.toDate,
      }),
    },
  );
  return response.data;
};

// Export all types for convenience
export * from './types/products-analysis';