"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  mergeAnalyticsPalette,
  type AnalyticsPalette,
  type AnalyticsPaletteOverrides,
} from "@/lib/colors";

type PaletteFieldKey = keyof Omit<
  AnalyticsPalette,
  "greenScale" | "seriesPalette"
>;

export interface AnalyticsPaletteState {
  overrides: AnalyticsPaletteOverrides;
  setField: (key: PaletteFieldKey, value: string) => void;
  setGreenScaleStep: (index: number, value: string) => void;
  setSeriesPaletteStep: (index: number, value: string) => void;
  reset: () => void;
}

export const useAnalyticsPaletteStore = create<AnalyticsPaletteState>()(
  persist(
    (set) => ({
      overrides: {},
      setField: (key, value) =>
        set((s) => ({
          overrides: { ...s.overrides, [key]: value },
        })),
      setGreenScaleStep: (index, value) =>
        set((s) => {
          const merged = mergeAnalyticsPalette(s.overrides);
          const arr = [...merged.greenScale];
          if (index >= 0 && index < arr.length) arr[index] = value;
          return { overrides: { ...s.overrides, greenScale: arr } };
        }),
      setSeriesPaletteStep: (index, value) =>
        set((s) => {
          const merged = mergeAnalyticsPalette(s.overrides);
          const arr = [...merged.seriesPalette];
          if (index >= 0 && index < arr.length) arr[index] = value;
          return { overrides: { ...s.overrides, seriesPalette: arr } };
        }),
      reset: () => set({ overrides: {} }),
    }),
    { name: "analytics-palette-v1" },
  ),
);
