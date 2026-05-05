import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";

export const statusConfig: Record<
  string,
  { icon: React.ElementType; label: string; cls: string; color: string }
> = {
  pending: {
    icon: Clock,
    label: "قيد الانتظار",
    cls: "status-pending",
    color: "var(--accent-amber)",
  },
  processing: {
    icon: Loader2,
    label: "قيد المعالجة",
    cls: "status-processing",
    color: "var(--accent-purple)",
  },
  ready: {
    icon: CheckCircle,
    label: "جاهز",
    cls: "status-ready",
    color: "var(--accent-green)",
  },
  failed: {
    icon: AlertCircle,
    label: "فشل",
    cls: "status-failed",
    color: "var(--accent-red)",
  },
};

export const reportNamesAr: Record<string, string> = {
  "rpt-001": "تقرير أداء المبيعات — الربع الرابع 2025",
  "rpt-002": "تحليل مقارنة الفروع — المنطقة الشمالية",
  "rpt-003": "دراسة معمّقة لفئة المنتجات — البقالة",
  "rpt-004": "بطاقة أداء الموظفين — الربع الرابع",
  "rpt-005": "التنبؤ الذكي بالمبيعات — يناير 2026",
  "rpt-006": "تحليل تأثير الخصومات — السنة الكاملة 2025",
};

export const typeLabels: Record<string, string> = {
  sales: "مبيعات",
  branch: "فروع",
  product: "منتجات",
  employee: "موظفين",
  forecast: "تنبؤ",
  custom: "مخصص",
};
