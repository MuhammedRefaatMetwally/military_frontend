# Sales Analyses API Contracts

This module centralizes the sales analysis endpoints under:

- `/api/datasorce/sales-analyses/*`

## Why This Exists

The provided Postman docs contain a few inconsistencies (for example, some examples show `at=group1` under the "group2" endpoint label, or vary between `level/period` and `quarter`).  
To avoid coupling UI code to unclear docs, this layer exposes normalized request contracts and keeps mapping logic in one place.

## Exposed Endpoints

- `getNetSalesProfitChart`
- `getSalesProfitByCategory`
- `getHierarchicalSales`
- `getMonthlyProfit`
- `getDetailedTimeSales`
- `getDetailedSalesBreakdown`
- `getTransactionsWaterfall`

## Hook Layer

Endpoint hooks are available in:

- `src/hooks/useSalesAnalyses.ts`

Hooks provided:

- `useNetSalesProfitChart`
- `useSalesProfitByCategory`
- `useHierarchicalSales`
- `useMonthlyProfit`
- `useDetailedTimeSales`
- `useDetailedSalesBreakdown`
- `useTransactionsWaterfall`

## Key Conventions

- Array filters are accepted as arrays and converted to comma-separated query params.
- Empty/undefined params are omitted from requests.
- Shared filter names are normalized in TypeScript:
  - `branchIds -> branch`
  - `regionIds -> region`
  - `group1Ids -> group1`
  - `group2Ids -> group2`
  - `group3Ids -> group3`

## Typed Inputs and Outputs

- Request contracts are in `types.ts`.
- Query keys are in `queryKeys.ts` for TanStack Query usage.
- Known chart response (`net-sales-profit-chart`) has a dedicated typed response.
- Other endpoints are currently typed as record lists until real payload samples are captured from backend responses.
