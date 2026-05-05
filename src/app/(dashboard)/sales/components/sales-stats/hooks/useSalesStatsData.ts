import { useMemo } from "react";
import {
  buildSalesStatItems,
  getFallbackSalesStatsSummary,
} from "../utils/salesStats";

export const useSalesStatsData = () => {
  // API integration point: replace fallback summary with endpoint response mapping.
  const summary = useMemo(() => getFallbackSalesStatsSummary(), []);
  const items = useMemo(() => buildSalesStatItems(summary), [summary]);

  return {
    items,
    isLoading: false,
    error: null as string | null,
  };
};
