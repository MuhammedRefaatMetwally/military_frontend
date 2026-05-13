/** Full Arabic number format (e.g. 1,234,567) */
export const fmt = (n: number) =>
    new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(n);
  
  /** Short suffix format (e.g. 1.2M, 3.4B) */
  export const fmtShort = (n: number): string => {
    const abs = Math.abs(n);
    const sign = n < 0 ? "-" : "";
    if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000)     return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)         return `${sign}${(abs / 1_000).toFixed(1)}K`;
    return `${sign}${abs}`;
  };