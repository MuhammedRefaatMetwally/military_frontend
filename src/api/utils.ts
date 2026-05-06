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