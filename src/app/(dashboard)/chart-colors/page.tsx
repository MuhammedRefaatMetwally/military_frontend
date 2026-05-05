"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { mergeAnalyticsPalette } from "@/lib/colors";
import { useAnalyticsPaletteStore } from "@/store/analyticsPaletteStore";
import GreenGradient from "./components/green-gradient/GreenGradient";
import Header from "./components/header/Header";
import PrimaryColors from "./components/primary-colors/PrimaryColors";
import QuickPreview from "./components/quick-preview/QuickPreview";

export default function ChartColorsPage() {
  const overrides = useAnalyticsPaletteStore(useShallow((s) => s.overrides));
  const merged = useMemo(() => mergeAnalyticsPalette(overrides), [overrides]);

  const setField = useAnalyticsPaletteStore((s) => s.setField);
  const setGreenScaleStep = useAnalyticsPaletteStore((s) => s.setGreenScaleStep);
  const reset = useAnalyticsPaletteStore((s) => s.reset);

  return (
    <div className="space-y-6 pb-10">
      <Header />
      <QuickPreview merged={merged} onReset={reset} />
      <PrimaryColors merged={merged} setField={setField} />
      <GreenGradient merged={merged} setGreenScaleStep={setGreenScaleStep} />
    </div>
  );
}
