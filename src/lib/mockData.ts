// ═══════════════════════════════════════════════════════════════
// MOCK DATA GENERATORS — Military Consumer Corporation
// Realistic data for all dashboard modules
// ═══════════════════════════════════════════════════════════════

export interface KPIData {
  id: string;
  title: string;
  titleAr: string;
  value: number;
  formattedValue: string;
  previousValue: number;
  change: number;
  changeType: "إرتفاع" | "إنخفاض" | "neutral";
  unit: string;
  sparkline: number[];
}

export interface BranchData {
  id: string;
  name: string;
  nameAr: string;
  region: string;
  regionAr: string;
  revenue: number;
  orders: number;
  customers: number;
  growth: number;
  performance: number;
  [key: string]: unknown;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  returns: number;
  netRevenue: number;
}

export interface ProductData {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  subcategory: string;
  price: number;
  unitsSold: number;
  revenue: number;
  margin: number;
  trend: "up" | "down" | "stable";
  [key: string]: unknown;
}

export interface ReportJob {
  id: string;
  name: string;
  type: "sales" | "branch" | "product" | "employee" | "forecast" | "custom";
  status: "pending" | "processing" | "ready" | "failed";
  progress: number;
  createdAt: string;
  completedAt?: string;
  fileSize?: string;
  formats: string[];
  requestedBy: string;
}

export interface ForecastData {
  date: string;
  actual: number | null;
  predicted: number;
  upperBound: number;
  lowerBound: number;
  confidence: number;
}

// ── Helper Functions ──
type RandomFn = () => number;

const createSeededRandom = (seed: number): RandomFn => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomBetweenSeeded = (rand: RandomFn, min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;

const generateSparkline = (
  length: number,
  base: number,
  variance: number,
): number[] =>
  Array.from({ length }, () => base + (Math.random() - 0.5) * variance * 2);

// ── KPI Data ──
export const getKPIData = (): KPIData[] => [
  {
    id: "total-revenue",
    title: "Total Revenue",
    titleAr: "إجمالي الإيرادات",
    value: 24587300,
    formattedValue: "24.59M",
    previousValue: 22145000,
    change: 11.03,
    changeType: "إرتفاع",
    unit: "JOD",
    sparkline: generateSparkline(12, 2000000, 400000),
  },
  {
    id: "total-orders",
    title: "Total Orders",
    titleAr: "إجمالي الطلبات",
    value: 184520,
    formattedValue: "184.5K",
    previousValue: 172300,
    change: 7.09,
    changeType: "إرتفاع",
    unit: "",
    sparkline: generateSparkline(12, 15000, 3000),
  },
  {
    id: "active-branches",
    title: "Active Branches",
    titleAr: "الفروع النشطة",
    value: 47,
    formattedValue: "47",
    previousValue: 45,
    change: 4.44,
    changeType: "إرتفاع",
    unit: "",
    sparkline: generateSparkline(12, 45, 3),
  },
  {
    id: "total-products",
    title: "Active Products",
    titleAr: "المنتجات النشطة",
    value: 3842,
    formattedValue: "3,842",
    previousValue: 3650,
    change: 5.26,
    changeType: "إرتفاع",
    unit: "",
    sparkline: generateSparkline(12, 3700, 200),
  },
  {
    id: "total-customers",
    title: "Unique Customers",
    titleAr: "العملاء الفريدين",
    value: 92450,
    formattedValue: "92.5K",
    previousValue: 89200,
    change: 3.64,
    changeType: "إرتفاع",
    unit: "",
    sparkline: generateSparkline(12, 8500, 1500),
  },
  {
    id: "avg-basket",
    title: "Avg. Basket Size",
    titleAr: "متوسط حجم السلة",
    value: 133.25,
    formattedValue: "133.25",
    previousValue: 128.5,
    change: 3.7,
    changeType: "إرتفاع",
    unit: "JOD",
    sparkline: generateSparkline(12, 130, 15),
  },
];

// ── Branch Data ──
export const getBranchData = (): BranchData[] => {
  const branches = [
    {
      name: "Amman Central",
      nameAr: "عمّان المركزي",
      region: "Amman",
      regionAr: "عمّان",
    },
    {
      name: "Irbid Main",
      nameAr: "إربد الرئيسي",
      region: "North",
      regionAr: "الشمال",
    },
    {
      name: "Zarqa Branch",
      nameAr: "فرع الزرقاء",
      region: "Central",
      regionAr: "الوسط",
    },
    {
      name: "Aqaba Port",
      nameAr: "العقبة الميناء",
      region: "South",
      regionAr: "الجنوب",
    },
    {
      name: "Madaba City",
      nameAr: "مادبا المدينة",
      region: "Central",
      regionAr: "الوسط",
    },
    {
      name: "Salt Downtown",
      nameAr: "السلط وسط البلد",
      region: "Central",
      regionAr: "الوسط",
    },
    {
      name: "Karak Branch",
      nameAr: "فرع الكرك",
      region: "South",
      regionAr: "الجنوب",
    },
    {
      name: "Mafraq North",
      nameAr: "المفرق الشمالي",
      region: "North",
      regionAr: "الشمال",
    },
    {
      name: "Jerash Heritage",
      nameAr: "جرش التراث",
      region: "North",
      regionAr: "الشمال",
    },
    {
      name: "Tafilah South",
      nameAr: "الطفيلة الجنوبي",
      region: "South",
      regionAr: "الجنوب",
    },
  ];

  return branches.map((b, i) => ({
    id: `br-${i + 1}`,
    ...b,
    revenue: randomBetween(1200000, 4500000),
    orders: randomBetween(8000, 25000),
    customers: randomBetween(5000, 18000),
    growth: Number((Math.random() * 20 - 5).toFixed(1)),
    performance: randomBetween(65, 98),
  }));
};

// ── Monthly Sales Data ──
export const getMonthlySalesData = (): SalesData[] => {
  const rand = createSeededRandom(303);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((m) => {
    const rev = randomBetweenSeeded(rand, 1800000, 3200000);
    const orders = randomBetweenSeeded(rand, 12000, 22000);
    const returns = randomBetweenSeeded(rand, 200, 800);
    return {
      date: m,
      revenue: rev,
      orders,
      avgOrderValue: Math.round(rev / orders),
      returns,
      netRevenue: rev - returns * 50,
    };
  });
};

// ── Product Data ──
export const getProductData = (): ProductData[] => {
  const rand = createSeededRandom(404);
  const products = [
    {
      name: "Premium Rice 5kg",
      nameAr: "أرز فاخر 5 كجم",
      category: "Groceries",
      categoryAr: "بقالة",
      subcategory: "Rice & Grains",
    },
    {
      name: "Olive Oil 1L",
      nameAr: "زيت زيتون 1 لتر",
      category: "Groceries",
      categoryAr: "بقالة",
      subcategory: "Oils",
    },
    {
      name: "Fresh Chicken 1kg",
      nameAr: "دجاج طازج 1 كجم",
      category: "Meat",
      categoryAr: "لحوم",
      subcategory: "Poultry",
    },
    {
      name: "Detergent 3L",
      nameAr: "منظف 3 لتر",
      category: "Household",
      categoryAr: "منزلية",
      subcategory: "Cleaning",
    },
    {
      name: "Baby Diapers Pack",
      nameAr: "حفاضات أطفال",
      category: "Baby Care",
      categoryAr: "رعاية الأطفال",
      subcategory: "Diapers",
    },
    {
      name: "Mineral Water 6pk",
      nameAr: "مياه معدنية 6 عبوات",
      category: "Beverages",
      categoryAr: "مشروبات",
      subcategory: "Water",
    },
    {
      name: "Canned Tuna",
      nameAr: "تونة معلبة",
      category: "Canned",
      categoryAr: "معلبات",
      subcategory: "Fish",
    },
    {
      name: "Fresh Milk 1L",
      nameAr: "حليب طازج 1 لتر",
      category: "Dairy",
      categoryAr: "ألبان",
      subcategory: "Milk",
    },
    {
      name: "White Sugar 1kg",
      nameAr: "سكر أبيض 1 كجم",
      category: "Groceries",
      categoryAr: "بقالة",
      subcategory: "Sugar",
    },
    {
      name: "Sunflower Oil 2L",
      nameAr: "زيت عباد الشمس 2 لتر",
      category: "Groceries",
      categoryAr: "بقالة",
      subcategory: "Oils",
    },
  ];

  return products.map((p, i) => ({
    id: `prod-${i + 1}`,
    ...p,
    price: Number((rand() * 15 + 1.5).toFixed(2)),
    unitsSold: randomBetweenSeeded(rand, 5000, 85000),
    revenue: randomBetweenSeeded(rand, 50000, 500000),
    margin: Number((rand() * 30 + 5).toFixed(1)),
    trend: (["up", "down", "stable"] as const)[randomBetweenSeeded(rand, 0, 2)],
  }));
};

// ── Report Jobs ──
export const getReportJobs = (): ReportJob[] => [
  {
    id: "rpt-001",
    name: "Q4 2025 Sales Performance Report",
    type: "sales",
    status: "ready",
    progress: 100,
    createdAt: "2025-12-28T14:30:00",
    completedAt: "2025-12-28T14:35:00",
    fileSize: "4.2 MB",
    formats: ["xlsx", "csv"],
    requestedBy: "Admin Officer",
  },
  {
    id: "rpt-002",
    name: "Branch Comparison Analysis - Northern Region",
    type: "branch",
    status: "processing",
    progress: 67,
    createdAt: "2025-12-29T09:15:00",
    formats: ["xlsx"],
    requestedBy: "Regional Analyst",
  },
  {
    id: "rpt-003",
    name: "Product Category Deep Dive - Groceries",
    type: "product",
    status: "pending",
    progress: 0,
    createdAt: "2025-12-29T10:00:00",
    formats: ["xlsx", "csv"],
    requestedBy: "Product Manager",
  },
  {
    id: "rpt-004",
    name: "Employee Performance Scorecard - Q4",
    type: "employee",
    status: "ready",
    progress: 100,
    createdAt: "2025-12-27T16:00:00",
    completedAt: "2025-12-27T16:12:00",
    fileSize: "2.8 MB",
    formats: ["xlsx"],
    requestedBy: "HR Director",
  },
  {
    id: "rpt-005",
    name: "AI Sales Forecast - January 2026",
    type: "forecast",
    status: "processing",
    progress: 34,
    createdAt: "2025-12-29T08:00:00",
    formats: ["xlsx", "interactive"],
    requestedBy: "Admin Officer",
  },
  {
    id: "rpt-006",
    name: "Discount Impact Analysis - Full Year 2025",
    type: "custom",
    status: "failed",
    progress: 45,
    createdAt: "2025-12-26T11:30:00",
    formats: [],
    requestedBy: "Finance Analyst",
  },
];

// ── Category Distribution ──
export const getCategoryDistribution = () => [
  { name: "Groceries", nameAr: "بقالة", value: 35, color: "#00e5a0" },
  {
    name: "Meat & Poultry",
    nameAr: "لحوم ودواجن",
    value: 22,
    color: "#00d4ff",
  },
  { name: "Dairy", nameAr: "ألبان", value: 15, color: "#3b82f6" },
  { name: "Beverages", nameAr: "مشروبات", value: 12, color: "#a855f7" },
  { name: "Household", nameAr: "منزلية", value: 9, color: "#f59e0b" },
  { name: "Baby Care", nameAr: "رعاية الأطفال", value: 4, color: "#ec4899" },
  { name: "Other", nameAr: "أخرى", value: 3, color: "#64748b" },
];

// ── Regional Performance ──
export const getRegionalData = () => [
  {
    region: "Amman",
    regionAr: "عمّان",
    revenue: 9500000,
    branches: 15,
    growth: 12.5,
  },
  {
    region: "North",
    regionAr: "الشمال",
    revenue: 5200000,
    branches: 12,
    growth: 8.3,
  },
  {
    region: "Central",
    regionAr: "الوسط",
    revenue: 4800000,
    branches: 10,
    growth: 6.7,
  },
  {
    region: "South",
    regionAr: "الجنوب",
    revenue: 3100000,
    branches: 8,
    growth: 4.2,
  },
  {
    region: "East",
    regionAr: "الشرق",
    revenue: 1987300,
    branches: 2,
    growth: -1.3,
  },
];
