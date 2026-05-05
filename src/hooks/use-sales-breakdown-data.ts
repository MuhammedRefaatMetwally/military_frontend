import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://military-project-6jpnk.ondigitalocean.app';

export interface SalesBreakdownFilters {
  at: 'market' | 'group1' | 'group2' | 'group3' | 'product';
  years?: string; // CSV format: "2017,2018,2026"
  region?: string;
  branch?: string; // CSV format: "51,52,53"
  group1?: string; // CSV format: "29,30,31"
  group2?: string; // CSV format: "171,172,173"
  group3?: string; // CSV format: "1477,1478,1516"
}

export interface SalesBreakdownRecord {
  // Financial Metrics
  total_sales: number;
  net_sales: number;
  discount_value: number;
  discount_pct: number;
  avg_discount_pct: number;
  return_amount: number;
  returned_qty: number;
  return_ratio_pct: number;
  total_profit: number;

  // Quantity Metrics
  sold_qty: number;
  sold_items_value: number;
  item_count: number;
  avg_price: number;
  total_damaged_products: number;

  // Identifiers (only set at that aggregation level)
  id: number | null;
  code: string | null;
  name: string;
  invoice_count: number | null; // ONLY at at=market; null for drill-down
}

export interface SalesBreakdownMaxima {
  total_sales: number;
  net_sales: number;
  discount_value: number;
  return_amount: number;
  returned_qty: number;
  sold_qty: number;
  sold_items_value: number;
  item_count: number;
  total_profit: number;
  total_damaged_products: number;
}

export interface SalesBreakdownResponse {
  at: 'market' | 'group1' | 'group2' | 'group3' | 'product';
  years: number[];
  filters: {
    branch?: number[];
    group1?: number[];
    group2?: number[];
    group3?: number[];
    region?: number[];
  };
  maxima: SalesBreakdownMaxima;
  data: SalesBreakdownRecord[];
  totals: SalesBreakdownRecord;
}

// Build query params without null/undefined values
const buildParams = (filters: SalesBreakdownFilters): Record<string, string> => {
  const params: Record<string, string> = {
    at: filters.at,
  };

  if (filters.years) params.years = filters.years;
  if (filters.region) params.region = filters.region;
  if (filters.branch) params.branch = filters.branch;
  if (filters.group1) params.group1 = filters.group1;
  if (filters.group2) params.group2 = filters.group2;
  if (filters.group3) params.group3 = filters.group3;

  return params;
};

export const useSalesBreakdownData = (filters: SalesBreakdownFilters) => {
  const queryKey = ['sales-breakdown', filters];

  return useQuery<SalesBreakdownResponse, Error>({
    queryKey,
    queryFn: async () => {
      const params = buildParams(filters);
      const queryString = new URLSearchParams(params).toString();
      const url = `${BASE_URL}/api/datasorce/sales-analyses/detailed-sales-breakdown?${queryString}`;

      const response = await axios.get<SalesBreakdownResponse>(url);
      return response.data;
    },
    // Optimizations for big data
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Keep previous data while refetching for smooth UX
    placeholderData: (previousData) => previousData,
  });
};
