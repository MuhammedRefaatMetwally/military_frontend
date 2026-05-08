

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { ApiError } from '@/api/axiosInstance';
import {
  getDamagedProductsReasons,
  getLeast10Products,
  getNetSalesByCategory,
  getProductCatalog,
  getReturnsByProduct,
  getSalesProfitContribution,
  getSalesVolumeMargin,
  getTop10Products,
  productsAnalysisQueryKeys,
  type DamagedProductsReasonsParams,
  type DamagedProductsReasonsResponse,
  type Least10ProductsParams,
  type Least10ProductsResponse,
  type NetSalesByCategoryParams,
  type NetSalesByCategoryResponse,
  type ProductCatalogParams,
  type ProductCatalogResponse,
  type ReturnsByProductParams,
  type ReturnsByProductResponse,
  type SalesProfitContributionParams,
  type SalesProfitContributionResponse,
  type SalesVolumeMarginParams,
  type SalesVolumeMarginResponse,
  type Top10ProductsParams,
  type Top10ProductsResponse,
} from '../api/product-analysis/products-analysis';

// ─── Shared Helper Type ────────────────────────────────────────────────────────

/**
 * Strips the keys managed internally by useQuery so callers only
 * pass behaviour options (enabled, staleTime, gcTime, …).
 *
 * TError defaults to ApiError so every hook gets accurate error typing
 * without having to spell it out at every call site.
 */
type QueryOptions<TData, TError = ApiError> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
>;

// ─── C1.1: Net Sales by Category ───────────────────────────────────────────────

/**
 * Hook for fetching net sales data by product category
 * Supports hierarchical grouping and various filtering options
 */
export const useNetSalesByCategory = (
  params: NetSalesByCategoryParams,
  options?: QueryOptions<NetSalesByCategoryResponse>,
) =>
  useQuery<NetSalesByCategoryResponse, ApiError>({
    queryKey: productsAnalysisQueryKeys.netSalesByCategory(params),
    queryFn: () => getNetSalesByCategory(params),
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 30 * 60_000, // 30 minutes
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    ...options,
  });

// ─── C1.2: Sales Volume & Margin ───────────────────────────────────────────────

/**
 * Hook for fetching sales volume and profit margin data
 * Useful for scatter plots and comparative analysis
 */
export const useSalesVolumeMargin = (
  params: SalesVolumeMarginParams,
  options?: QueryOptions<SalesVolumeMarginResponse>,
) =>
  useQuery<SalesVolumeMarginResponse, ApiError>({
    queryKey: productsAnalysisQueryKeys.salesVolumeMargin(params),
    queryFn: () => getSalesVolumeMargin(params),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    ...options,
  });

// ─── C2.1: Top 10 Products ────────────────────────────────────────────────────

/**
 * Hook for fetching the top 10 performing products
 * Returns products ranked by profit with monthly breakdown
 */
export const useTop10Products = (
  params: Top10ProductsParams,
  options?: QueryOptions<Top10ProductsResponse>,
) =>
  useQuery<Top10ProductsResponse, ApiError>({
    queryKey: productsAnalysisQueryKeys.top10Products(params),
    queryFn: () => getTop10Products(params),
    staleTime: 10 * 60_000, // 10 minutes
    gcTime: 60 * 60_000, // 1 hour
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    ...options,
  });

// ─── C2.2: Least 10 Products ──────────────────────────────────────────────────

/**
 * Hook for fetching the least 10 performing products
 * Returns products ranked by profit (lowest first) with monthly breakdown
 */
export const useLeast10Products = (
  params: Least10ProductsParams,
  options?: QueryOptions<Least10ProductsResponse>,
) =>
  useQuery<Least10ProductsResponse, ApiError>({
    queryKey: productsAnalysisQueryKeys.least10Products(params),
    queryFn: () => getLeast10Products(params),
    staleTime: 10 * 60_000,
    gcTime: 60 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    ...options,
  });

// ─── C3.1: Sales & Profit Contribution ─────────────────────────────────────────

/**
 * Hook for fetching sales and profit contribution data
 * Includes percentages and combined scoring metrics
 */
export const useSalesProfitContribution = (
  params: SalesProfitContributionParams,
  options?: QueryOptions<SalesProfitContributionResponse>,
) =>
  useQuery<SalesProfitContributionResponse, ApiError>({
    queryKey: productsAnalysisQueryKeys.salesProfitContribution(params),
    queryFn: () => getSalesProfitContribution(params),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    ...options,
  });

// ─── C3.2: Returns by Product ──────────────────────────────────────────────────

/**
 * Hook for fetching product return data including return rates
 */
export const useReturnsByProduct = (
  params: ReturnsByProductParams,
  options?: QueryOptions<ReturnsByProductResponse>,
) =>
  useQuery<ReturnsByProductResponse, ApiError>({
    queryKey: productsAnalysisQueryKeys.returnsByProduct(params),
    queryFn: () => getReturnsByProduct(params),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    ...options,
  });

// ─── C5: Damaged Products Reasons ──────────────────────────────────────────────

/**
 * Hook for fetching damaged products data categorized by reason
 */
export const useDamagedProductsReasons = (
  params: DamagedProductsReasonsParams,
  options?: QueryOptions<DamagedProductsReasonsResponse>,
) =>
  useQuery<DamagedProductsReasonsResponse, ApiError>({
    queryKey: productsAnalysisQueryKeys.damagedProductsReasons(params),
    queryFn: () => getDamagedProductsReasons(params),
    staleTime: 10 * 60_000,
    gcTime: 60 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    ...options,
  });

// ─── C6: Product Catalog ──────────────────────────────────────────────────────

/**
 * Hook for fetching hierarchical product catalog
 * Returns nested structure with all product levels and sales data
 */
export const useProductCatalog = (
  params: ProductCatalogParams,
  options?: QueryOptions<ProductCatalogResponse>,
) =>
  useQuery<ProductCatalogResponse, ApiError>({
    queryKey: productsAnalysisQueryKeys.productCatalog(params),
    queryFn: () => getProductCatalog(params),
    staleTime: 10 * 60_000,
    gcTime: 60 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    ...options,
  });
