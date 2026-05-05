import { getBranchData, getRegionalData } from "@/lib/mockData";
import { Award, Building2, MapPin, Scale } from "lucide-react";
import { branchScores } from "../../utils/branchScores";

const regions = getRegionalData();

const branches = getBranchData();

const topBranch = [...branches].sort((a, b) => b.revenue - a.revenue)[0];

const avgScore = Math.round(
  branchScores.reduce((a, b) => a + b.score, 0) / branchScores.length,
);

export const branchesStats = [
  {
    icon: Building2,
    label: "إجمالي الفروع",
    value: branches.length,
    color: "var(--accent-green)",
  },
  {
    icon: MapPin,
    label: "المناطق",
    value: regions.length,
    color: "var(--accent-blue)",
  },
  {
    icon: Award,
    label: "الأفضل أداءً",
    value: topBranch?.nameAr?.split(" ")[0] || "",
    color: "var(--accent-amber)",
  },
  {
    icon: Scale,
    label: "متوسط الأداء",
    value: `${avgScore}%`,
    color: avgScore >= 70 ? "var(--accent-green)" : "var(--accent-amber)",
  },
];
