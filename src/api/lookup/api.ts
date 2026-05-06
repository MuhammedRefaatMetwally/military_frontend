import axiosInstance from "@/api/axiosInstance";
import { withDefinedParams } from "@/api/sales-analyses";
import type {
  Agreement,
  AgreementProduct,
  Branch,
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
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Base path
// ─────────────────────────────────────────────────────────────────────────────

const LOOKUP_BASE = "/api/lookup";

// ─────────────────────────────────────────────────────────────────────────────
// Query-key factory
// All keys are deterministic from their params so TanStack Query
// can cache, invalidate and dedupe correctly.
// ─────────────────────────────────────────────────────────────────────────────

export const lookupQueryKeys = {
  all: ["lookup"] as const,

  regions: (params?: ListRegionsParams) =>
    [...lookupQueryKeys.all, "regions", params ?? {}] as const,

  regionById: (id: number) =>
    [...lookupQueryKeys.all, "regions", id] as const,

  branches: (params?: ListBranchesParams) =>
    [...lookupQueryKeys.all, "branches", params ?? {}] as const,

  companies: (params?: ListCompaniesParams) =>
    [...lookupQueryKeys.all, "companies", params ?? {}] as const,

  group1: (params?: ListGroup1Params) =>
    [...lookupQueryKeys.all, "group1", params ?? {}] as const,

  group2: (params?: ListGroup2Params) =>
    [...lookupQueryKeys.all, "group2", params ?? {}] as const,

  group3: (params?: ListGroup3Params) =>
    [...lookupQueryKeys.all, "group3", params ?? {}] as const,

  products: (params?: ListProductsParams) =>
    [...lookupQueryKeys.all, "products", params ?? {}] as const,

  agreements: (params?: ListAgreementsParams) =>
    [...lookupQueryKeys.all, "agreements", params ?? {}] as const,

  agreementProducts: (params?: ListAgreementProductsParams) =>
    [...lookupQueryKeys.all, "agreement-products", params ?? {}] as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Regions
// ─────────────────────────────────────────────────────────────────────────────

export const listRegions = async (
  params: ListRegionsParams = {},
): Promise<ListRegionsResponse> => {
  const response = await axiosInstance.get<ListRegionsResponse>(
    `${LOOKUP_BASE}/regions/`,
    {
      params: withDefinedParams({
        code: params.code,
        name: params.name,
        search: params.search,
        ordering: params.ordering,
        page: params.page,
      }),
    },
  );
  return response.data;
};

export const getRegionById = async (id: number): Promise<Region> => {
  const response = await axiosInstance.get<Region>(
    `${LOOKUP_BASE}/regions/${id}/`,
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Branches
// ─────────────────────────────────────────────────────────────────────────────

export const listBranches = async (
  params: ListBranchesParams = {},
): Promise<ListBranchesResponse> => {
  const response = await axiosInstance.get<ListBranchesResponse>(
    `${LOOKUP_BASE}/branches/`,
    {
      params: withDefinedParams({
        branch_no: params.branch_no,
        region: params.region,
        name: params.name,
        search: params.search,
        ordering: params.ordering,
        page: params.page,
      }),
    },
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Companies
// ─────────────────────────────────────────────────────────────────────────────

export const listCompanies = async (
  params: ListCompaniesParams = {},
): Promise<ListCompaniesResponse> => {
  const response = await axiosInstance.get<ListCompaniesResponse>(
    `${LOOKUP_BASE}/companies/`,
    {
      params: withDefinedParams({
        code: params.code,
        name: params.name,
        search: params.search,
        ordering: params.ordering,
        page: params.page,
      }),
    },
  );
  return response.data;
};

export const getCompanyById = async (id: number): Promise<Company> => {
  const response = await axiosInstance.get<Company>(
    `${LOOKUP_BASE}/companies/${id}/`,
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Group 1
// ─────────────────────────────────────────────────────────────────────────────

export const listGroup1 = async (
  params: ListGroup1Params = {},
): Promise<ListGroup1Response> => {
  const response = await axiosInstance.get<ListGroup1Response>(
    `${LOOKUP_BASE}/group1/`,
    {
      params: withDefinedParams({
        code: params.code,
        name: params.name,
        search: params.search,
        ordering: params.ordering,
        page: params.page,
      }),
    },
  );
  return response.data;
};

export const getGroup1ById = async (id: number): Promise<Group1> => {
  const response = await axiosInstance.get<Group1>(
    `${LOOKUP_BASE}/group1/${id}/`,
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Group 2
// ─────────────────────────────────────────────────────────────────────────────

export const listGroup2 = async (
  params: ListGroup2Params = {},
): Promise<ListGroup2Response> => {
  const response = await axiosInstance.get<ListGroup2Response>(
    `${LOOKUP_BASE}/group2/`,
    {
      params: withDefinedParams({
        code: params.code,
        name: params.name,
        group1: params.group1,
        search: params.search,
        ordering: params.ordering,
        page: params.page,
      }),
    },
  );
  return response.data;
};

export const getGroup2ById = async (id: number): Promise<Group2> => {
  const response = await axiosInstance.get<Group2>(
    `${LOOKUP_BASE}/group2/${id}/`,
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Group 3
// ─────────────────────────────────────────────────────────────────────────────

export const listGroup3 = async (
  params: ListGroup3Params = {},
): Promise<ListGroup3Response> => {
  const response = await axiosInstance.get<ListGroup3Response>(
    `${LOOKUP_BASE}/group3/`,
    {
      params: withDefinedParams({
        code: params.code,
        name: params.name,
        group2: params.group2,
        search: params.search,
        ordering: params.ordering,
        page: params.page,
      }),
    },
  );
  return response.data;
};

export const getGroup3ById = async (id: number): Promise<Group3> => {
  const response = await axiosInstance.get<Group3>(
    `${LOOKUP_BASE}/group3/${id}/`,
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────

export const listProducts = async (
  params: ListProductsParams = {},
): Promise<ListProductsResponse> => {
  const response = await axiosInstance.get<ListProductsResponse>(
    `${LOOKUP_BASE}/products/`,
    {
      params: withDefinedParams({
        search: params.search,
        group1_ids: params.group1_ids,
        group2_ids: params.group2_ids,
        group3_ids: params.group3_ids,
        agreement_ids: params.agreement_ids,
        ordering: params.ordering,
        page: params.page,
      }),
    },
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Agreements
// ─────────────────────────────────────────────────────────────────────────────

export const listAgreements = async (
  params: ListAgreementsParams = {},
): Promise<ListAgreementsResponse> => {
  const response = await axiosInstance.get<ListAgreementsResponse>(
    `${LOOKUP_BASE}/agreements/`,
    {
      params: withDefinedParams({
        agreement_no: params.agreement_no,
        company: params.company,
        start_date_from: params.start_date_from,
        start_date_to: params.start_date_to,
        end_date_from: params.end_date_from,
        end_date_to: params.end_date_to,
        search: params.search,
        ordering: params.ordering,
        page: params.page,
      }),
    },
  );
  return response.data;
};

export const getAgreementById = async (id: number): Promise<Agreement> => {
  const response = await axiosInstance.get<Agreement>(
    `${LOOKUP_BASE}/agreements/${id}/`,
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Agreement-Products
// ─────────────────────────────────────────────────────────────────────────────

export const listAgreementProducts = async (
  params: ListAgreementProductsParams = {},
): Promise<ListAgreementProductsResponse> => {
  const response = await axiosInstance.get<ListAgreementProductsResponse>(
    `${LOOKUP_BASE}/agreement-products/`,
    {
      params: withDefinedParams({
        agreement: params.agreement,
        product: params.product,
        search: params.search,
        ordering: params.ordering,
        page: params.page,
      }),
    },
  );
  return response.data;
};

export const getAgreementProductById = async (
  id: number,
): Promise<AgreementProduct> => {
  const response = await axiosInstance.get<AgreementProduct>(
    `${LOOKUP_BASE}/agreement-products/${id}/`,
  );
  return response.data;
};