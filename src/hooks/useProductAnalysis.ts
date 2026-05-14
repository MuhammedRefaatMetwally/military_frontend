

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

type QueryOptions<TData, TError = ApiError> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
>;

// ─── C1.1: Net Sales by Category ───────────────────────────────────────────────

export const useNetSalesByCategory = (
  params: NetSalesByCategoryParams,
  options?: QueryOptions<NetSalesByCategoryResponse>,
) =>
  useQuery<NetSalesByCategoryResponse, ApiError>({
    queryKey: productsAnalysisQueryKeys.netSalesByCategory(params),
    queryFn: () => getNetSalesByCategory(params),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    ...options,
  });

// ─── C1.2: Sales Volume & Margin ───────────────────────────────────────────────

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

export const useTop10Products = (
  params: Top10ProductsParams,
  options?: QueryOptions<Top10ProductsResponse>,
) =>
  useQuery<Top10ProductsResponse, ApiError>({
    queryKey: productsAnalysisQueryKeys.top10Products(params),
    queryFn: () => getTop10Products(params),
    staleTime: 10 * 60_000,
    gcTime: 60 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    ...options,
  });

// ─── C2.2: Least 10 Products ──────────────────────────────────────────────────

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
 * FIX: params now includes groupLevel which maps to the required
 * group_level query param the backend validates.
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