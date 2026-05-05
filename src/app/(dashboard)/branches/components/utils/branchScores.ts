export const branchScores = [
  {
    id: "b1",
    name: "سوق المنارة",
    score: 59,
    profit: 428_500,
    sales: 2_412_000,
    costs: 1_820_000,
    employees: 142,
    returns: 2.8,
    growth: 6.2,
    discount: 4.1,
  },
  {
    id: "b2",
    name: "سوق سطح النجم",
    score: 38,
    profit: 118_200,
    sales: 892_400,
    costs: 685_000,
    employees: 68,
    returns: 1.1,
    growth: -1.4,
    discount: 5.8,
  },
  {
    id: "b3",
    name: "سوق القويسمة",
    score: 72,
    profit: 512_800,
    sales: 2_105_000,
    costs: 1_520_000,
    employees: 128,
    returns: 1.9,
    growth: 11.3,
    discount: 3.2,
  },
  {
    id: "b4",
    name: "سوق راس العين",
    score: 55,
    profit: 95_400,
    sales: 618_000,
    costs: 465_000,
    employees: 52,
    returns: 2.4,
    growth: 3.1,
    discount: 6.4,
  },
  {
    id: "b5",
    name: "سوق البقعة",
    score: 81,
    profit: 601_200,
    sales: 2_890_000,
    costs: 2_180_000,
    employees: 165,
    returns: 1.4,
    growth: 8.7,
    discount: 2.9,
  },
  {
    id: "b6",
    name: "سوق الدمام",
    score: 46,
    profit: 156_700,
    sales: 1_024_500,
    costs: 775_000,
    employees: 79,
    returns: 3.2,
    growth: 0.8,
    discount: 5.1,
  },
  {
    id: "b7",
    name: "سوق الخبر",
    score: 75,
    profit: 489_000,
    sales: 2_198_000,
    costs: 1_620_000,
    employees: 121,
    returns: 1.6,
    growth: 9.5,
    discount: 3.6,
  },
  {
    id: "b8",
    name: "سوق جدة",
    score: 35,
    profit: 72_300,
    sales: 541_200,
    costs: 410_000,
    employees: 45,
    returns: 4.8,
    growth: -2.6,
    discount: 7.2,
  },
];

export const BRANCH_PERF_QUARTER_LABELS = [
  "الربع الأول",
  "الربع الثاني",
  "الربع الثالث",
  "الربع الرابع",
] as const;
export const BRANCH_PERF_BIMONTH_LABELS = [
  "يناير–فبراير",
  "مارس–أبريل",
  "مايو–جون",
  "يوليو–أغسطس",
  "سبتمبر–أكتوبر",
  "نوفمبر–ديسمبر",
] as const;
export function branchPerfPeriodScore(
  baseScore: number,
  branchIndex: number,
  periodIndex: number,
  periodCount: number,
): number {
  const wave =
    Math.sin((periodIndex / periodCount) * Math.PI * 2 + branchIndex * 0.65) *
    7;
  const noise = ((branchIndex * 17 + periodIndex * 11) % 9) - 4;
  return Math.max(18, Math.min(98, Math.round(baseScore + wave + noise)));
}
export function getBarColor(score: number) {
  if (score >= 70) return "var(--accent-green)";
  if (score >= 50) return "var(--accent-amber)";
  if (score >= 30) return "#f97316";
  return "var(--accent-red)";
}
