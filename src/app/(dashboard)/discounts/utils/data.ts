import { branches } from "./branches";
import { stableHash } from "./stableHash";

export const monthOptions = Array.from(
  { length: 12 },
  (_, i) => `شهر ${i + 1}`,
);

export const tcBranches = branches
  .filter((b) => b.name !== "الإجمالي")
  .map((b) => b.name);

export const monthIdx = (label: string) =>
  Math.max(
    0,
    monthOptions.indexOf(label) === -1 ? 0 : monthOptions.indexOf(label),
  );
export const noDiscNetSalesFor = (branchName: string, m: string) => {
  const mi = monthIdx(m);
  const base = 22000 + (stableHash(`nd_net_${branchName}_${mi}`) % 140000);
  // "بدون خصم" tends to be lower than total; keep stable but seasonal-ish
  const season = 0.78 + (mi % 6) * 0.035;
  return Math.round(base * season);
};
export const noDiscProfitFor = (branchName: string, m: string) => {
  const net = noDiscNetSalesFor(branchName, m);
  const mi = monthIdx(m);
  const margin =
    0.11 + (stableHash(`nd_margin_${branchName}_${mi}`) % 90) / 1000;
  return Math.round(net * margin);
};

export type NetSalesAndProfitsWithoutDiscountProps = {
  tcLeftMonth: string;
  setTcLeftMonth: (m: string) => void;
  tcRightMonth: string;
  setTcRightMonth: (m: string) => void;
};
export const offerDiscountFor = (branchName: string, m: string) => {
  const mi = monthIdx(m);
  const net = noDiscNetSalesFor(branchName, m);
  const rate = 0.015 + (stableHash(`off_rate_${branchName}_${mi}`) % 28) / 1000;
  return Math.round(net * rate);
};

export const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
