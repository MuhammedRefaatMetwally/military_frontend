import { getMonthlySalesData } from "@/lib/mockData";
import {
  BarChart3,
  Building2,
  DollarSign,
  FileText,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import type { SalesStatItem, SalesStatsSummary } from "../types";

export const getFallbackSalesStatsSummary = (): SalesStatsSummary => {
  const salesData = getMonthlySalesData();
  const totalOrders = salesData.reduce((a, b) => a + b.orders, 0);
  const totalRevenue = salesData.reduce((a, b) => a + b.revenue, 0);
  const totalCost = Math.round(totalRevenue * 0.65);
  const totalDiscount = Math.round(totalRevenue * 0.073);

  return {
    totalRevenue,
    totalCost,
    totalDiscount,
    branchesCount: 47,
    invoicesCount: totalOrders,
    averageBasket: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
  };
};

export const buildSalesStatItems = (summary: SalesStatsSummary): SalesStatItem[] => [
  {
    icon: DollarSign,
    label: "تكلفة المواد",
    value: `${(summary.totalCost / 1000000).toFixed(1)}M`,
    sublabel: "د.أ",
    color: "var(--accent-red)",
  },
  {
    icon: TrendingUp,
    label: "قيمة المبيعات",
    value: `${(summary.totalRevenue / 1000000).toFixed(1)}M`,
    sublabel: "د.أ",
    color: "var(--accent-green)",
  },
  {
    icon: BarChart3,
    label: "قيمة الخصومات",
    value: `${(summary.totalDiscount / 1000000).toFixed(2)}M`,
    sublabel: "د.أ",
    color: "var(--accent-amber)",
  },
  {
    icon: Building2,
    label: "عدد الفروع",
    value: summary.branchesCount.toString(),
    sublabel: "فرع نشط",
    color: "var(--accent-blue)",
  },
  {
    icon: FileText,
    label: "عدد الفواتير",
    value: summary.invoicesCount.toLocaleString("en-US"),
    sublabel: "فاتورة",
    color: "var(--accent-cyan)",
  },
  {
    icon: ShoppingCart,
    label: "متوسط السلة",
    value: `${summary.averageBasket}`,
    sublabel: "د.أ / فاتورة",
    color: "var(--accent-purple)",
  },
];
