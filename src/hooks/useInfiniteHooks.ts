import { ApiError } from "@/api/axiosInstance";
import {
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
} from "@/api/lookup/api";
import type {
  AgreementProduct,
  Agreement,
  Branch,
  Company,
  Group1,
  Group2,
  Group3,
  ListAgreementProductsParams,
  ListAgreementsParams,
  ListBranchesParams,
  ListCompaniesParams,
  ListGroup1Params,
  ListGroup2Params,
  ListGroup3Params,
  ListProductsParams,
  ListRegionsParams,
  PaginatedResponse,
  Product,
  Region,
} from "@/api/lookup/types";
import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
  type InfiniteData,
} from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Extract the numeric page from a DRF next/previous URL, or return null. */
const extractPage = (url: string | null): number | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const p = u.searchParams.get("page");
    return p ? Number(p) : null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared options type
//
// TanStack Query v5 signature:
//   UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>
//   (5 type params max — no separate TQueryData slot)
//
// We wrap TData as InfiniteData<TQueryFnData> which is what the hook returns,
// and strip the keys we always control internally.
// ─────────────────────────────────────────────────────────────────────────────

type InfiniteOptions<T> = Omit<
  UseInfiniteQueryOptions<
    PaginatedResponse<T>,               // TQueryFnData
    ApiError,                           // TError
    InfiniteData<PaginatedResponse<T>>, // TData
    readonly unknown[],                 // TQueryKey
    number                              // TPageParam
  >,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;

// ─────────────────────────────────────────────────────────────────────────────
// Shared cache defaults for reference / lookup data
// ─────────────────────────────────────────────────────────────────────────────

const STALE = 10 * 60_000; // 10 min
const GC    = 60 * 60_000; // 60 min

// ─────────────────────────────────────────────────────────────────────────────
// Regions
// ─────────────────────────────────────────────────────────────────────────────

export const useInfiniteRegions = (
  params: Omit<ListRegionsParams, "page"> = {},
  options?: InfiniteOptions<Region>,
) =>
  useInfiniteQuery<
    PaginatedResponse<Region>,
    ApiError,
    InfiniteData<PaginatedResponse<Region>>,
    readonly unknown[],
    number
  >({
    queryKey: lookupQueryKeys.regions(params),
    queryFn: ({ pageParam }) => listRegions({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => extractPage(last.next),
    staleTime: STALE,
    gcTime: GC,
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Branches
// ─────────────────────────────────────────────────────────────────────────────

export const useInfiniteBranches = (
  params: Omit<ListBranchesParams, "page"> = {},
  options?: InfiniteOptions<Branch>,
) =>
  useInfiniteQuery<
    PaginatedResponse<Branch>,
    ApiError,
    InfiniteData<PaginatedResponse<Branch>>,
    readonly unknown[],
    number
  >({
    queryKey: lookupQueryKeys.branches(params),
    queryFn: ({ pageParam }) => listBranches({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => extractPage(last.next),
    staleTime: STALE,
    gcTime: GC,
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Companies
// ─────────────────────────────────────────────────────────────────────────────

export const useInfiniteCompanies = (
  params: Omit<ListCompaniesParams, "page"> = {},
  options?: InfiniteOptions<Company>,
) =>
  useInfiniteQuery<
    PaginatedResponse<Company>,
    ApiError,
    InfiniteData<PaginatedResponse<Company>>,
    readonly unknown[],
    number
  >({
    queryKey: lookupQueryKeys.companies(params),
    queryFn: ({ pageParam }) => listCompanies({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => extractPage(last.next),
    staleTime: STALE,
    gcTime: GC,
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Group 1
// ─────────────────────────────────────────────────────────────────────────────

export const useInfiniteGroup1 = (
  params: Omit<ListGroup1Params, "page"> = {},
  options?: InfiniteOptions<Group1>,
) =>
  useInfiniteQuery<
    PaginatedResponse<Group1>,
    ApiError,
    InfiniteData<PaginatedResponse<Group1>>,
    readonly unknown[],
    number
  >({
    queryKey: lookupQueryKeys.group1(params),
    queryFn: ({ pageParam }) => listGroup1({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => extractPage(last.next),
    staleTime: STALE,
    gcTime: GC,
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Group 2
// ─────────────────────────────────────────────────────────────────────────────

export const useInfiniteGroup2 = (
  params: Omit<ListGroup2Params, "page"> = {},
  options?: InfiniteOptions<Group2>,
) =>
  useInfiniteQuery<
    PaginatedResponse<Group2>,
    ApiError,
    InfiniteData<PaginatedResponse<Group2>>,
    readonly unknown[],
    number
  >({
    queryKey: lookupQueryKeys.group2(params),
    queryFn: ({ pageParam }) => listGroup2({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => extractPage(last.next),
    staleTime: STALE,
    gcTime: GC,
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Group 3
// ─────────────────────────────────────────────────────────────────────────────

export const useInfiniteGroup3 = (
  params: Omit<ListGroup3Params, "page"> = {},
  options?: InfiniteOptions<Group3>,
) =>
  useInfiniteQuery<
    PaginatedResponse<Group3>,
    ApiError,
    InfiniteData<PaginatedResponse<Group3>>,
    readonly unknown[],
    number
  >({
    queryKey: lookupQueryKeys.group3(params),
    queryFn: ({ pageParam }) => listGroup3({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => extractPage(last.next),
    staleTime: STALE,
    gcTime: GC,
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────

export const useInfiniteProducts = (
  params: Omit<ListProductsParams, "page"> = {},
  options?: InfiniteOptions<Product>,
) =>
  useInfiniteQuery<
    PaginatedResponse<Product>,
    ApiError,
    InfiniteData<PaginatedResponse<Product>>,
    readonly unknown[],
    number
  >({
    queryKey: lookupQueryKeys.products(params),
    queryFn: ({ pageParam }) => listProducts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => extractPage(last.next),
    staleTime: STALE,
    gcTime: GC,
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Agreements
// ─────────────────────────────────────────────────────────────────────────────

export const useInfiniteAgreements = (
  params: Omit<ListAgreementsParams, "page"> = {},
  options?: InfiniteOptions<Agreement>,
) =>
  useInfiniteQuery<
    PaginatedResponse<Agreement>,
    ApiError,
    InfiniteData<PaginatedResponse<Agreement>>,
    readonly unknown[],
    number
  >({
    queryKey: lookupQueryKeys.agreements(params),
    queryFn: ({ pageParam }) => listAgreements({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => extractPage(last.next),
    staleTime: STALE,
    gcTime: GC,
    ...options,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Agreement-Products
// ─────────────────────────────────────────────────────────────────────────────

export const useInfiniteAgreementProducts = (
  params: Omit<ListAgreementProductsParams, "page"> = {},
  options?: InfiniteOptions<AgreementProduct>,
) =>
  useInfiniteQuery<
    PaginatedResponse<AgreementProduct>,
    ApiError,
    InfiniteData<PaginatedResponse<AgreementProduct>>,
    readonly unknown[],
    number
  >({
    queryKey: lookupQueryKeys.agreementProducts(params),
    queryFn: ({ pageParam }) =>
      listAgreementProducts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => extractPage(last.next),
    staleTime: STALE,
    gcTime: GC,
    ...options,
  });