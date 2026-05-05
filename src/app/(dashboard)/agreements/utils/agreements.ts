export interface Agreement {
  name: string;
  partner: string;
  typeAr: string;
  value: number;
  status: string;
  statusAr: string;
  materials: number;
  profitMargin: number;
  discountRate: number;
  start: string;
  end: string;
  [key: string]: unknown;
}

export const agreements: Agreement[] = [
  {
    name: "شراء بالجملة — أرز",
    partner: "شركة المها للتجارة",
    typeAr: "مشتريات",
    value: 1200000,
    status: "Active",
    statusAr: "نشط",
    materials: 15,
    profitMargin: 22,
    discountRate: 8,
    start: "2025-01-01",
    end: "2025-12-31",
  },
  {
    name: "توزيع — الشمال",
    partner: "اللوجستيات الشمالية",
    typeAr: "توزيع",
    value: 850000,
    status: "Active",
    statusAr: "نشط",
    materials: 0,
    profitMargin: 15,
    discountRate: 5,
    start: "2025-03-01",
    end: "2026-02-28",
  },
  {
    name: "توريد ألبان",
    partner: "شركة الألبان الأردنية",
    typeAr: "مشتريات",
    value: 640000,
    status: "Active",
    statusAr: "نشط",
    materials: 12,
    profitMargin: 18,
    discountRate: 10,
    start: "2025-06-01",
    end: "2026-05-31",
  },
  {
    name: "منتجات تنظيف",
    partner: "كلين ماكس",
    typeAr: "مشتريات",
    value: 320000,
    status: "Expiring",
    statusAr: "قارب الانتهاء",
    materials: 8,
    profitMargin: 25,
    discountRate: 12,
    start: "2025-01-01",
    end: "2025-03-31",
  },
  {
    name: "صيانة تقنية",
    partner: "تك سيرف الأردن",
    typeAr: "خدمات",
    value: 180000,
    status: "Active",
    statusAr: "نشط",
    materials: 0,
    profitMargin: 0,
    discountRate: 0,
    start: "2025-04-01",
    end: "2026-03-31",
  },
  {
    name: "حملة تسويقية",
    partner: "ميديا وركس",
    typeAr: "تسويق",
    value: 450000,
    status: "Pending",
    statusAr: "قيد الانتظار",
    materials: 0,
    profitMargin: 0,
    discountRate: 0,
    start: "2026-01-01",
    end: "2026-06-30",
  },
];
