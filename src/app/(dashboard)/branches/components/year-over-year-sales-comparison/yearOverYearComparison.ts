const yoyQuarterLabels = [
  "الربع الأول",
  "الربع الثاني",
  "الربع الثالث",
  "الربع الرابع",
] as const;

const yoyQuarterMonths = [
  ["يناير", "فبراير", "مارس"],
  ["أبريل", "مايو", "جون"],
  ["يوليو", "أغسطس", "سبتمبر"],
  ["أكتوبر", "نوفمبر", "ديسمبر"],
] as const;

const yoyWeights = [0.24, 0.25, 0.26, 0.25];

function split3Exact(total: number): [number, number, number] {
  const a = Math.round(total / 3);
  const b = Math.round((total - a) / 2);
  return [a, b, total - a - b];
}

function splitYearIntoQuarterTotals(
  yearAc: number,
  weights: readonly number[],
): [number, number, number, number] {
  const a = [0, 0, 0, 0];
  for (let i = 0; i < 3; i++) a[i] = Math.round(yearAc * weights[i]);
  a[3] = yearAc - a[0] - a[1] - a[2];
  return [a[0], a[1], a[2], a[3]];
}

function buildQuartersForYear(yearPy: number, yearAc: number | null) {
  const qpys = [0, 0, 0, 0];
  for (let i = 0; i < 3; i++) qpys[i] = Math.round(yearPy * yoyWeights[i]);
  qpys[3] = yearPy - qpys[0] - qpys[1] - qpys[2];
  const qacs: (number | null)[] =
    yearAc === null
      ? [null, null, null, null]
      : splitYearIntoQuarterTotals(yearAc, yoyWeights);
  return yoyQuarterLabels.map((label, qi) => {
    const qpy = qpys[qi];
    const qac = qacs[qi];
    const [m0, m1, m2] = split3Exact(qpy);
    const mac =
      qac === null ? ([null, null, null] as const) : split3Exact(qac);
    return {
      label,
      py: qpy,
      ac: qac,
      months: yoyQuarterMonths[qi].map((name, mi) => ({
        name,
        py: [m0, m1, m2][mi],
        ac: mac[mi],
      })),
    };
  });
}

const yoyBase = [
  {
    branch: "سوق المنارة",
    py: 73100,
    ac: 24400,
    years: [
      { year: "2020", py: 45200, ac: null as number | null },
      { year: "2022", py: 27900, ac: 24400 },
      { year: "2021", py: 45100, ac: 27900 },
    ],
  },
  {
    branch: "سوق البقعة",
    py: 68200,
    ac: 52100,
    years: [
      { year: "2020", py: 42000, ac: null as number | null },
      { year: "2022", py: 55800, ac: 52100 },
      { year: "2021", py: 42000, ac: 55800 },
    ],
  },
  {
    branch: "سوق الخبر",
    py: 42000,
    ac: 56000,
    years: [
      { year: "2020", py: 30000, ac: null as number | null },
      { year: "2022", py: 44000, ac: 56000 },
      { year: "2021", py: 30000, ac: 44000 },
    ],
  },
  {
    branch: "سوق القويسمة",
    py: 52300,
    ac: 39200,
    years: [
      { year: "2020", py: 35600, ac: null as number | null },
      { year: "2022", py: 38400, ac: 39200 },
      { year: "2021", py: 35600, ac: 38400 },
    ],
  },
  {
    branch: "سوق سطح النجم",
    py: 41200,
    ac: 21800,
    years: [
      { year: "2020", py: 28900, ac: null as number | null },
      { year: "2022", py: 32100, ac: 21800 },
      { year: "2021", py: 28900, ac: 32100 },
    ],
  },
  {
    branch: "سوق الدمام",
    py: 35800,
    ac: 16200,
    years: [
      { year: "2020", py: 22300, ac: null as number | null },
      { year: "2022", py: 22300, ac: 16200 },
      { year: "2021", py: 22300, ac: 22300 },
    ],
  },
  {
    branch: "سوق راس العين",
    py: 28100,
    ac: 13500,
    years: [
      { year: "2020", py: 18200, ac: null as number | null },
      { year: "2022", py: 18200, ac: 13500 },
      { year: "2021", py: 18200, ac: 18200 },
    ],
  },
  {
    branch: "سوق جدة",
    py: 22400,
    ac: 10800,
    years: [
      { year: "2020", py: 15200, ac: null as number | null },
      { year: "2022", py: 15200, ac: 10800 },
      { year: "2021", py: 15200, ac: 15200 },
    ],
  },
] as const;

export const yoyData = yoyBase.map((d) => ({
  branch: d.branch,
  py: d.py,
  ac: d.ac,
  years: d.years.map((y) => ({
    year: y.year,
    py: y.py,
    ac: y.ac,
    quarters: buildQuartersForYear(y.py, y.ac),
  })),
}));

const allDeltas = yoyData.flatMap((d) => {
  const out: number[] = [d.ac - d.py];
  for (const y of d.years) {
    if (y.ac !== null) out.push(y.ac - y.py);
    for (const q of y.quarters) {
      if (q.ac !== null) out.push(q.ac - q.py);
      for (const m of q.months) {
        if (m.ac !== null) out.push(m.ac - m.py);
      }
    }
  }
  return out;
});

export const maxAbsDelta = Math.max(...allDeltas.map(Math.abs), 1);

export const fmt = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`;

export const fmtDelta = (v: number) => `${v >= 0 ? "+" : ""}${fmt(v)}`;

export const pct = (ac: number, py: number) =>
  py === 0 ? 0 : ((ac - py) / py) * 100;

export const yoyKey = {
  branch: (b: string) => `yoy_b_${b}`,
  year: (b: string, y: string) => `yoy_y_${b}_${y}`,
  quarter: (b: string, y: string, q: string) => `yoy_q_${b}_${y}_${q}`,
};
