'use client';

import { create } from 'zustand';

export interface FilterState {
    // ── فلاتر لحظية (فروع متعددة + فترة) ── [] = كل الفروع
    activeBranches: string[];
    activePeriod: string;

    // ── فلاتر متقدمة ──
    year: string;
    quarter: string;
    month: string;
    day: string;
    branch: string[];
    market: string[];
    region: string[];
    productCategory: string[];
    subcategory: string[];
    product: string[];
    salesType: string;
    paymentType: string;
    discountRange: [number, number];
    employee: string[];
    /** /employees only */
    workShift: "all" | "morning" | "evening";
    /** /employees only (percent) */
    returnRateRange: [number, number];
    /** /employees — المدن ([] = كل المدن) */
    employeeCities: string[];
    /** /employees — نسبة عدد الفواتير اليومية (٪) */
    dailyInvoiceRatioRange: [number, number];
    /** /employees — نسبة أداء الموظفين (٪) */
    employeePerformanceRatioRange: [number, number];
    /** /ai-basket — المدن ([] = كل المدن) */
    aiBasketCities: string[];
    /** /ai-basket — وقت البيع */
    aiBasketSaleTime: "all" | "morning" | "evening";
    /** /ai-basket — أيام العطل والمناسبات */
    aiBasketHoliday: string;
    /** /ai-basket — العروض */
    aiBasketOffers: string;
    /** /ai-basket — القيمة المادية للسلة (د.أ) */
    aiBasketValueRange: [number, number];
    /** /branches — المدن ([] = كل المدن) */
    branchCities: string[];
    /** /branches — وقت البيع (تقارير تفصيلية) */
    branchSaleTime: "all" | "morning" | "evening";
    /** /branches — أيام العطل والمناسبات (تقارير) */
    branchHoliday: string;
    /** /branches — العروض (تقارير) */
    branchOffers: string;
    /** /sales — تقارير تفصيلية: الاتفاقية ([] = كل الاتفاقيات) */
    agreement: string[];
    season: string;

    /** /customers — المدن ([] = كل المدن) */
    customersCities: string[];
    /** /customers — وقت البيع */
    customersSaleTime: "all" | "morning" | "evening";
    /** /customers — العروض */
    customersOffers: string;
    /** /customers — نوع الدفع (لحظي) */
    customersPaymentType: string;
    /** /customers — طريقة البيع (لحظي) */
    customersSaleMethod: string;
    /** /customers — القيمة المادية للسلة (د.أ) */
    customersBasketValueRange: [number, number];

    holiday: string;
    isApplied: boolean;
    isLoading: boolean;
}

interface FilterActions {
    setActiveBranches: (branches: string[]) => void;
    setActivePeriod: (period: string) => void;
    setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    applyFilters: () => void;
    resetFilters: () => void;
    setLoading: (loading: boolean) => void;
}

const defaultFilters: FilterState = {
    activeBranches: [],
    activePeriod: 'month',
    year: new Date().getFullYear().toString(),
    quarter: '',
    month: '',
    day: '',
    branch: [],
    market: [],
    region: [],
    productCategory: [],
    subcategory: [],
    product: [],
    salesType: '',
    paymentType: '',
    discountRange: [0, 100],
    employee: [],
    workShift: "all",
    returnRateRange: [0, 100],
    employeeCities: [],
    dailyInvoiceRatioRange: [0, 100],
    employeePerformanceRatioRange: [0, 100],
    aiBasketCities: [],
    aiBasketSaleTime: "all",
    aiBasketHoliday: "",
    aiBasketOffers: "",
    aiBasketValueRange: [0, 100_000],
    branchCities: [],
    branchSaleTime: "all",
    branchHoliday: "",
    branchOffers: "",
    agreement: [],
    season: '',
    customersCities: [],
    customersSaleTime: "all",
    customersOffers: "",
    customersPaymentType: "",
    customersSaleMethod: "",
    customersBasketValueRange: [0, 100_000],
    holiday: '',
    isApplied: false,
    isLoading: false,
};

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
    ...defaultFilters,
    setActiveBranches: (branches) => set({ activeBranches: branches }),
    setActivePeriod: (period) => set({ activePeriod: period }),
    setFilter: (key, value) => set({ [key]: value, isApplied: false }),
    applyFilters: () => set({ isApplied: true, isLoading: true }),
    resetFilters: () => set({ ...defaultFilters }),
    setLoading: (loading) => set({ isLoading: loading }),
}));
