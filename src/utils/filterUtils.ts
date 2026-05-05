// ═══════════════════════════════════════════════
// بيانات الفلاتر
// ═══════════════════════════════════════════════
export const QUICK_PERIODS = [
  { value: "month", label: "هذا الشهر" },
  { value: "last-month", label: "الشهر الماضي" },
  { value: "quarter", label: "هذا الربع" },
  { value: "last-quarter", label: "الربع الماضي" },
  { value: "year", label: "هذا العام" },
  { value: "last-year", label: "العام الماضي" },
];

/** صفحة /sales: فترة لحظية — شهري فقط. */
export const SALES_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];

export const SALES_QUICK_PERIOD_VALUES = new Set<string>(
  SALES_PAGE_QUICK_PERIODS.map((p) => p.value),
);

/** صفحة /branches: خيار «شهر» واحد (كما كان). */
export const BRANCHES_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];

/** صفحة /employees: فترة لحظية — شهري فقط. */
export const EMPLOYEES_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];

/** صفحة /ai-basket — فترة لحظية شهري فقط. */
export const AI_BASKET_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];

/** صفحة /customers — فترة لحظية شهري فقط. */
export const CUSTOMERS_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];

/** صفحة /ai-basket — وقت البيع (صباح / مساء) */
export const AI_BASKET_SHIFTS = [
  { value: "all", label: "وقت البيع" },
  { value: "morning", label: "صباح" },
  { value: "evening", label: "مساء" },
] as const;

/** صفحة /ai-basket — العروض */
export const AI_BASKET_OFFERS = [
  { value: "", label: "العروض" },
  { value: "seasonal", label: "عروض موسمية" },
  { value: "weekend", label: "عطلة نهاية الأسبوع" },
  { value: "clearance", label: "تصفيات" },
  { value: "bundle", label: "عبوات مجمّعة" },
  { value: "loyalty", label: "ولاء العملاء" },
] as const;

/** صفحة /ai-basket — القيمة المادية للسلة (د.أ) */
export const BASKET_VALUE_RANGES = [
  {
    label: "القيمة المادية للسلة",
    range: [0, 100_000] as [number, number],
  },
  { label: "٠–٥٠ د.أ", range: [0, 50] as [number, number] },
  { label: "٥٠–١٠٠ د.أ", range: [50, 100] as [number, number] },
  { label: "١٠٠–٢٠٠ د.أ", range: [100, 200] as [number, number] },
  { label: "٢٠٠ د.أ فأكثر", range: [200, 100_000] as [number, number] },
] as const;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** تاريخ محلي بصيغة YYYY-MM-DD (بدون انزياح UTC). */
export function formatLocalYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function getSalesQuickPeriodRange(
  period: string,
): { from: string; to: string } | null {
  if (!SALES_QUICK_PERIOD_VALUES.has(period)) return null;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  return { from: formatLocalYmd(start), to: formatLocalYmd(end) };
}

export const REGIONS = [
  { value: "all", label: "الاقليم" },
  { value: "north", label: "الشمال" },
  { value: "center", label: "الوسط" },
  { value: "south", label: "الجنوب" },
  { value: "east", label: "الشرق" },
];

export const BRANCHES = [
  { value: "all", label: "الفرع" },
  { value: "amman", label: "عمّان" },
  { value: "irbid", label: "إربد" },
  { value: "zarqa", label: "الزرقاء" },
  { value: "aqaba", label: "العقبة" },
  { value: "karak", label: "الكرك" },
  { value: "mafrak", label: "المفرق" },
  { value: "salt", label: "السلط" },
];

/** صفحة /customers فقط — المناسبات */
export const CUSTOMER_HOLIDAYS = [
  { value: "", label: "أيام العطل / المناسبات" },
  { value: "eid_fitr", label: "عيد الفطر" },
  { value: "eid_adha", label: "عيد الأضحى" },
  { value: "ramadan", label: "رمضان" },
  { value: "national_day", label: "اليوم الوطني" },
  { value: "back_to_school", label: "العودة للمدارس" },
] as const;

export const AI_BASKET_HOLIDAY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "أيام العطل / المناسبات" },
  ...CUSTOMER_HOLIDAYS.slice(1).map((o) => ({
    value: o.value,
    label: o.label,
  })),
];

export const EMPLOYEES_CITIES = [
  { value: "all", label: "المدينة" },
  { value: "amman", label: "عمّان" },
  { value: "irbid", label: "إربد" },
  { value: "zarqa", label: "الزرقاء" },
  { value: "aqaba", label: "العقبة" },
  { value: "karak", label: "الكرك" },
  { value: "mafrak", label: "المفرق" },
  { value: "salt", label: "السلط" },
] as const;

export const WORK_SHIFTS = [
  { value: "all", label: "وقت البيع" },
  { value: "morning", label: "صباحاً" },
  { value: "evening", label: "مساء" },
] as const;

export const RETURN_RATE_RANGES = [
  {
    value: "all",
    label: "نسبة المرتجعات",
    range: [0, 100] as [number, number],
  },
  { value: "0-1", label: "0% - 1%", range: [0, 1] as [number, number] },
  { value: "1-3", label: "1% - 3%", range: [1, 3] as [number, number] },
  { value: "3-6", label: "3% - 6%", range: [3, 6] as [number, number] },
  { value: "6+", label: "6% فأكثر", range: [6, 100] as [number, number] },
] as const;
export const DAILY_INVOICE_RATIO_RANGES = [
  {
    value: "all",
    label: "نسبة عدد الفواتير اليومية",
    range: [0, 100] as [number, number],
  },
  { value: "0-1", label: "0% - 1%", range: [0, 1] as [number, number] },
  { value: "1-3", label: "1% - 3%", range: [1, 3] as [number, number] },
  { value: "3-6", label: "3% - 6%", range: [3, 6] as [number, number] },
  { value: "6+", label: "6% فأكثر", range: [6, 100] as [number, number] },
] as const;

/** صفحة /employees — نسبة أداء الموظفين (٪) */
export const EMPLOYEE_PERFORMANCE_RATIO_RANGES = [
  {
    value: "all",
    label: "نسبة اداء الموظفين",
    range: [0, 100] as [number, number],
  },
  { value: "0-1", label: "0% - 1%", range: [0, 1] as [number, number] },
  { value: "1-3", label: "1% - 3%", range: [1, 3] as [number, number] },
  { value: "3-6", label: "3% - 6%", range: [3, 6] as [number, number] },
  { value: "6+", label: "6% فأكثر", range: [6, 100] as [number, number] },
] as const;

/** فلاتر المبيعات — مجموعات هرمية (صفحة /sales فقط). */
export const SALES_GROUP_1 = [
  { value: "all", label: "المجموعة الأولى" },
  { value: "grocery", label: "بقالة عامة" },
  { value: "fresh", label: "طازج ومبرد" },
  { value: "frozen", label: "مجمد" },
  { value: "dry", label: "جاف ومعلب" },
];
export const SALES_GROUP_2 = [
  { value: "all", label: "المجموعة الثانية" },
  { value: "national", label: "علامات وطنية" },
  { value: "import", label: "علامات مستوردة" },
  { value: "private", label: "ماركة خاصة" },
  { value: "organic", label: "عضوي" },
];
export const SALES_GROUP_3 = [
  { value: "all", label: "المجموعة الثالثة" },
  { value: "promo", label: "عروض وتخفيضات" },
  { value: "regular", label: "سعر عادي" },
  { value: "bundle", label: "عبوات مجمّعة" },
  { value: "bulk", label: "بيع بالجملة" },
];

/** صفحة /sales — الشركات (لحظي) */
export const SALES_COMPANIES = [
  { value: "all", label: "الشركة" },
  { value: "mcc", label: "شركة المستهلك العسكري" },
  { value: "national_food", label: "شركات غذائية وطنية" },
  { value: "import_partner", label: "شريك استيراد" },
];

/** صفحة /sales — الاتفاقيات (تقارير تفصيلية) */
export const SALES_AGREEMENTS = [
  { value: "all", label: "الاتفاقية" },
  { value: "retail", label: "اتفاقية تجزئة" },
  { value: "wholesale", label: "اتفاقية جملة" },
  { value: "framework", label: "إطار تعاقدي عام" },
];

export const DISTRIBUTORS = [
  "الموزع الأول - محمد أحمد",
  "الموزع الثاني - خالد سليم",
  "الموزع الثالث - فيصل أمين",
  "موزع العقبة - ياسر نور",
  "موزع إربد - رامي سعد",
];
export const CATEGORIES = [
  "بقالة",
  "ألبان",
  "لحوم",
  "مشروبات",
  "منزلية",
  "عناية شخصية",
  "أجهزة إلكترونية",
  "وجبات سريعة",
  "ورقية",
  "أطفال",
];
export const PRODUCTS = [
  "أرز عنبر 5كجم",
  "زيت نباتي 1.8L",
  "سكر أبيض 2كجم",
  "شاي ليبتون 100كيس",
  "دجاج مبرد",
  "حليب نيدو",
  "مياه معدنية",
  "شامبو هيد آند شولدرز",
  "معجون كولجيت",
];
export const SALES_INSTANT_PRODUCTS = [
  { value: "", label: "كل المنتجات" },
  ...PRODUCTS.map((p) => ({ value: p, label: p })),
];

export const SALE_METHOD_OPTIONS = [
  "بيع مباشر — فرع",
  "أونلاين / تطبيق",
  "توصيل",
  "جملة",
];

export const PRODUCTS_GROUP_1 = [
  "بقالة",
  "ألبان",
  "لحوم",
  "مشروبات",
  "منزلية",
  "عناية شخصية",
  "أجهزة إلكترونية",
  "وجبات سريعة",
  "ورقية",
  "أطفال",
];
export const PRODUCTS_GROUP_2 = [
  "أساسيات",
  "طازج",
  "مبرد",
  "مجمد",
  "معلب",
  "عناية",
];
export const PRODUCTS_GROUP_3 = [
  "عروض",
  "سعر عادي",
  "ماركة خاصة",
  "مستورد",
  "عضوي",
];
