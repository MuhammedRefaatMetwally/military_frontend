import {
  getDetailedSalesBreakdown,
  getDetailedTimeSales,
  getHierarchicalSales,
  getMonthlyProfit,
  getNetSalesProfitChart,
  getSalesProfitByCategory,
  getTransactionsWaterfall,
  salesAnalysesQueryKeys,
  type DetailedSalesBreakdownParams,
  type DetailedTimeSalesParams,
  type HierarchicalSalesParams,
  type MonthlyProfitParams,
  type NetSalesProfitChartParams,
  type NetSalesProfitChartResponse,
  type SalesAnalysisListResponse,
  type SalesProfitByCategoryParams,
  type TransactionsWaterfallParams,
} from "@/api/sales-analyses";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

type QueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error>,
  "queryKey" | "queryFn"
>;

export const useNetSalesProfitChart = (
  params: NetSalesProfitChartParams,
  options?: QueryOptions<NetSalesProfitChartResponse>,
) =>
  useQuery<NetSalesProfitChartResponse, Error>({
    queryKey: salesAnalysesQueryKeys.netSalesProfitChart(params),
    queryFn: () => getNetSalesProfitChart(params),
    ...options,
  });

export const useSalesProfitByCategory = (
  params: SalesProfitByCategoryParams,
  options?: QueryOptions<SalesAnalysisListResponse>,
) =>
  useQuery<SalesAnalysisListResponse, Error>({
    queryKey: salesAnalysesQueryKeys.salesProfitByCategory(params),
    queryFn: () => getSalesProfitByCategory(params),
    ...options,
  });

export const useHierarchicalSales = (
  params: HierarchicalSalesParams,
  options?: QueryOptions<SalesAnalysisListResponse>,
) =>
  useQuery<SalesAnalysisListResponse, Error>({
    queryKey: salesAnalysesQueryKeys.hierarchicalSales(params),
    queryFn: () => getHierarchicalSales(params),
    ...options,
  });

export const useMonthlyProfit = (
  params: MonthlyProfitParams,
  options?: QueryOptions<SalesAnalysisListResponse>,
) =>
  useQuery<SalesAnalysisListResponse, Error>({
    queryKey: salesAnalysesQueryKeys.monthlyProfit(params),
    queryFn: () => getMonthlyProfit(params),
    ...options,
  });

export const useDetailedTimeSales = (
  params: DetailedTimeSalesParams,
  options?: QueryOptions<SalesAnalysisListResponse>,
) =>
  useQuery<SalesAnalysisListResponse, Error>({
    queryKey: salesAnalysesQueryKeys.detailedTimeSales(params),
    queryFn: () => getDetailedTimeSales(params),
    ...options,
  });

export const useDetailedSalesBreakdown = (
  params: DetailedSalesBreakdownParams,
  options?: QueryOptions<SalesAnalysisListResponse>,
) =>
  useQuery<SalesAnalysisListResponse, Error>({
    queryKey: salesAnalysesQueryKeys.detailedSalesBreakdown(params),
    queryFn: () => getDetailedSalesBreakdown(params),
    ...options,
  });

export const useTransactionsWaterfall = (
  params: TransactionsWaterfallParams,
  options?: QueryOptions<SalesAnalysisListResponse>,
) =>
  useQuery<SalesAnalysisListResponse, Error>({
    queryKey: salesAnalysesQueryKeys.transactionsWaterfall(params),
    queryFn: () => getTransactionsWaterfall(params),
    ...options,
  });
