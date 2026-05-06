import { ApiError } from "@/api/axiosInstance";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  getAgreementById,
  getAgreementProductById,
  getCompanyById,
  getGroup1ById,
  getGroup2ById,
  getGroup3ById,
  getRegionById,
  listAgreementProducts,
  listAgreements,
  listBranches,
  listCompanies,
  listGroup1,
  listGroup2,
  listGroup3,
  listProducts,
  listRegions,
  lookupQueryKeys,
} from "../api/lookup/api";
import type {
  Agreement,
  AgreementProduct,
  Company,
  Group1,
  Group2,
  Group3,
  ListAgreementProductsParams,
  ListAgreementProductsResponse,
  ListAgreementsParams,
  ListAgreementsResponse,
  ListBranchesParams,
  ListBranchesResponse,
  ListCompaniesParams,
  ListCompaniesResponse,
  ListGroup1Params,
  ListGroup1Response,
  ListGroup2Params,
  ListGroup2Response,
  ListGroup3Params,
  ListGroup3Response,
  ListProductsParams,
  ListProductsResponse,
  ListRegionsParams,
  ListRegionsResponse,
  Region,
} from "../api/lookup/types";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper: strips queryKey / queryFn so callers only pass
// behavioural options (enabled, staleTime, gcTime, …)
// ─────────────────────────────────────────────────────────────────────────────

type QueryOptions<TData, TError = ApiError> = Omit<
  UseQueryOptions<TData, TError>,
  "queryKey" | "queryFn"
>;

// ─────────────────────────────────────────────────────────────────────────────
// Default cache config for lookup / reference data
// These lists rarely change — keep them fresh for 10 min,
// hold in GC for 60 min so navigating back never re-fetches.
// ─────────────────────────────────────────────────────────────────────────────

const LOOKUP_STALE_TIME = 10 * 60_000; // 10 min
const LOOKUP_GC_TIME    = 60 * 60_000; // 60 min

// ─────────────────────────────────────────────────────────────────────────────
// Regions
// ─────────────────────────────────────────────────────────────────────────────

export const useListRegions = (
  params: ListRegionsParams = {},
  options?: QueryOptions<ListRegionsResponse>,
) =>
  useQuery<ListRegionsResponse, ApiError>({
    queryKey: lookupQueryKeys.regions(params),
    queryFn: () => listRegions(params),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    ...options,
  });

export const useRegionById = (
  id: number,
  options?: QueryOptions<Region>,
) =>
  useQuery<Region, ApiError>({
    queryKey: lookupQueryKeys.regionById(id),
    queryFn: () => getRegionById(id),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    enabled: Boolean(id),
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Branches
// Branches are always scoped to a region — disable until region is provided.
// ─────────────────────────────────────────────────────────────────────────────

export const useListBranches = (
  params: ListBranchesParams = {},
  options?: QueryOptions<ListBranchesResponse>,
) =>
  useQuery<ListBranchesResponse, ApiError>({
    queryKey: lookupQueryKeys.branches(params),
    queryFn: () => listBranches(params),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Companies
// ─────────────────────────────────────────────────────────────────────────────

export const useListCompanies = (
  params: ListCompaniesParams = {},
  options?: QueryOptions<ListCompaniesResponse>,
) =>
  useQuery<ListCompaniesResponse, ApiError>({
    queryKey: lookupQueryKeys.companies(params),
    queryFn: () => listCompanies(params),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    ...options,
  });

export const useCompanyById = (
  id: number,
  options?: QueryOptions<Company>,
) =>
  useQuery<Company, ApiError>({
    queryKey: [...lookupQueryKeys.all, "companies", id] as const,
    queryFn: () => getCompanyById(id),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    enabled: Boolean(id),
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Group 1
// ─────────────────────────────────────────────────────────────────────────────

export const useListGroup1 = (
  params: ListGroup1Params = {},
  options?: QueryOptions<ListGroup1Response>,
) =>
  useQuery<ListGroup1Response, ApiError>({
    queryKey: lookupQueryKeys.group1(params),
    queryFn: () => listGroup1(params),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    ...options,
  });

export const useGroup1ById = (
  id: number,
  options?: QueryOptions<Group1>,
) =>
  useQuery<Group1, ApiError>({
    queryKey: [...lookupQueryKeys.all, "group1", id] as const,
    queryFn: () => getGroup1ById(id),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    enabled: Boolean(id),
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Group 2  (depends on group1 selection)
// ─────────────────────────────────────────────────────────────────────────────

export const useListGroup2 = (
  params: ListGroup2Params = {},
  options?: QueryOptions<ListGroup2Response>,
) =>
  useQuery<ListGroup2Response, ApiError>({
    queryKey: lookupQueryKeys.group2(params),
    queryFn: () => listGroup2(params),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    ...options,
  });

export const useGroup2ById = (
  id: number,
  options?: QueryOptions<Group2>,
) =>
  useQuery<Group2, ApiError>({
    queryKey: [...lookupQueryKeys.all, "group2", id] as const,
    queryFn: () => getGroup2ById(id),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    enabled: Boolean(id),
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Group 3  (depends on group2 selection)
// ─────────────────────────────────────────────────────────────────────────────

export const useListGroup3 = (
  params: ListGroup3Params = {},
  options?: QueryOptions<ListGroup3Response>,
) =>
  useQuery<ListGroup3Response, ApiError>({
    queryKey: lookupQueryKeys.group3(params),
    queryFn: () => listGroup3(params),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    ...options,
  });

export const useGroup3ById = (
  id: number,
  options?: QueryOptions<Group3>,
) =>
  useQuery<Group3, ApiError>({
    queryKey: [...lookupQueryKeys.all, "group3", id] as const,
    queryFn: () => getGroup3ById(id),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    enabled: Boolean(id),
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Products  (depends on group1/2/3 and/or agreement selection)
// Disable until at least one grouping filter or agreement is provided.
// ─────────────────────────────────────────────────────────────────────────────

export const useListProducts = (
  params: ListProductsParams = {},
  options?: QueryOptions<ListProductsResponse>,
) =>
  useQuery<ListProductsResponse, ApiError>({
    queryKey: lookupQueryKeys.products(params),
    queryFn: () => listProducts(params),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Agreements
// ─────────────────────────────────────────────────────────────────────────────

export const useListAgreements = (
  params: ListAgreementsParams = {},
  options?: QueryOptions<ListAgreementsResponse>,
) =>
  useQuery<ListAgreementsResponse, ApiError>({
    queryKey: lookupQueryKeys.agreements(params),
    queryFn: () => listAgreements(params),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    ...options,
  });

export const useAgreementById = (
  id: number,
  options?: QueryOptions<Agreement>,
) =>
  useQuery<Agreement, ApiError>({
    queryKey: [...lookupQueryKeys.all, "agreements", id] as const,
    queryFn: () => getAgreementById(id),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    enabled: Boolean(id),
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Agreement-Products  (depends on agreement / product selection)
// ─────────────────────────────────────────────────────────────────────────────

export const useListAgreementProducts = (
  params: ListAgreementProductsParams = {},
  options?: QueryOptions<ListAgreementProductsResponse>,
) =>
  useQuery<ListAgreementProductsResponse, ApiError>({
    queryKey: lookupQueryKeys.agreementProducts(params),
    queryFn: () => listAgreementProducts(params),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    ...options,
  });

export const useAgreementProductById = (
  id: number,
  options?: QueryOptions<AgreementProduct>,
) =>
  useQuery<AgreementProduct, ApiError>({
    queryKey: [...lookupQueryKeys.all, "agreement-products", id] as const,
    queryFn: () => getAgreementProductById(id),
    staleTime: LOOKUP_STALE_TIME,
    gcTime: LOOKUP_GC_TIME,
    enabled: Boolean(id),
    ...options,
  });