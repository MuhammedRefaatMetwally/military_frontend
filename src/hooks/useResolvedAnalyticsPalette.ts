"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { mergeAnalyticsPalette, type AnalyticsPalette } from "@/lib/colors";
import { useAnalyticsPaletteStore } from "@/store/analyticsPaletteStore";

export function useResolvedAnalyticsPalette(): AnalyticsPalette {
  const overrides = useAnalyticsPaletteStore(useShallow((s) => s.overrides));
  return useMemo(() => mergeAnalyticsPalette(overrides), [overrides]);
}
