import axiosInstance from "@/api/axiosInstance";
import type {
  DetailedSalesBreakdownParams,
  DetailedTimeSalesParams,
  DetailedTimeSalesResponse,
  HierarchicalSalesParams,
  HierarchicalSalesResponse,
  MonthlyProfitParams,
  NetSalesProfitChartParams,
  NetSalesProfitChartResponse,
  SalesAnalysisListResponse,
  SalesBreakdownResponse,
  SalesProfitByCategoryParams,
  SalesProfitByCategoryResponse,
  TransactionsWaterfallParams,
} from "./types";

const SALES_ANALYSES_BASE = "/api/datasorce/sales-analyses";

export const toCsv = (values?: Array<string | number>) =>
  values && values.length > 0 ? values.join(",") : undefined;

export const withDefinedParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

const buildBaseFilterParams = (params: {
  years?: number[];
  branchIds?: string[];
  regionIds?: string[];
  group1Ids?: string[];
  group2Ids?: string[];
  group3Ids?: string[];
  agreementId?: string;
}) =>
  withDefinedParams({
    years: toCsv(params.years),
    branch: toCsv(params.branchIds),
    region: toCsv(params.regionIds),
    group1: toCsv(params.group1Ids),
    group2: toCsv(params.group2Ids),
    group3: toCsv(params.group3Ids),
    agreement: params.agreementId,
  });

export const getNetSalesProfitChart = async (
  params: NetSalesProfitChartParams,
): Promise<NetSalesProfitChartResponse> => {
  const response = await axiosInstance.get<NetSalesProfitChartResponse>(
    `${SALES_ANALYSES_BASE}/net-sales-profit-chart/`,
    {
      params: withDefinedParams({
        ...buildBaseFilterParams(params),
        level: params.level,
        indicator: params.indicator ?? "both",
        period: toCsv(params.period),
      }),
    },
  );

  return response.data;
};

export const getSalesProfitByCategory = async (
  params: SalesProfitByCategoryParams,
): Promise<SalesProfitByCategoryResponse> => {
  const response = await axiosInstance.get<SalesProfitByCategoryResponse>(
    `${SALES_ANALYSES_BASE}/sales-profit-by-category/`,
    {
      params: withDefinedParams({
        ...buildBaseFilterParams(params),
        group_level: params.groupLevel,
        level: params.level,
        period: toCsv(params.period),
        quarter: toCsv(params.quarter),
      }),
    },
  );

  return response.data;
};

export const getHierarchicalSales = async (
  params: HierarchicalSalesParams,
): Promise<HierarchicalSalesResponse> => {
  const response = await axiosInstance.get<HierarchicalSalesResponse>(
    `${SALES_ANALYSES_BASE}/hierarchical-sales/`,
    { params: withDefinedParams({
      ...buildBaseFilterParams(params),
      at: params.at,
      level: params.level,
      period: toCsv(params.period),
      split_by_period:
        params.splitByPeriod === undefined
          ? undefined
          : String(params.splitByPeriod),
    }), },
  );
  return response.data;
};


export const getMonthlyProfit = async (
  params: MonthlyProfitParams,
): Promise<SalesAnalysisListResponse> => {
  const response = await axiosInstance.get<SalesAnalysisListResponse>(
    `${SALES_ANALYSES_BASE}/monthly-profit/`,
    {
      params: withDefinedParams({
        ...buildBaseFilterParams(params),
        year_from: params.yearFrom,
        year_to: params.yearTo,
      }),
    },
  );

  return response.data;
};

export const getDetailedTimeSales = async (
  params: DetailedTimeSalesParams,
): Promise<DetailedTimeSalesResponse> => {
  const response = await axiosInstance.get<DetailedTimeSalesResponse>(
    `${SALES_ANALYSES_BASE}/detailed-time-sales/`,
    { params: withDefinedParams({ ...buildBaseFilterParams(params) }) },
  );
  return response.data;
};

export const getDetailedSalesBreakdown = async (
  params: DetailedSalesBreakdownParams,
): Promise<SalesBreakdownResponse> => {
  const response = await axiosInstance.get<SalesBreakdownResponse>(
    `${SALES_ANALYSES_BASE}/detailed-sales-breakdown/`,
    {
      params: withDefinedParams({
        at: params.at,
        ...buildBaseFilterParams(params),
      }),
    },
  );
  return response.data;
};

export const getTransactionsWaterfall = async (
  params: TransactionsWaterfallParams,
): Promise<SalesAnalysisListResponse> => {
  const response = await axiosInstance.get<SalesAnalysisListResponse>(
    `${SALES_ANALYSES_BASE}/transactions-waterfall/`,
    {
      params: withDefinedParams({
        granularity: params.granularity,
        years: toCsv(params.years),
        year_from: params.yearFrom,
        year_to: params.yearTo,
        branch: toCsv(params.branchIds),
        region: toCsv(params.regionIds),
      }),
    },
  );

  return response.data;
};
