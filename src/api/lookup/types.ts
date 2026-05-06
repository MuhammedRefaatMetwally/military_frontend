// ─────────────────────────────────────────────────────────────────────────────
// Shared pagination wrapper
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Shared list-query params (all lookup endpoints share these)
  // ─────────────────────────────────────────────────────────────────────────────
  
  export interface BaseLookupParams {
    /** Substring / icontains search on name (or agreement_no where noted) */
    search?: string;
    /** Comma-separated sort fields, prefix with `-` for descending */
    ordering?: string;
    /** 1-based page number */
    page?: number;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Region
  // ─────────────────────────────────────────────────────────────────────────────
  
  export interface Region {
    id: number;
    code: number;
    name: string;
  }
  
  export interface ListRegionsParams extends BaseLookupParams {
    /** Exact match (integer) */
    code?: number;
    /** Substring match (icontains) */
    name?: string;
  }
  
  export type ListRegionsResponse = PaginatedResponse<Region>;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Branch
  // ─────────────────────────────────────────────────────────────────────────────
  
  export interface Branch {
    id: number;
    branch_no: number;
    name: string;
    region: number;
    region_name: string;
  }
  
  export interface ListBranchesParams extends BaseLookupParams {
    /** Exact match (integer) */
    branch_no?: number;
    /** Region name string, e.g. "North Region" */
    region?: string;
    /** Substring match (icontains) */
    name?: string;
  }
  
  export type ListBranchesResponse = PaginatedResponse<Branch>;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Company
  // ─────────────────────────────────────────────────────────────────────────────
  
  export interface Company {
    id: number;
    code: number;
    name: string;
  }
  
  export interface ListCompaniesParams extends BaseLookupParams {
    /** Exact match (integer) */
    code?: number;
    /** Substring match (icontains) */
    name?: string;
  }
  
  export type ListCompaniesResponse = PaginatedResponse<Company>;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Group 1
  // ─────────────────────────────────────────────────────────────────────────────
  
  export interface Group1 {
    id: number;
    code: string;
    name: string;
  }
  
  export interface ListGroup1Params extends BaseLookupParams {
    /** Substring match (icontains) */
    code?: string;
    /** Substring match (icontains) */
    name?: string;
  }
  
  export type ListGroup1Response = PaginatedResponse<Group1>;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Group 2
  // ─────────────────────────────────────────────────────────────────────────────
  
  export interface Group2 {
    id: number;
    group1: number;
    group1_name: string;
    code: string;
    name: string;
  }
  
  export interface ListGroup2Params extends BaseLookupParams {
    code?: string;
    name?: string;
    /** Filter by Group1 primary key */
    group1?: number;
  }
  
  export type ListGroup2Response = PaginatedResponse<Group2>;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Group 3
  // ─────────────────────────────────────────────────────────────────────────────
  
  export interface Group3 {
    id: number;
    group1: number;
    group1_name: string;
    group2: number;
    group2_name: string;
    code: string;
    name: string;
  }
  
  export interface ListGroup3Params extends BaseLookupParams {
    code?: string;
    name?: string;
    /** Filter by Group2 primary key */
    group2?: number;
  }
  
  export type ListGroup3Response = PaginatedResponse<Group3>;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Product
  // ─────────────────────────────────────────────────────────────────────────────
  
  export interface Product {
    id: number;
    group1: number;
    group1_name: string;
    group2: number;
    group2_name: string;
    group3: number;
    group3_code: string;
    group3_name: string;
    code: string;
    name: string;
  }
  
  export interface ListProductsParams extends BaseLookupParams {
    /** Comma-separated Group1 ids */
    group1_ids?: string;
    /** Comma-separated Group2 ids */
    group2_ids?: string;
    /** Comma-separated Group3 ids */
    group3_ids?: string;
    /** Comma-separated Agreement ids */
    agreement_ids?: string;
  }
  
  export type ListProductsResponse = PaginatedResponse<Product>;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Agreement
  // ─────────────────────────────────────────────────────────────────────────────
  
  export interface Agreement {
    id: number;
    agreement_no: string;
    start_date: string; // ISO date "YYYY-MM-DD"
    end_date: string;   // ISO date "YYYY-MM-DD"
    company: number;
    company_code: number;
    company_name: string;
  }
  
  export interface ListAgreementsParams extends BaseLookupParams {
    /** Exact match on agreement_no */
    agreement_no?: string;
    /** Company primary key (FK id) */
    company?: number;
    /** start_date >= YYYY-MM-DD */
    start_date_from?: string;
    /** start_date <= YYYY-MM-DD */
    start_date_to?: string;
    /** end_date >= YYYY-MM-DD */
    end_date_from?: string;
    /** end_date <= YYYY-MM-DD */
    end_date_to?: string;
  }
  
  export type ListAgreementsResponse = PaginatedResponse<Agreement>;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Agreement-Product
  // ─────────────────────────────────────────────────────────────────────────────
  
  export interface AgreementProduct {
    id: number;
    agreement: number;
    agreement_no: string;
    company: number;
    company_name: string;
    product: number;
    product_code: string;
    product_name: string;
  }
  
  export interface ListAgreementProductsParams extends BaseLookupParams {
    /** Agreement primary key (FK id) */
    agreement?: number;
    /** Product primary key (FK id) */
    product?: number;
  }
  
  export type ListAgreementProductsResponse = PaginatedResponse<AgreementProduct>;