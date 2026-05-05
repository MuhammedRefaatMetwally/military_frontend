import { Activity, Target, Zap } from "lucide-react";

type StatItem = {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  dir?: "ltr" | "rtl";
};

export const stats: StatItem[] = [
  {
    icon: Activity,
    label: "صحة النظام:",
    value: "98.7%",
    color: "var(--accent-green)",
    dir: "ltr",
  },
  {
    icon: Zap,
    label: "مهام نشطة:",
    value: "3",
    color: "var(--accent-amber)",
  },
  {
    icon: Target,
    label: "نماذج AI:",
    value: "متصل",
    color: "var(--accent-cyan)",
  },
];
