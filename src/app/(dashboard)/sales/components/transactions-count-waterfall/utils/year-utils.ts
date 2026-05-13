import { YEAR_FROM, CURRENT_YEAR } from "./constants";

export function deriveGlobalYears(
  year: string,
  dateRangeFrom: string | null,
  dateRangeTo: string | null,
): { yearFrom: number; yearTo: number } {
  if (dateRangeFrom && dateRangeTo) {
    return {
      yearFrom: new Date(dateRangeFrom).getFullYear(),
      yearTo: new Date(dateRangeTo).getFullYear(),
    };
  }
  const parsed = parseInt(year, 10);
  if (!isNaN(parsed)) return { yearFrom: parsed, yearTo: parsed };
  return { yearFrom: YEAR_FROM, yearTo: CURRENT_YEAR };
}