import { ApiError } from "@/api/axiosInstance";
import {
  DetailedTimeSalesResponse,
  getDetailedSalesBreakdown,
  getDetailedTimeSales,
  getHierarchicalSales,
  getMonthlyProfit,
  getNetSalesProfitChart,
  getSalesProfitByCategory,
  getTransactionsWaterfall,
  HierarchicalSalesResponse,
  salesAnalysesQueryKeys,
  SalesAnalysisListResponse,
  SalesBreakdownResponse,
  type DetailedSalesBreakdownParams,
  type DetailedTimeSalesParams,
  type HierarchicalSalesParams,
  type MonthlyProfitParams,
  type NetSalesProfitChartParams,
  type NetSalesProfitChartResponse,
  type SalesProfitByCategoryParams,
  type SalesProfitByCategoryResponse,
  type TransactionsWaterfallParams,
} from "@/api/sales-analyses";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

// ─── shared helper type ───────────────────────────────────────────────────────

/**
 * Strips the keys managed internally by useQuery so callers only
 * pass behaviour options (enabled, staleTime, gcTime, …).
 *
 * TError defaults to ApiError so every hook gets accurate error typing
 * without having to spell it out at every call site.
 */
type QueryOptions<TData, TError = ApiError> = Omit<
  UseQueryOptions<TData, TError>,
  "queryKey" | "queryFn"
>;

export const useNetSalesProfitChart = (
  params: NetSalesProfitChartParams,
  options?: QueryOptions<NetSalesProfitChartResponse>,
) =>
  useQuery<NetSalesProfitChartResponse, ApiError>({
    queryKey: salesAnalysesQueryKeys.netSalesProfitChart(params),
    queryFn: () => getNetSalesProfitChart(params),
    ...options,
  });

  export const useSalesProfitByCategory = (
    params: SalesProfitByCategoryParams,
    options?: QueryOptions<SalesProfitByCategoryResponse>,
  ) =>
    useQuery<SalesProfitByCategoryResponse, ApiError>({
      queryKey: salesAnalysesQueryKeys.salesProfitByCategory(params),
      queryFn: () =>
        getSalesProfitByCategory(params),
      ...options,
    });

export const useHierarchicalSales = (
  params: HierarchicalSalesParams,
  options?: QueryOptions<HierarchicalSalesResponse>,
) =>
  useQuery<HierarchicalSalesResponse, ApiError>({
    queryKey: salesAnalysesQueryKeys.hierarchicalSales(params),
    queryFn: () => getHierarchicalSales(params),
    ...options,
  });

export const useMonthlyProfit = (
  params: MonthlyProfitParams,
  options?: QueryOptions<SalesAnalysisListResponse>,
) =>
  useQuery<SalesAnalysisListResponse, ApiError>({
    queryKey: salesAnalysesQueryKeys.monthlyProfit(params),
    queryFn: () => getMonthlyProfit(params),
    ...options,
  });

  export const useDetailedTimeSales = (
    params: DetailedTimeSalesParams,
    options?: QueryOptions<DetailedTimeSalesResponse>,
  ) =>
    useQuery<DetailedTimeSalesResponse, ApiError>({
      queryKey: salesAnalysesQueryKeys.detailedTimeSales(params),
      queryFn: () => getDetailedTimeSales(params),
      ...options,
    });

    export const useDetailedSalesBreakdown = (
      params: DetailedSalesBreakdownParams,
      options?: QueryOptions<SalesBreakdownResponse>,
    ) =>
      useQuery<SalesBreakdownResponse, ApiError>({
        queryKey: salesAnalysesQueryKeys.detailedSalesBreakdown(params),
        queryFn: () => getDetailedSalesBreakdown(params),
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
        placeholderData: (prev : SalesBreakdownResponse | undefined) => prev,
        ...options,
      });

export const useTransactionsWaterfall = (
  params: TransactionsWaterfallParams,
  options?: QueryOptions<SalesAnalysisListResponse>,
) =>
  useQuery<SalesAnalysisListResponse, ApiError>({
    queryKey: salesAnalysesQueryKeys.transactionsWaterfall(params),
    queryFn: () => getTransactionsWaterfall(params),
    ...options,
  });