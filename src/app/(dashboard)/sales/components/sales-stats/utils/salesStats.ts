import { getMonthlySalesData } from "@/lib/mockData";
import {
  BarChart3,
  Building2,
  DollarSign,
  FileText,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
const salesData = getMonthlySalesData();

const totalOrders = salesData.reduce((a, b) => a + b.orders, 0);
const totalRevenue = salesData.reduce((a, b) => a + b.revenue, 0);
const totalCost = Math.round(totalRevenue * 0.65);
const totalDiscount = Math.round(totalRevenue * 0.073);
export const salesStats = [
  {
    icon: DollarSign,
    label: "تكلفة المواد",
    value: `${(totalCost / 1000000).toFixed(1)}M`,
    sublabel: "د.أ",
    color: "var(--accent-red)",
  },
  {
    icon: TrendingUp,
    label: "قيمة المبيعات",
    value: `${(totalRevenue / 1000000).toFixed(1)}M`,
    sublabel: "د.أ",
    color: "var(--accent-green)",
  },
  {
    icon: BarChart3,
    label: "قيمة الخصومات",
    value: `${(totalDiscount / 1000000).toFixed(2)}M`,
    sublabel: "د.أ",
    color: "var(--accent-amber)",
  },
  {
    icon: Building2,
    label: "عدد الفروع",
    value: "47",
    sublabel: "فرع نشط",
    color: "var(--accent-blue)",
  },
  {
    icon: FileText,
    label: "عدد الفواتير",
    value: totalOrders.toLocaleString("en-US"),
    sublabel: "فاتورة",
    color: "var(--accent-cyan)",
  },
  {
    icon: ShoppingCart,
    label: "متوسط السلة",
    value: `${Math.round(totalRevenue / totalOrders)}`,
    sublabel: "د.أ / فاتورة",
    color: "var(--accent-purple)",
  },
];
