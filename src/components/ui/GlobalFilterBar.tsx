"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Building2,
  MapPin,
  Truck,
  Package,
  Search,
  Percent,
  CreditCard,
  RotateCcw,
  FileBarChart2,
  Layers,
  Clock,
  Store,
  MapPinned,
  Tag,
  ShoppingCart,
  Handshake,
} from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import {
  AI_BASKET_HOLIDAY_OPTIONS,
  AI_BASKET_OFFERS,
  AI_BASKET_SHIFTS,
  BASKET_VALUE_RANGES,
  CATEGORIES,
  CUSTOMER_HOLIDAYS,
  DAILY_INVOICE_RATIO_RANGES,
  DISTRIBUTORS,
  EMPLOYEE_PERFORMANCE_RATIO_RANGES,
  EMPLOYEES_CITIES,
  getSalesQuickPeriodRange,
  PRODUCTS,
  QUICK_PERIODS,
  RETURN_RATE_RANGES,
  SALE_METHOD_OPTIONS,
  SALES_QUICK_PERIOD_VALUES,
  WORK_SHIFTS,
} from "@/utils/filterUtils";

// ── existing static-backed components (keep using for non-lookup filters) ──
import { Dropdown } from "./Dropdown";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { SearchDropdown } from "./SearchDropdown";
import { DateFilterDropdown } from "./DateFilterDropdown";
import { ReportNameDialog } from "./ReportNameDialog";
import { ReportCreatingPopup } from "./ReportCreatingPopup";

// ── new infinite-scroll primitive ──────────────────────────────────────────

// ── infinite hooks ──────────────────────────────────────────────────────────
import {
  useInfiniteAgreements,
  useInfiniteBranches,
  useInfiniteCompanies,
  useInfiniteGroup1,
  useInfiniteGroup2,
  useInfiniteGroup3,
  useInfiniteProducts,
  useInfiniteRegions,
} from "../../hooks/useInfiniteHooks";

import { toCsv } from "@/api/utils";
import { InfiniteDropdown } from "./Infinitedropdown";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_INSTANT_PERIOD       = "month";
const DEFAULT_SALES_INSTANT_PERIOD = "month";
const FILTERS_HIDE_THRESHOLD       = 80;
const FILTERS_SHOW_THRESHOLD       = 24;
const BRANCH_HOLIDAY_OPTIONS       = AI_BASKET_HOLIDAY_OPTIONS;
const DISCOUNTS                    = ["0%", "1-2%", "2-5%", "5-10%", "11-25%"];
const PAYMENT_TYPES                = ["نقدي", "فيزا / بطاقة", "محفظة إلكترونية", "آجل / ذمم"];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const normalizeSelections = (values: string[]) =>
  values.filter((v) => v && v !== "all");

const deriveDateFilters = (from: string, to: string) => {
  const source = from || to;
  if (!source)
    return { year: new Date().getFullYear().toString(), quarter: "", month: "", day: "" };
  const [yearPart = "", monthPart = "", dayPart = ""] = source.split("-");
  const monthNum = Number.parseInt(monthPart, 10);
  const quarter =
    Number.isNaN(monthNum) || monthPart === ""
      ? ""
      : Math.ceil(monthNum / 3).toString();
  return { year: yearPart, quarter, month: monthPart, day: dayPart };
};

// ─────────────────────────────────────────────────────────────────────────────
// useSearchState — local debounced search state per dropdown
// ─────────────────────────────────────────────────────────────────────────────

function useSearchState(debounce = 300) {
  const [raw, setRaw]       = useState("");
  const [applied, setApplied] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = useCallback((v: string) => {
    setRaw(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setApplied(v), debounce);
  }, [debounce]);

  return { raw, applied, set };
}

// ═══════════════════════════════════════════════
// GlobalFilterBar
// ═══════════════════════════════════════════════

export default function GlobalFilterBar() {
  const pathname         = usePathname();
  const isSalesPage      = pathname === "/sales";
  const isBranchesPage   = pathname === "/branches";
  const isEmployeesPage  = pathname === "/employees";
  const isAiBasketPage   = pathname === "/ai-basket";
  const isOperationsPage = pathname === "/operations";
  const isCustomersPage  = pathname === "/customers";
  const isProductsPage   = pathname === "/products";
  const isBasketLikePage = isAiBasketPage || isOperationsPage;

  // ── store ──────────────────────────────────────────────────────────────────
  const {
    activeBranches, activePeriod,
    workShift, returnRateRange, employeeCities,
    dailyInvoiceRatioRange, employeePerformanceRatioRange,
    aiBasketCities, aiBasketSaleTime, aiBasketHoliday, aiBasketOffers, aiBasketValueRange,
    branchCities, branchSaleTime, branchHoliday, branchOffers,
    agreement, holiday,
    customersCities, customersSaleTime, customersOffers,
    customersSaleMethod, customersBasketValueRange,
    setActiveBranches, setActivePeriod, setFilter,
  } = useFilterStore();

  // ── instant filter local state ─────────────────────────────────────────────
  const [activeRegions,          setActiveRegions]          = useState<string[]>([]);
  const [dateFrom,               setDateFrom]               = useState("");
  const [dateTo,                 setDateTo]                 = useState("");

  // /sales
  const [salesG1,      setSalesG1]      = useState<string[]>([]);
  const [salesG2,      setSalesG2]      = useState<string[]>([]);
  const [salesG3,      setSalesG3]      = useState<string[]>([]);
  const [salesCompany, setSalesCompany] = useState<string[]>([]);
  const [salesProduct, setSalesProduct] = useState<string[]>([]);

  // /branches
  const [branchesG1,      setBranchesG1]      = useState<string[]>([]);
  const [branchesG2,      setBranchesG2]      = useState<string[]>([]);
  const [branchesG3,      setBranchesG3]      = useState<string[]>([]);
  const [branchesProduct, setBranchesProduct] = useState("");

  // /ai-basket
  const [aiBasketG1,       setAiBasketG1]       = useState<string[]>([]);
  const [aiBasketG2,       setAiBasketG2]       = useState<string[]>([]);
  const [aiBasketReportG3, setAiBasketReportG3] = useState<string[]>([]);

  // /customers report
  const [customersG1,      setCustomersG1]      = useState<string[]>([]);
  const [customersG2,      setCustomersG2]      = useState<string[]>([]);
  const [customersG3,      setCustomersG3]      = useState<string[]>([]);
  const [customersProduct, setCustomersProduct] = useState("");

  // misc report
  const [distributor,  setDistributor]  = useState("");
  const [category,     setCategory]     = useState("");
  const [product,      setProduct]      = useState("");
  const [discount,     setDiscount]     = useState("");
  const [paymentType,  setPaymentType]  = useState("");
  const [saleMethod,   setSaleMethod]   = useState("");
  const [prodG1,       setProdG1]       = useState("");
  const [prodG2,       setProdG2]       = useState("");
  const [prodG3,       setProdG3]       = useState("");
  const [prodName,     setProdName]     = useState("");

  // dialog
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showPopup,      setShowPopup]      = useState(false);
  const [reportName,     setReportName]     = useState("");
  const [showReportsRow, setShowReportsRow] = useState(true);

  // ── per-dropdown search states ─────────────────────────────────────────────
  const regionSearch    = useSearchState();
  const branchSearch    = useSearchState();
  const companySearch   = useSearchState();
  const g1Search        = useSearchState();
  const g2Search        = useSearchState();
  const g3Search        = useSearchState();
  const productSearch   = useSearchState();
  const agreementSearch = useSearchState();

  // ─── API: regions ──────────────────────────────────────────────────────────
  const regionsQuery = useInfiniteRegions({ search: regionSearch.applied });

  // ─── API: branches (region-scoped) ────────────────────────────────────────
  //  The API accepts `region` as the region *name*.
  //  We need the selected region names.  We derive them from the flat results.
  const allRegionPages = regionsQuery.data?.pages ?? [];
  const allRegions     = allRegionPages.flatMap((p) => p.results);
  const selectedRegionNames = activeRegions
    .map((id) => allRegions.find((r) => String(r.id) === id)?.name)
    .filter(Boolean)
    .join(",");

  const branchesQuery = useInfiniteBranches(
    { search: branchSearch.applied, region: selectedRegionNames || undefined },
  );

  // ─── API: companies ────────────────────────────────────────────────────────
  const companiesQuery = useInfiniteCompanies({ search: companySearch.applied });

  // ─── API: group1 ───────────────────────────────────────────────────────────
  const group1Query = useInfiniteGroup1({ search: g1Search.applied });

  // ─── API: group2 (cascades from selected g1) ───────────────────────────────
  // The API accepts group1 as a single PK — multi-select means we fetch without
  // the constraint and let the user filter by name instead.
  const selectedG1Id =
    salesG1.length === 1 && salesG1[0] !== "all"
      ? Number(salesG1[0])
      : branchesG1.length === 1 && branchesG1[0] !== "all"
      ? Number(branchesG1[0])
      : aiBasketG1.length === 1 && aiBasketG1[0] !== "all"
      ? Number(aiBasketG1[0])
      : customersG1.length === 1 && customersG1[0] !== "all"
      ? Number(customersG1[0])
      : undefined;

  const group2Query = useInfiniteGroup2({
    search: g2Search.applied,
    group1: selectedG1Id,
  });

  // ─── API: group3 (cascades from selected g2) ───────────────────────────────
  const selectedG2Id =
    salesG2.length === 1 && salesG2[0] !== "all"
      ? Number(salesG2[0])
      : branchesG2.length === 1 && branchesG2[0] !== "all"
      ? Number(branchesG2[0])
      : aiBasketG2.length === 1 && aiBasketG2[0] !== "all"
      ? Number(aiBasketG2[0])
      : customersG2.length === 1 && customersG2[0] !== "all"
      ? Number(customersG2[0])
      : undefined;

  const group3Query = useInfiniteGroup3({
    search: g3Search.applied,
    group2: selectedG2Id,
  });

  // ─── API: products (cascades from g1/g2/g3 + agreements) ──────────────────
  const productsQuery = useInfiniteProducts({
    search: productSearch.applied,
    group1_ids: toCsv(
      [...salesG1, ...branchesG1, ...aiBasketG1, ...customersG1].filter(
        (v) => v && v !== "all",
      ),
    ),
    group2_ids: toCsv(
      [...salesG2, ...branchesG2, ...aiBasketG2, ...customersG2].filter(
        (v) => v && v !== "all",
      ),
    ),
    group3_ids: toCsv(
      [...salesG3, ...branchesG3, ...aiBasketReportG3, ...customersG3].filter(
        (v) => v && v !== "all",
      ),
    ),
    agreement_ids: toCsv(
      agreement.filter((v) => v && v !== "all").map(Number).filter(Boolean),
    ),
  });

  // ─── API: agreements ───────────────────────────────────────────────────────
  const agreementsQuery = useInfiniteAgreements({
    search: agreementSearch.applied,
  });

  // ── sync sales filters → filterStore ──────────────────────────────────────
  useEffect(() => {
    if (!isSalesPage) {
      setFilter("region", []);
      setFilter("productCategory", []);
      setFilter("subcategory", []);
      setFilter("product", []);
      return;
    }
    setFilter("region", normalizeSelections(activeRegions));
    setFilter("productCategory", normalizeSelections(salesG1));
    setFilter("subcategory", normalizeSelections(salesG2));
    setFilter("product", normalizeSelections(salesG3));
  }, [isSalesPage, activeRegions, salesG1, salesG2, salesG3, setFilter]);

  // ── sync date → filterStore ────────────────────────────────────────────────
  useEffect(() => {
    if (!isSalesPage) return;
    const { year, quarter, month, day } = deriveDateFilters(dateFrom, dateTo);
    setFilter("year", year);
    setFilter("quarter", quarter);
    setFilter("month", month);
    setFilter("day", day);
  }, [isSalesPage, dateFrom, dateTo, setFilter]);

  // ── initialise period per page ─────────────────────────────────────────────
  useEffect(() => {
    if (isSalesPage) {
      setActivePeriod(DEFAULT_SALES_INSTANT_PERIOD);
      const r = getSalesQuickPeriodRange(DEFAULT_SALES_INSTANT_PERIOD);
      if (r) { setDateFrom(r.from); setDateTo(r.to); }
      return;
    }
    if (isBranchesPage || isEmployeesPage || isBasketLikePage) {
      setActivePeriod(DEFAULT_INSTANT_PERIOD);
      setDateFrom(""); setDateTo("");
      return;
    }
    setDateFrom(""); setDateTo("");
    const ap = useFilterStore.getState().activePeriod;
    if (SALES_QUICK_PERIOD_VALUES.has(ap)) setActivePeriod(DEFAULT_INSTANT_PERIOD);
  }, [isSalesPage, isBranchesPage, isEmployeesPage, isBasketLikePage, setActivePeriod]);

  // ── scroll-hide reports row ────────────────────────────────────────────────
  useEffect(() => {
    const el = document.getElementById("dashboard-scroll-root");
    if (!el) return;
    const onScroll = () => {
      const t = el.scrollTop;
      setShowReportsRow((prev) => (prev ? t < FILTERS_HIDE_THRESHOLD : t <= FILTERS_SHOW_THRESHOLD));
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (pathname === "/reports") return null;

  // ── dirty / hasReportFilter ────────────────────────────────────────────────
  const salesInstantDirty =
    isSalesPage &&
    (salesG1.length > 0 || salesG2.length > 0 || salesG3.length > 0 ||
     salesCompany.length > 0 || salesProduct.length > 0);

  const defaultInstantPeriod = isSalesPage ? DEFAULT_SALES_INSTANT_PERIOD : DEFAULT_INSTANT_PERIOD;

  const isAnyInstantChanged =
    activeBranches.length > 0 ||
    activePeriod !== defaultInstantPeriod ||
    activeRegions.length > 0 ||
    (isBranchesPage && branchCities.length > 0) ||
    (isBranchesPage && (branchesG1.length > 0 || branchesG2.length > 0 || branchesG3.length > 0 || branchesProduct !== "")) ||
    dateFrom !== "" || dateTo !== "" ||
    (isEmployeesPage && (employeeCities.length > 0 || workShift !== "all")) ||
    (isEmployeesPage && (returnRateRange[0] !== 0 || returnRateRange[1] !== 100)) ||
    (isEmployeesPage && (dailyInvoiceRatioRange[0] !== 0 || dailyInvoiceRatioRange[1] !== 100)) ||
    (isEmployeesPage && (employeePerformanceRatioRange[0] !== 0 || employeePerformanceRatioRange[1] !== 100)) ||
    (isBasketLikePage && (aiBasketCities.length > 0 || aiBasketSaleTime !== "all" || aiBasketHoliday !== "" || aiBasketOffers !== "")) ||
    (isBasketLikePage && (aiBasketValueRange[0] !== 0 || aiBasketValueRange[1] !== 100_000)) ||
    (isBasketLikePage && (aiBasketG1.length > 0 || aiBasketG2.length > 0)) ||
    (isCustomersPage && (customersCities.length > 0 || customersSaleTime !== "all" || holiday !== "" || customersOffers !== "" || customersSaleMethod !== "")) ||
    (isCustomersPage && (customersBasketValueRange[0] !== 0 || customersBasketValueRange[1] !== 100_000)) ||
    salesInstantDirty;

  const hasReportFilter = isSalesPage
    ? !!(paymentType || saleMethod || agreement.length > 0)
    : isEmployeesPage
    ? !!(paymentType || saleMethod)
    : isBasketLikePage
    ? !!(aiBasketReportG3.length || product || paymentType || saleMethod)
    : isCustomersPage
    ? !!(customersG1.length || customersG2.length || customersG3.length || customersProduct)
    : isBranchesPage
    ? !!(branchSaleTime !== "all" || branchHoliday !== "" || branchOffers !== "" || paymentType || saleMethod)
    : !!(distributor || category || product || discount || paymentType ||
         (isProductsPage && (prodG1 || prodG2 || prodG3 || prodName)));

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleCreateReport = useCallback(() => setShowNameDialog(true), []);

  const handleConfirmName = useCallback(
    (name: string) => {
      setReportName(name);
      setShowNameDialog(false);
      setShowPopup(true);
      setDistributor(""); setCategory(""); setProduct("");
      setDiscount(""); setPaymentType(""); setSaleMethod("");
      setFilter("agreement", []);
      setFilter("branchSaleTime", "all");
      setFilter("branchHoliday", "");
      setFilter("branchOffers", "");
      setAiBasketReportG3([]);
      setCustomersG1([]); setCustomersG2([]); setCustomersG3([]);
      setCustomersProduct("");
      setProdG1(""); setProdG2(""); setProdG3(""); setProdName("");
    },
    [setFilter],
  );

  const resetAll = useCallback(() => {
    setActiveBranches([]);
    if (pathname === "/sales") {
      setActivePeriod(DEFAULT_SALES_INSTANT_PERIOD);
      const r = getSalesQuickPeriodRange(DEFAULT_SALES_INSTANT_PERIOD);
      if (r) { setDateFrom(r.from); setDateTo(r.to); }
    } else {
      setActivePeriod(DEFAULT_INSTANT_PERIOD);
      setDateFrom(""); setDateTo("");
    }
    setActiveRegions([]);
    setFilter("employee", []); setFilter("employeeCities", []); setFilter("workShift", "all");
    setFilter("returnRateRange", [0, 100]); setFilter("dailyInvoiceRatioRange", [0, 100]);
    setFilter("employeePerformanceRatioRange", [0, 100]);
    setFilter("aiBasketCities", []); setFilter("aiBasketSaleTime", "all");
    setFilter("aiBasketHoliday", ""); setFilter("aiBasketOffers", "");
    setFilter("aiBasketValueRange", [0, 100_000]);
    setFilter("customersCities", []); setFilter("customersSaleTime", "all");
    setFilter("customersOffers", ""); setFilter("customersSaleMethod", "");
    setFilter("customersBasketValueRange", [0, 100_000]);
    setFilter("branchCities", []); setFilter("branchSaleTime", "all");
    setFilter("branchHoliday", ""); setFilter("branchOffers", "");
    setFilter("agreement", []); setFilter("region", []);
    setFilter("productCategory", []); setFilter("subcategory", []); setFilter("product", []);
    setFilter("holiday", "");
    setAiBasketG1([]); setAiBasketG2([]); setAiBasketReportG3([]);
    setBranchesG1([]); setBranchesG2([]); setBranchesG3([]); setBranchesProduct("");
    setSalesG1([]); setSalesG2([]); setSalesG3([]); setSalesCompany([]); setSalesProduct([]);
    setDistributor(""); setCategory(""); setProduct("");
    setDiscount(""); setPaymentType(""); setSaleMethod("");
    setCustomersG1([]); setCustomersG2([]); setCustomersG3([]); setCustomersProduct("");
    setProdG1(""); setProdG2(""); setProdG3(""); setProdName("");
  }, [pathname, setActiveBranches, setActivePeriod, setFilter]);

  // ── shared accent shortcuts ────────────────────────────────────────────────
  const ACCENT_REGION   = "var(--accent-cyan)";
  const ACCENT_BRANCH   = "var(--accent-green)";
  const ACCENT_COMPANY  = "#6366f1";
  const ACCENT_G1       = "var(--accent-amber)";
  const ACCENT_G2       = "#f59e0b";
  const ACCENT_G3       = "#ea580c";
  const ACCENT_PRODUCT  = "#00d4ff";
  const ACCENT_AGREEMENT= "#c084fc";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div
        style={{
          position: "relative", zIndex: 1, marginBottom: 16, borderRadius: 12,
          background: "var(--bg-panel)", border: "1px solid var(--border-subtle)",
          padding: "7px 14px", display: "flex", alignItems: "center",
          gap: 8, flexWrap: "wrap",
          boxShadow: "0 2px 12px rgba(0,0,0,.2)", backdropFilter: "blur(20px)",
        }}
      >
        {/* ⚡ لحظي badge */}
        <span style={{ fontSize: 9, fontWeight: 800, color: "var(--accent-green)", letterSpacing: ".5px", whiteSpace: "nowrap", textTransform: "uppercase" }}>
          ⚡ لحظي
        </span>

        {/* ── Date always first ─────────────────────────────────────────── */}
        <DateFilterDropdown
          activePeriod={activePeriod}
          setActivePeriod={setActivePeriod}
          dateFrom={dateFrom} dateTo={dateTo}
          setDateFrom={setDateFrom} setDateTo={setDateTo}
          quickPeriodOptions={QUICK_PERIODS}
          fillQuickPeriodDates={isSalesPage ? getSalesQuickPeriodRange : undefined}
          rangeGranularity="month"
        />

        {/* ── Region (all pages) — infinite ─────────────────────────────── */}
        <InfiniteDropdown
          mode="multi"
          icon={MapPin}
          label="الإقليم"
          accent={ACCENT_REGION}
          selectedValues={activeRegions}
          onChange={setActiveRegions}
          manyLabel={(n) => `${n} أقاليم`}
          queryResult={regionsQuery as any}
          onSearch={regionSearch.set}
          searchValue={regionSearch.raw}
        />

        {/* ── Branches (all pages) — infinite, cascades from region ─────── */}
        <InfiniteDropdown
          mode="multi"
          icon={Building2}
          label="الفرع"
          accent={ACCENT_BRANCH}
          selectedValues={activeBranches}
          onChange={setActiveBranches}
          manyLabel={(n) => `${n} فروع`}
          queryResult={branchesQuery as any}
          onSearch={branchSearch.set}
          searchValue={branchSearch.raw}
        />

        {/* ═══════════════════════ PAGE-SPECIFIC ══════════════════════════ */}

        {/* ── /branches ───────────────────────────────────────────────────── */}
        {isBranchesPage && (
          <>
            <MultiSelectDropdown
              icon={MapPinned} label="المدينة"
              selectedValues={branchCities}
              options={[...EMPLOYEES_CITIES]}
              onChange={(v) => setFilter("branchCities", v)}
              accent="#38bdf8" manyLabel={(n) => `${n} مدن`}
            />
            <InfiniteDropdown
              mode="multi" icon={Layers} label="المجموعة الأولى"
              accent={ACCENT_G1} selectedValues={branchesG1}
              onChange={setBranchesG1} manyLabel={(n) => `${n} مجموعات`}
              queryResult={group1Query as any}
              onSearch={g1Search.set} searchValue={g1Search.raw}
            />
            <InfiniteDropdown
              mode="multi" icon={Layers} label="المجموعة الثانية"
              accent={ACCENT_G2} selectedValues={branchesG2}
              onChange={setBranchesG2} manyLabel={(n) => `${n} مجموعات`}
              queryResult={group2Query as any}
              onSearch={g2Search.set} searchValue={g2Search.raw}
            />
            <InfiniteDropdown
              mode="multi" icon={Layers} label="المجموعة الثالثة"
              accent={ACCENT_G3} selectedValues={branchesG3}
              onChange={setBranchesG3} manyLabel={(n) => `${n} مجموعات`}
              queryResult={group3Query as any}
              onSearch={g3Search.set} searchValue={g3Search.raw}
            />
            <InfiniteDropdown
              mode="single" icon={Package} label="المنتج"
              accent={ACCENT_PRODUCT}
              value={branchesProduct}
              onChange={setBranchesProduct}
              queryResult={productsQuery as any}
              onSearch={productSearch.set} searchValue={productSearch.raw}
            />
          </>
        )}

        {/* ── /employees ──────────────────────────────────────────────────── */}
        {isEmployeesPage && (
          <>
            <MultiSelectDropdown
              icon={MapPinned} label="المدينة"
              selectedValues={employeeCities}
              options={[...EMPLOYEES_CITIES]}
              onChange={(v) => setFilter("employeeCities", v)}
              accent="#38bdf8" manyLabel={(n) => `${n} مدن`}
            />
            <Dropdown
              icon={Clock} label="وقت البيع" value={workShift}
              options={WORK_SHIFTS as unknown as { value: string; label: string }[]}
              onChange={(v) => setFilter("workShift", (v === "morning" || v === "evening" ? v : "all") as "all" | "morning" | "evening")}
              accent="var(--accent-cyan)"
            />
            <Dropdown
              icon={Percent} label="نسبة عدد الفواتير اليومية"
              value={`${dailyInvoiceRatioRange[0]}-${dailyInvoiceRatioRange[1]}`}
              options={DAILY_INVOICE_RATIO_RANGES.map((r) => ({ value: `${r.range[0]}-${r.range[1]}`, label: r.label }))}
              onChange={(v) => {
                const hit = DAILY_INVOICE_RATIO_RANGES.find((r) => `${r.range[0]}-${r.range[1]}` === v);
                setFilter("dailyInvoiceRatioRange", hit ? hit.range : [0, 100]);
              }}
              accent="#22c55e"
            />
            <Dropdown
              icon={Percent} label="نسبة المرتجعات"
              value={`${returnRateRange[0]}-${returnRateRange[1]}`}
              options={RETURN_RATE_RANGES.map((r) => ({ value: `${r.range[0]}-${r.range[1]}`, label: r.label }))}
              onChange={(v) => {
                const hit = RETURN_RATE_RANGES.find((r) => `${r.range[0]}-${r.range[1]}` === v);
                setFilter("returnRateRange", hit ? hit.range : [0, 100]);
              }}
              accent="var(--accent-red)"
            />
            <Dropdown
              icon={Percent} label="نسبة أداء الموظفين"
              value={`${employeePerformanceRatioRange[0]}-${employeePerformanceRatioRange[1]}`}
              options={EMPLOYEE_PERFORMANCE_RATIO_RANGES.map((r) => ({ value: `${r.range[0]}-${r.range[1]}`, label: r.label }))}
              onChange={(v) => {
                const hit = EMPLOYEE_PERFORMANCE_RATIO_RANGES.find((r) => `${r.range[0]}-${r.range[1]}` === v);
                setFilter("employeePerformanceRatioRange", hit ? hit.range : [0, 100]);
              }}
              accent="#a855f7"
            />
          </>
        )}

        {/* ── /ai-basket & /operations ─────────────────────────────────────── */}
        {isBasketLikePage && (
          <>
            <MultiSelectDropdown
              icon={MapPinned} label="المدينة"
              selectedValues={aiBasketCities}
              options={[...EMPLOYEES_CITIES]}
              onChange={(v) => setFilter("aiBasketCities", v)}
              accent="#38bdf8" manyLabel={(n) => `${n} مدن`}
            />
            <Dropdown
              icon={Clock} label="وقت البيع" value={aiBasketSaleTime}
              options={AI_BASKET_SHIFTS as unknown as { value: string; label: string }[]}
              onChange={(v) => setFilter("aiBasketSaleTime", (v === "morning" || v === "evening" ? v : "all") as "all" | "morning" | "evening")}
              accent="var(--accent-cyan)"
            />
            <Dropdown
              icon={Calendar} label="أيام العطل / المناسبات" value={aiBasketHoliday}
              options={AI_BASKET_HOLIDAY_OPTIONS}
              onChange={(v) => setFilter("aiBasketHoliday", v)}
              accent="var(--accent-amber)"
            />
            <Dropdown
              icon={Tag} label="العروض" value={aiBasketOffers}
              options={AI_BASKET_OFFERS as unknown as { value: string; label: string }[]}
              onChange={(v) => setFilter("aiBasketOffers", v)}
              accent="#f472b6"
            />
            <InfiniteDropdown
              mode="multi" icon={Layers} label="المجموعة الأولى"
              accent={ACCENT_G1} selectedValues={aiBasketG1}
              onChange={setAiBasketG1} manyLabel={(n) => `${n} مجموعات`}
              queryResult={group1Query as any}
              onSearch={g1Search.set} searchValue={g1Search.raw}
            />
            <InfiniteDropdown
              mode="multi" icon={Layers} label="المجموعة الثانية"
              accent={ACCENT_G2} selectedValues={aiBasketG2}
              onChange={setAiBasketG2} manyLabel={(n) => `${n} مجموعات`}
              queryResult={group2Query as any}
              onSearch={g2Search.set} searchValue={g2Search.raw}
            />
            <Dropdown
              icon={ShoppingCart} label="القيمة المادية للسلة"
              value={`${aiBasketValueRange[0]}-${aiBasketValueRange[1]}`}
              options={BASKET_VALUE_RANGES.map((r) => ({ value: `${r.range[0]}-${r.range[1]}`, label: r.label }))}
              onChange={(v) => {
                const hit = BASKET_VALUE_RANGES.find((r) => `${r.range[0]}-${r.range[1]}` === v);
                setFilter("aiBasketValueRange", hit ? hit.range : [0, 100_000]);
              }}
              accent="#14b8a6"
            />
          </>
        )}

        {/* ── /customers ──────────────────────────────────────────────────── */}
        {isCustomersPage && (
          <>
            <MultiSelectDropdown
              icon={MapPinned} label="المدينة"
              selectedValues={customersCities}
              options={[...EMPLOYEES_CITIES]}
              onChange={(v) => setFilter("customersCities", v)}
              accent="#38bdf8" manyLabel={(n) => `${n} مدن`}
            />
            <Dropdown
              icon={Clock} label="وقت البيع" value={customersSaleTime}
              options={AI_BASKET_SHIFTS as unknown as { value: string; label: string }[]}
              onChange={(v) => setFilter("customersSaleTime", (v === "morning" || v === "evening" ? v : "all") as "all" | "morning" | "evening")}
              accent="var(--accent-cyan)"
            />
            <Dropdown
              icon={Calendar} label="أيام العطل / المناسبات" value={holiday}
              options={CUSTOMER_HOLIDAYS as unknown as { value: string; label: string }[]}
              onChange={(v) => setFilter("holiday", v)}
              accent="var(--accent-amber)"
            />
            <Dropdown
              icon={Tag} label="العروض" value={customersOffers}
              options={AI_BASKET_OFFERS as unknown as { value: string; label: string }[]}
              onChange={(v) => setFilter("customersOffers", v)}
              accent="#f472b6"
            />
            <Dropdown
              icon={Store} label="طريقة البيع" value={customersSaleMethod}
              options={[{ value: "", label: "طريقة البيع" }, ...SALE_METHOD_OPTIONS.map((m) => ({ value: m, label: m }))]}
              onChange={(v) => setFilter("customersSaleMethod", v)}
              accent="#0ea5e9"
            />
            <Dropdown
              icon={ShoppingCart} label="القيمة المادية للسلة"
              value={`${customersBasketValueRange[0]}-${customersBasketValueRange[1]}`}
              options={BASKET_VALUE_RANGES.map((r) => ({ value: `${r.range[0]}-${r.range[1]}`, label: r.label }))}
              onChange={(v) => {
                const hit = BASKET_VALUE_RANGES.find((r) => `${r.range[0]}-${r.range[1]}` === v);
                setFilter("customersBasketValueRange", hit ? hit.range : [0, 100_000]);
              }}
              accent="#14b8a6"
            />
          </>
        )}

        {/* ── /products ───────────────────────────────────────────────────── */}
        {isProductsPage && (
          <>
            <InfiniteDropdown
              mode="single" icon={Layers} label="المجموعة الأولى"
              accent={ACCENT_G1} value={prodG1}
              onChange={setProdG1}
              queryResult={group1Query as any}
              onSearch={g1Search.set} searchValue={g1Search.raw}
            />
            <InfiniteDropdown
              mode="single" icon={Layers} label="المجموعة الثانية"
              accent={ACCENT_G2} value={prodG2}
              onChange={setProdG2}
              queryResult={group2Query as any}
              onSearch={g2Search.set} searchValue={g2Search.raw}
            />
            <InfiniteDropdown
              mode="single" icon={Layers} label="المجموعة الثالثة"
              accent={ACCENT_G3} value={prodG3}
              onChange={setProdG3}
              queryResult={group3Query as any}
              onSearch={g3Search.set} searchValue={g3Search.raw}
            />
            <InfiniteDropdown
              mode="single" icon={Package} label="المنتجات"
              accent={ACCENT_PRODUCT} value={prodName}
              onChange={setProdName}
              queryResult={productsQuery as any}
              onSearch={productSearch.set} searchValue={productSearch.raw}
            />
          </>
        )}

        {/* ── /sales ──────────────────────────────────────────────────────── */}
        {isSalesPage && (
          <>
            <InfiniteDropdown
              mode="multi" icon={Layers} label="المجموعة الأولى"
              accent={ACCENT_G1} selectedValues={salesG1}
              onChange={setSalesG1} manyLabel={(n) => `${n} مجموعات`}
              queryResult={group1Query as any}
              onSearch={g1Search.set} searchValue={g1Search.raw}
            />
            <InfiniteDropdown
              mode="multi" icon={Layers} label="المجموعة الثانية"
              accent={ACCENT_G2} selectedValues={salesG2}
              onChange={setSalesG2} manyLabel={(n) => `${n} مجموعات`}
              queryResult={group2Query as any}
              onSearch={g2Search.set} searchValue={g2Search.raw}
            />
            <InfiniteDropdown
              mode="multi" icon={Layers} label="المجموعة الثالثة"
              accent={ACCENT_G3} selectedValues={salesG3}
              onChange={setSalesG3} manyLabel={(n) => `${n} مجموعات`}
              queryResult={group3Query as any}
              onSearch={g3Search.set} searchValue={g3Search.raw}
            />
            <InfiniteDropdown
              mode="multi" icon={Building2} label="الشركة"
              accent={ACCENT_COMPANY} selectedValues={salesCompany}
              onChange={setSalesCompany} manyLabel={(n) => `${n} شركات`}
              queryResult={companiesQuery as any}
              onSearch={companySearch.set} searchValue={companySearch.raw}
            />
            <InfiniteDropdown
              mode="multi" icon={Package} label="كل المنتجات"
              accent={ACCENT_PRODUCT} selectedValues={salesProduct}
              onChange={setSalesProduct} manyLabel={(n) => `${n} منتجات`}
              queryResult={productsQuery as any}
              onSearch={productSearch.set} searchValue={productSearch.raw}
            />
          </>
        )}

        {/* ═══════════════════ REPORTS ROW (non-instant) ══════════════════ */}

        {/* Employees — report */}
        {showReportsRow && isEmployeesPage && (
          <>
            <Divider />
            <ReportsBadge />
            <Dropdown
              icon={CreditCard} label="نوع الدفع" value={paymentType}
              options={[{ value: "", label: "نوع الدفع" }, ...PAYMENT_TYPES.map((p) => ({ value: p, label: p }))]}
              onChange={setPaymentType} accent="#a855f7"
            />
            <Dropdown
              icon={Store} label="طريقة البيع" value={saleMethod}
              options={[{ value: "", label: "طريقة البيع" }, ...SALE_METHOD_OPTIONS.map((m) => ({ value: m, label: m }))]}
              onChange={setSaleMethod} accent="#0ea5e9"
            />
          </>
        )}

        {/* Basket-like — report */}
        {showReportsRow && isBasketLikePage && (
          <>
            <Divider />
            <ReportsBadge />
            <InfiniteDropdown
              mode="multi" icon={Layers} label="المجموعة الثالثة"
              accent={ACCENT_G3} selectedValues={aiBasketReportG3}
              onChange={setAiBasketReportG3} manyLabel={(n) => `${n} مجموعات`}
              queryResult={group3Query as any}
              onSearch={g3Search.set} searchValue={g3Search.raw}
            />
            <InfiniteDropdown
              mode="single" icon={Package} label="المنتج"
              accent={ACCENT_PRODUCT} value={product}
              onChange={setProduct}
              queryResult={productsQuery as any}
              onSearch={productSearch.set} searchValue={productSearch.raw}
            />
            <Dropdown
              icon={CreditCard} label="نوع الدفع" value={paymentType}
              options={[{ value: "", label: "نوع الدفع" }, ...PAYMENT_TYPES.map((p) => ({ value: p, label: p }))]}
              onChange={setPaymentType} accent="#a855f7"
            />
            <Dropdown
              icon={Store} label="طريقة البيع" value={saleMethod}
              options={[{ value: "", label: "طريقة البيع" }, ...SALE_METHOD_OPTIONS.map((m) => ({ value: m, label: m }))]}
              onChange={setSaleMethod} accent="#0ea5e9"
            />
          </>
        )}

        {/* Sales / Branches / Customers / Products / Others — report */}
        {!isEmployeesPage && !isBasketLikePage && showReportsRow && (
          <>
            <Divider />
            <ReportsBadge />

            {isSalesPage ? (
              <>
                <Dropdown
                  icon={CreditCard} label="نوع الدفع" value={paymentType}
                  options={[{ value: "", label: "نوع الدفع" }, ...PAYMENT_TYPES.map((p) => ({ value: p, label: p }))]}
                  onChange={setPaymentType} accent="#a855f7"
                />
                <Dropdown
                  icon={Store} label="طريقة البيع" value={saleMethod}
                  options={[{ value: "", label: "طريقة البيع" }, ...SALE_METHOD_OPTIONS.map((m) => ({ value: m, label: m }))]}
                  onChange={setSaleMethod} accent="#0ea5e9"
                />
                {/* Agreements — infinite */}
                <InfiniteDropdown
                  mode="multi" icon={Handshake} label="الاتفاقية"
                  accent={ACCENT_AGREEMENT} selectedValues={agreement}
                  onChange={(v) => setFilter("agreement", v)}
                  manyLabel={(n) => `${n} اتفاقيات`}
                  queryResult={agreementsQuery as any}
                  toOption={(item: any) => ({
                    value: String(item.id),
                    label: item.agreement_no ?? item.name,
                  })}
                  onSearch={agreementSearch.set}
                  searchValue={agreementSearch.raw}
                />
              </>
            ) : isBranchesPage ? (
              <>
                <Dropdown
                  icon={Clock} label="وقت البيع" value={branchSaleTime}
                  options={AI_BASKET_SHIFTS as unknown as { value: string; label: string }[]}
                  onChange={(v) => setFilter("branchSaleTime", (v === "morning" || v === "evening" ? v : "all") as "all" | "morning" | "evening")}
                  accent="var(--accent-cyan)"
                />
                <Dropdown
                  icon={Calendar} label="أيام العطل / المناسبات" value={branchHoliday}
                  options={BRANCH_HOLIDAY_OPTIONS}
                  onChange={(v) => setFilter("branchHoliday", v)}
                  accent="var(--accent-amber)"
                />
                <Dropdown
                  icon={Tag} label="العروض" value={branchOffers}
                  options={AI_BASKET_OFFERS as unknown as { value: string; label: string }[]}
                  onChange={(v) => setFilter("branchOffers", v)}
                  accent="#f472b6"
                />
                <Dropdown
                  icon={CreditCard} label="نوع الدفع" value={paymentType}
                  options={[{ value: "", label: "نوع الدفع" }, ...PAYMENT_TYPES.map((p) => ({ value: p, label: p }))]}
                  onChange={setPaymentType} accent="#a855f7"
                />
                <Dropdown
                  icon={Store} label="طريقة البيع" value={saleMethod}
                  options={[{ value: "", label: "طريقة البيع" }, ...SALE_METHOD_OPTIONS.map((m) => ({ value: m, label: m }))]}
                  onChange={setSaleMethod} accent="#0ea5e9"
                />
              </>
            ) : isCustomersPage ? (
              <>
                <InfiniteDropdown
                  mode="multi" icon={Layers} label="المجموعة الأولى"
                  accent={ACCENT_G1} selectedValues={customersG1}
                  onChange={setCustomersG1} manyLabel={(n) => `${n} مجموعات`}
                  queryResult={group1Query as any}
                  onSearch={g1Search.set} searchValue={g1Search.raw}
                />
                <InfiniteDropdown
                  mode="multi" icon={Layers} label="المجموعة الثانية"
                  accent={ACCENT_G2} selectedValues={customersG2}
                  onChange={setCustomersG2} manyLabel={(n) => `${n} مجموعات`}
                  queryResult={group2Query as any}
                  onSearch={g2Search.set} searchValue={g2Search.raw}
                />
                <InfiniteDropdown
                  mode="multi" icon={Layers} label="المجموعة الثالثة"
                  accent={ACCENT_G3} selectedValues={customersG3}
                  onChange={setCustomersG3} manyLabel={(n) => `${n} مجموعات`}
                  queryResult={group3Query as any}
                  onSearch={g3Search.set} searchValue={g3Search.raw}
                />
                <InfiniteDropdown
                  mode="single" icon={Search} label="المنتج"
                  accent={ACCENT_PRODUCT} value={customersProduct}
                  onChange={setCustomersProduct}
                  queryResult={productsQuery as any}
                  onSearch={productSearch.set} searchValue={productSearch.raw}
                />
              </>
            ) : (
              <>
                <SearchDropdown icon={Truck} label="الموزع" value={distributor} options={DISTRIBUTORS} onChange={setDistributor} accent="#f59e0b" />
                <SearchDropdown icon={Package} label="الفئة" value={category} options={CATEGORIES} onChange={setCategory} accent="#3b82f6" />
                <SearchDropdown icon={Search} label="المنتج" value={product} options={PRODUCTS} onChange={setProduct} accent="#00d4ff" />
                {!isCustomersPage && (
                  <Dropdown
                    icon={Percent} label="الخصم" value={discount}
                    options={[{ value: "", label: "الخصم" }, ...DISCOUNTS.map((d) => ({ value: d, label: d }))]}
                    onChange={setDiscount} accent="#ef4444"
                  />
                )}
                {!isCustomersPage && (
                  <Dropdown
                    icon={CreditCard} label="نوع الدفع" value={paymentType}
                    options={[{ value: "", label: "نوع الدفع" }, ...PAYMENT_TYPES.map((p) => ({ value: p, label: p }))]}
                    onChange={setPaymentType} accent="#a855f7"
                  />
                )}
              </>
            )}
          </>
        )}

        {/* ── Spacer ──────────────────────────────────────────────────────── */}
        <div style={{ flex: 1 }} />

        {/* ── Create Report button ─────────────────────────────────────────── */}
        <AnimatePresence>
          {hasReportFilter && showReportsRow && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={handleCreateReport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: "var(--btn-primary-bg)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "var(--btn-primary-shadow)", whiteSpace: "nowrap" }}
            >
              <FileBarChart2 size={13} />
              إنشاء التقرير
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Reset button ─────────────────────────────────────────────────── */}
        {(isAnyInstantChanged || hasReportFilter) && (
          <button
            onClick={resetAll}
            style={{ padding: "4px 8px", borderRadius: 7, background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
          >
            <RotateCcw size={10} /> إعادة
          </button>
        )}
      </div>

      <AnimatePresence>
        {showNameDialog && <ReportNameDialog onConfirm={handleConfirmName} onCancel={() => setShowNameDialog(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showPopup && <ReportCreatingPopup name={reportName} onClose={() => setShowPopup(false)} />}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small layout atoms
// ─────────────────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ width: 1, height: 20, background: "var(--border-subtle)", marginInline: 4 }} />;
}

function ReportsBadge() {
  return (
    <span style={{ fontSize: 9, fontWeight: 800, color: "var(--text-muted)", letterSpacing: ".5px", whiteSpace: "nowrap", textTransform: "uppercase" }}>
      📊 غير لحظي
    </span>
  );
}