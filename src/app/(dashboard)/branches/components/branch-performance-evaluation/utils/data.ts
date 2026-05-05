import { branchScores } from "../../utils/branchScores";

export const standardWeights = [
  { label: "الفرع", value: "5%" },
  { label: "الربح", value: "10%" },
  { label: "عدد الموظفين مقارنة بالمبيعات", value: "7%" },
  { label: "المرتجعات", value: "11%" },
  { label: "النمو", value: "7%" },
  { label: "الخصم", value: "7%" },
  { label: "المبيعات", value: "2%" },
  { label: "التكاليف", value: "15%" },
];
export const weightedBranchSchedule = [
  { label: "الفرع", align: "right" },
  { label: "الربح", align: "center" },
  { label: "عدد الموظفين مقارنة بالمبيعات", align: "center" },
  { label: "المرتجعات", align: "center" },
  { label: "النمو", align: "center" },
  { label: "الخصم", align: "center" },
  { label: "المبيعات", align: "center" },
  { label: "التكاليف", align: "center" },
] as const;

const avgScore = Math.round(
  branchScores.reduce((a, b) => a + b.score, 0) / branchScores.length,
);

export const gColor =
  avgScore >= 70
    ? "var(--accent-green)"
    : avgScore >= 50
      ? "var(--accent-amber)"
      : "var(--accent-red)";
