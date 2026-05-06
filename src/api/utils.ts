/**
 * Joins an array of strings or numbers into a comma-separated string
 * suitable for multi-value query params.
 * Returns `undefined` (omitted by withDefinedParams) when the array is
 * empty or not provided.
 *
 * @example
 * toCsv([1, 2, 3])   // "1,2,3"
 * toCsv([])          // undefined
 * toCsv(undefined)   // undefined
 */
export const toCsv = (values?: Array<string | number>): string | undefined =>
    values && values.length > 0 ? values.join(",") : undefined;
  
  /**
   * Strips every key whose value is `undefined`, `null`, or `""` from a
   * params object so Axios never serialises empty query-string keys.
   *
   * @example
   * withDefinedParams({ a: 1, b: undefined, c: "" })
   * // { a: 1 }
   */
  export const withDefinedParams = (
    params: Record<string, unknown>,
  ): Record<string, unknown> =>
    Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== null && value !== "",
      ),
    );


    export function fmt(v: number | null, key: string): string {
      if (v === null) return "—";
    
      // Percentages
      if (key === "discountPct" || key === "avgDiscRate") return `${v.toFixed(1)}%`;
    
      // Pure counts — no decimals
      if (key === "invoiceCount" || key === "returnedItemCount" || key === "itemCount") {
        return Math.round(v).toLocaleString("en-US");
      }
    
      // Quantity — abbreviate if large
      if (key === "productVolume") {
        if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
        if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
        return Math.round(v).toLocaleString("en-US");
      }
    
      // Avg price — 2 decimals, no abbreviation
      if (key === "avgPrice") return v.toFixed(2);
    
      // Returns — color handled separately, abbreviate value
      // All money values — abbreviate
      if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
      if (Math.abs(v) >= 1_000_000)     return `${(v / 1_000_000).toFixed(2)}M`;
      if (Math.abs(v) >= 1_000)         return `${(v / 1_000).toFixed(1)}K`;
      return v.toFixed(2);
    }


    // Helper to get raw full value for tooltip
export function fmtFull(v: number | null, key: string): string {
  if (v === null) return "";
  if (key === "discountPct" || key === "avgDiscRate") return `${v.toFixed(2)}%`;
  if (key === "invoiceCount" || key === "returnedItemCount" || key === "itemCount")
    return Math.round(v).toLocaleString("en-US");
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


