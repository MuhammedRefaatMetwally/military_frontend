import type { LucideIcon } from "lucide-react";

export interface SalesStatsSummary {
  totalRevenue: number;
  totalCost: number;
  totalDiscount: number;
  branchesCount: number;
  invoicesCount: number;
  averageBasket: number;
}

export interface SalesStatItem {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel: string;
  color: string;
}
