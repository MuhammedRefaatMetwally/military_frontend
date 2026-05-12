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

export const SALES_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];
export const SALES_QUICK_PERIOD_VALUES = new Set<string>(
  QUICK_PERIODS.map((p) => p.value),  
);

export const BRANCHES_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];
export const EMPLOYEES_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];
export const AI_BASKET_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];
export const CUSTOMERS_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];

export const AI_BASKET_SHIFTS = [
  { value: "all", label: "وقت البيع" },
  { value: "morning", label: "صباح" },
  { value: "evening", label: "مساء" },
] as const;

export const AI_BASKET_OFFERS = [
  { value: "", label: "العروض" },
  { value: "seasonal", label: "عروض موسمية" },
  { value: "weekend", label: "عطلة نهاية الأسبوع" },
  { value: "clearance", label: "تصفيات" },
  { value: "bundle", label: "عبوات مجمّعة" },
  { value: "loyalty", label: "ولاء العملاء" },
] as const;

export const BASKET_VALUE_RANGES = [
  { label: "القيمة المادية للسلة", range: [0, 100_000] as [number, number] },
  { label: "٠–٥٠ د.أ", range: [0, 50] as [number, number] },
  { label: "٥٠–١٠٠ د.أ", range: [50, 100] as [number, number] },
  { label: "١٠٠–٢٠٠ د.أ", range: [100, 200] as [number, number] },
  { label: "٢٠٠ د.أ فأكثر", range: [200, 100_000] as [number, number] },
] as const;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatLocalYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function getSalesQuickPeriodRange(
  period: string,
): { from: string; to: string } | null {
  if (!SALES_QUICK_PERIOD_VALUES.has(period)) return null;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed

  switch (period) {
    case "month":
      return {
        from: formatLocalYmd(new Date(y, m, 1)),
        to: formatLocalYmd(new Date(y, m + 1, 0)),
      };

    case "last-month": {
      const lm = m === 0 ? 11 : m - 1;
      const ly = m === 0 ? y - 1 : y;
      return {
        from: formatLocalYmd(new Date(ly, lm, 1)),
        to: formatLocalYmd(new Date(ly, lm + 1, 0)),
      };
    }

    case "quarter": {
      const q = Math.floor(m / 3);           // 0-indexed quarter
      return {
        from: formatLocalYmd(new Date(y, q * 3, 1)),
        to: formatLocalYmd(new Date(y, q * 3 + 3, 0)),
      };
    }

    case "last-quarter": {
      const q = Math.floor(m / 3);
      const lq = q === 0 ? 3 : q - 1;
      const ly = q === 0 ? y - 1 : y;
      return {
        from: formatLocalYmd(new Date(ly, lq * 3, 1)),
        to: formatLocalYmd(new Date(ly, lq * 3 + 3, 0)),
      };
    }

    case "year":
      return {
        from: formatLocalYmd(new Date(y, 0, 1)),
        to: formatLocalYmd(new Date(y, 11, 31)),
      };

    case "last-year":
      return {
        from: formatLocalYmd(new Date(y - 1, 0, 1)),
        to: formatLocalYmd(new Date(y - 1, 11, 31)),
      };

    default:
      return null;
  }
}

// ── Regions — IDs 21–25 from API env ─────────────────────────────────────────
export const REGIONS = [
  { value: "all", label: "الاقليم" },
  { value: "21", label: "الشمال" },
  { value: "22", label: "الوسط" },
  { value: "23", label: "الجنوب" },
  { value: "24", label: "الشرق" },
  { value: "25", label: "الغرب" },
];

// ── Branches — IDs 51–75 from API env ────────────────────────────────────────
export const BRANCHES = [
  { value: "all", label: "الفرع" },
  { value: "51", label: "عمّان" },
  { value: "52", label: "إربد" },
  { value: "53", label: "الزرقاء" },
  { value: "54", label: "العقبة" },
  { value: "68", label: "الكرك" },
  { value: "69", label: "المفرق" },
  { value: "70", label: "السلط" },
  { value: "71", label: "جرش" },
  { value: "72", label: "عجلون" },
  { value: "73", label: "مادبا" },
  { value: "74", label: "الطفيلة" },
  { value: "75", label: "معان" },
];

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
  ...CUSTOMER_HOLIDAYS.slice(1).map((o) => ({ value: o.value, label: o.label })),
];

// ── Cities — same list as branches for now ────────────────────────────────────
export const EMPLOYEES_CITIES = [
  { value: "all", label: "المدينة" },
  { value: "51", label: "عمّان" },
  { value: "52", label: "إربد" },
  { value: "53", label: "الزرقاء" },
  { value: "54", label: "العقبة" },
  { value: "68", label: "الكرك" },
  { value: "69", label: "المفرق" },
  { value: "70", label: "السلط" },
] as const;

export const WORK_SHIFTS = [
  { value: "all", label: "وقت البيع" },
  { value: "morning", label: "صباحاً" },
  { value: "evening", label: "مساء" },
] as const;

export const RETURN_RATE_RANGES = [
  { value: "all", label: "نسبة المرتجعات", range: [0, 100] as [number, number] },
  { value: "0-1", label: "0% - 1%", range: [0, 1] as [number, number] },
  { value: "1-3", label: "1% - 3%", range: [1, 3] as [number, number] },
  { value: "3-6", label: "3% - 6%", range: [3, 6] as [number, number] },
  { value: "6+", label: "6% فأكثر", range: [6, 100] as [number, number] },
] as const;

export const DAILY_INVOICE_RATIO_RANGES = [
  { value: "all", label: "نسبة عدد الفواتير اليومية", range: [0, 100] as [number, number] },
  { value: "0-1", label: "0% - 1%", range: [0, 1] as [number, number] },
  { value: "1-3", label: "1% - 3%", range: [1, 3] as [number, number] },
  { value: "3-6", label: "3% - 6%", range: [3, 6] as [number, number] },
  { value: "6+", label: "6% فأكثر", range: [6, 100] as [number, number] },
] as const;

export const EMPLOYEE_PERFORMANCE_RATIO_RANGES = [
  { value: "all", label: "نسبة اداء الموظفين", range: [0, 100] as [number, number] },
  { value: "0-1", label: "0% - 1%", range: [0, 1] as [number, number] },
  { value: "1-3", label: "1% - 3%", range: [1, 3] as [number, number] },
  { value: "3-6", label: "3% - 6%", range: [3, 6] as [number, number] },
  { value: "6+", label: "6% فأكثر", range: [6, 100] as [number, number] },
] as const;

// ── Sales Group 1 — IDs 29–36 from API env ───────────────────────────────────
export const SALES_GROUP_1 = [
  { value: "all", label: "المجموعة الأولى" },
  { value: "29", label: "بقالة عامة" },
  { value: "30", label: "طازج ومبرد" },
  { value: "31", label: "مجمد" },
  { value: "32", label: "جاف ومعلب" },
  { value: "33", label: "مشروبات" },
  { value: "34", label: "عناية شخصية" },
  { value: "35", label: "منزلية" },
  { value: "36", label: "أطفال" },
];

// ── Sales Group 2 — IDs 171–220 from API env ─────────────────────────────────
export const SALES_GROUP_2 = [
  { value: "all", label: "المجموعة الثانية" },
  { value: "171", label: "علامات وطنية" },
  { value: "172", label: "علامات مستوردة" },
  { value: "173", label: "ماركة خاصة" },
  { value: "174", label: "عضوي" },
  { value: "197", label: "مبرد" },
  { value: "198", label: "معلب" },
  { value: "199", label: "جاف" },
  { value: "200", label: "طازج" },
  { value: "201", label: "مجمد" },
  { value: "202", label: "مشروبات غازية" },
  { value: "203", label: "عصائر" },
  { value: "204", label: "مياه معدنية" },
  { value: "205", label: "ألبان" },
  { value: "206", label: "أجبان" },
  { value: "207", label: "زيوت" },
  { value: "208", label: "دقيق وأرز" },
  { value: "209", label: "بقوليات" },
  { value: "210", label: "توابل" },
  { value: "211", label: "حلويات" },
  { value: "212", label: "شيبس ومقرمشات" },
  { value: "213", label: "شوكولا" },
  { value: "214", label: "مخبوزات" },
  { value: "215", label: "معكرونة" },
  { value: "216", label: "صلصات" },
  { value: "217", label: "قهوة وشاي" },
  { value: "218", label: "منظفات" },
  { value: "219", label: "عناية بالشعر" },
  { value: "220", label: "عناية بالبشرة" },
];

// ── Sales Group 3 — IDs 1477–1526 from API env ───────────────────────────────
export const SALES_GROUP_3 = [
  { value: "all", label: "المجموعة الثالثة" },
  { value: "1477", label: "عروض وتخفيضات" },
  { value: "1478", label: "سعر عادي" },
  { value: "1516", label: "عبوات مجمّعة" },
  { value: "1517", label: "بيع بالجملة" },
  { value: "1518", label: "تخفيض موسمي" },
  { value: "1519", label: "عرض أسبوعي" },
  { value: "1520", label: "عرض شهري" },
  { value: "1521", label: "تخفيض عيد" },
  { value: "1522", label: "تخفيض رمضان" },
  { value: "1523", label: "عرض خاص" },
  { value: "1524", label: "سعر مخفض دائم" },
  { value: "1525", label: "مجموعة اقتصادية" },
  { value: "1526", label: "حزمة عائلية" },
];

// ── Sales Agreements — IDs 78–108 from API env ───────────────────────────────
export const SALES_AGREEMENTS = [
  { value: "all", label: "الاتفاقية" },
  { value: "78", label: "اتفاقية تجزئة" },
  { value: "79", label: "اتفاقية جملة" },
  { value: "80", label: "إطار تعاقدي عام" },
  { value: "81", label: "اتفاقية سنوية" },
  { value: "82", label: "اتفاقية ربع سنوية" },
  { value: "83", label: "اتفاقية شهرية" },
  { value: "84", label: "عقد حصري" },
  { value: "85", label: "اتفاقية توزيع" },
  { value: "86", label: "اتفاقية وكالة" },
  { value: "87", label: "عقد خدمات" },
  { value: "88", label: "اتفاقية شراكة" },
  { value: "89", label: "عقد إطاري" },
  { value: "90", label: "اتفاقية مؤقتة" },
  { value: "91", label: "اتفاقية مفتوحة" },
  { value: "92", label: "عقد مناقصة" },
  { value: "93", label: "اتفاقية حكومية" },
  { value: "94", label: "عقد مؤسسي" },
  { value: "95", label: "اتفاقية مدرسية" },
  { value: "96", label: "اتفاقية فندقية" },
  { value: "97", label: "اتفاقية مستشفيات" },
  { value: "98", label: "اتفاقية شركات" },
  { value: "99", label: "عقد مصنع" },
  { value: "100", label: "اتفاقية مخزن" },
  { value: "101", label: "عقد لوجستي" },
  { value: "102", label: "اتفاقية نقل" },
  { value: "103", label: "عقد تفضيلي" },
  { value: "104", label: "اتفاقية استراتيجية" },
  { value: "105", label: "عقد مميز" },
  { value: "106", label: "اتفاقية VIP" },
  { value: "107", label: "عقد مجمّع" },
  { value: "108", label: "اتفاقية إقليمية" },
];

// ── Companies ─────────────────────────────────────────────────────────────────
export const SALES_COMPANIES = [
  { value: "all", label: "الشركة" },
  { value: "mcc", label: "شركة المستهلك العسكري" },
  { value: "national_food", label: "شركات غذائية وطنية" },
  { value: "import_partner", label: "شريك استيراد" },
];

export const DISTRIBUTORS = [
  "الموزع الأول - محمد أحمد",
  "الموزع الثاني - خالد سليم",
  "الموزع الثالث - فيصل أمين",
  "موزع العقبة - ياسر نور",
  "موزع إربد - رامي سعد",
];
export const CATEGORIES = [
  "بقالة", "ألبان", "لحوم", "مشروبات", "منزلية",
  "عناية شخصية", "أجهزة إلكترونية", "وجبات سريعة", "ورقية", "أطفال",
];
export const PRODUCTS = [
  "أرز عنبر 5كجم", "زيت نباتي 1.8L", "سكر أبيض 2كجم",
  "شاي ليبتون 100كيس", "دجاج مبرد", "حليب نيدو",
  "مياه معدنية", "شامبو هيد آند شولدرز", "معجون كولجيت",
];
export const SALES_INSTANT_PRODUCTS = [
  { value: "", label: "كل المنتجات" },
  ...PRODUCTS.map((p) => ({ value: p, label: p })),
];
export const SALE_METHOD_OPTIONS = [
  "بيع مباشر — فرع", "أونلاين / تطبيق", "توصيل", "جملة",
];
export const PRODUCTS_GROUP_1 = [
  "بقالة", "ألبان", "لحوم", "مشروبات", "منزلية",
  "عناية شخصية", "أجهزة إلكترونية", "وجبات سريعة", "ورقية", "أطفال",
];
export const PRODUCTS_GROUP_2 = [
  "أساسيات", "طازج", "مبرد", "مجمد", "معلب", "عناية",
];
export const PRODUCTS_GROUP_3 = [
  "عروض", "سعر عادي", "ماركة خاصة", "مستورد", "عضوي",
];