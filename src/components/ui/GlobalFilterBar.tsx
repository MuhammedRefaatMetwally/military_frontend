"use client";

import { useState, useEffect, useCallback } from "react";
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
  BRANCHES,
  CATEGORIES,
  CUSTOMER_HOLIDAYS,
  DAILY_INVOICE_RATIO_RANGES,
  DISTRIBUTORS,
  EMPLOYEE_PERFORMANCE_RATIO_RANGES,
  EMPLOYEES_CITIES,
  getSalesQuickPeriodRange,
  PRODUCTS,
  PRODUCTS_GROUP_1,
  PRODUCTS_GROUP_2,
  PRODUCTS_GROUP_3,
  QUICK_PERIODS,
  REGIONS,
  RETURN_RATE_RANGES,
  SALE_METHOD_OPTIONS,
  SALES_AGREEMENTS,
  SALES_COMPANIES,
  SALES_GROUP_1,
  SALES_GROUP_2,
  SALES_GROUP_3,
  SALES_INSTANT_PRODUCTS,
  SALES_QUICK_PERIOD_VALUES,
  WORK_SHIFTS,
} from "@/utils/filterUtils";
import { Dropdown } from "./Dropdown";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { SearchDropdown } from "./SearchDropdown";
import { DateFilterDropdown } from "./DateFilterDropdown";
import { ReportNameDialog } from "./ReportNameDialog";
import { ReportCreatingPopup } from "./ReportCreatingPopup";

const DEFAULT_INSTANT_PERIOD = "month";
const DEFAULT_SALES_INSTANT_PERIOD = "month";

const FILTERS_HIDE_THRESHOLD = 80;
const FILTERS_SHOW_THRESHOLD = 24;

/** صفحة /branches — تقارير: خيارات العطل/المناسبات */
const BRANCH_HOLIDAY_OPTIONS = AI_BASKET_HOLIDAY_OPTIONS;

const DISCOUNTS = ["0%", "1-2%", "2-5%", "5-10%", "11-25%"];
const PAYMENT_TYPES = ["نقدي", "فيزا / بطاقة", "محفظة إلكترونية", "آجل / ذمم"];

// ═══════════════════════════════════════════════
// المكوّن الرئيسي
// ═══════════════════════════════════════════════
export default function GlobalFilterBar() {
  const pathname = usePathname();
  const isSalesPage = pathname === "/sales";
  const isBranchesPage = pathname === "/branches";
  const isEmployeesPage = pathname === "/employees";
  const isAiBasketPage = pathname === "/ai-basket";
  const isOperationsPage = pathname === "/operations";
  const isCustomersPage = pathname === "/customers";
  const isProductsPage = pathname === "/products";
  const isBasketLikePage = isAiBasketPage || isOperationsPage;
  const {
    activeBranches,
    activePeriod,
    workShift,
    returnRateRange,
    employeeCities,
    dailyInvoiceRatioRange,
    employeePerformanceRatioRange,
    aiBasketCities,
    aiBasketSaleTime,
    aiBasketHoliday,
    aiBasketOffers,
    aiBasketValueRange,
    branchCities,
    branchSaleTime,
    branchHoliday,
    branchOffers,
    agreement,
    holiday,
    customersCities,
    customersSaleTime,
    customersOffers,
    customersSaleMethod,
    customersBasketValueRange,
    setActiveBranches,
    setActivePeriod,
    setFilter,
  } = useFilterStore();

  // فلاتر لحظية إضافية ([] = كل الأقاليم)
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /** فلاتر /sales — مجموعات + شركة + منتج (لحظي). */
  const [salesG1, setSalesG1] = useState<string[]>([]);
  const [salesG2, setSalesG2] = useState<string[]>([]);
  const [salesG3, setSalesG3] = useState<string[]>([]);
  const [salesCompany, setSalesCompany] = useState<string[]>([]);
  const [salesProduct, setSalesProduct] = useState<string[]>([]);

  useEffect(() => {
    if (!isSalesPage) {
      setFilter("region", []);
      setFilter("productCategory", []);
      setFilter("subcategory", []);
      setFilter("product", []);
      return;
    }

    setFilter("region", activeRegions);
    setFilter("productCategory", salesG1);
    setFilter("subcategory", salesG2);
    setFilter("product", salesG3);
  }, [isSalesPage, activeRegions, salesG1, salesG2, salesG3, setFilter]);

  /** فلاتر /branches — تقرير تفصيلي: المجموعات الثلاث. */
  /** /branches — لحظي: المجموعات الثلاث + المنتج */
  const [branchesInstantG1, setBranchesInstantG1] = useState<string[]>([]);
  const [branchesInstantG2, setBranchesInstantG2] = useState<string[]>([]);
  const [branchesInstantG3, setBranchesInstantG3] = useState<string[]>([]);
  const [branchesInstantProduct, setBranchesInstantProduct] = useState("");

  /** فلاتر /ai-basket — لحظي: المجموعة ١ و٢؛ تقرير: المجموعة ٣. */
  const [aiBasketG1, setAiBasketG1] = useState<string[]>([]);
  const [aiBasketG2, setAiBasketG2] = useState<string[]>([]);
  const [aiBasketReportG3, setAiBasketReportG3] = useState<string[]>([]);

  /** فلاتر /customers — غير لحظي: المجموعات الثلاث + المنتج. */
  const [customersG1, setCustomersG1] = useState<string[]>([]);
  const [customersG2, setCustomersG2] = useState<string[]>([]);
  const [customersG3, setCustomersG3] = useState<string[]>([]);
  const [customersProduct, setCustomersProduct] = useState("");

  useEffect(() => {
    if (isSalesPage) {
      setActivePeriod(DEFAULT_SALES_INSTANT_PERIOD);
      const r = getSalesQuickPeriodRange(DEFAULT_SALES_INSTANT_PERIOD);
      if (r) {
        // eslint-disable-next-line
        setDateFrom(r.from);
        setDateTo(r.to);
      }
      return;
    }
    if (isBranchesPage || isEmployeesPage || isBasketLikePage) {
      setActivePeriod(DEFAULT_INSTANT_PERIOD);
      setDateFrom("");
      setDateTo("");
      return;
    }
    setDateFrom("");
    setDateTo("");
    const ap = useFilterStore.getState().activePeriod;
    if (SALES_QUICK_PERIOD_VALUES.has(ap)) {
      setActivePeriod(DEFAULT_INSTANT_PERIOD);
    }
  }, [
    isSalesPage,
    isBranchesPage,
    isEmployeesPage,
    isBasketLikePage,
    setActivePeriod,
  ]);

  // فلاتر التقارير
  const [distributor, setDistributor] = useState("");
  const [category, setCategory] = useState("");
  const [product, setProduct] = useState("");
  const [discount, setDiscount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [saleMethod, setSaleMethod] = useState("");
  const [prodG1, setProdG1] = useState("");
  const [prodG2, setProdG2] = useState("");
  const [prodG3, setProdG3] = useState("");
  const [prodName, setProdName] = useState("");

  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [reportName, setReportName] = useState("");

  const hasReportFilter = isSalesPage
    ? !!(paymentType || saleMethod || agreement.length > 0)
    : isEmployeesPage
      ? !!(paymentType || saleMethod)
      : isBasketLikePage
        ? !!(aiBasketReportG3.length || product || paymentType || saleMethod)
        : isCustomersPage
          ? !!(
              customersG1.length ||
              customersG2.length ||
              customersG3.length ||
              customersProduct
            )
          : isBranchesPage
            ? !!(
                branchSaleTime !== "all" ||
                branchHoliday !== "" ||
                branchOffers !== "" ||
                paymentType ||
                saleMethod
              )
            : !!(
                distributor ||
                category ||
                product ||
                discount ||
                paymentType ||
                (isProductsPage && (prodG1 || prodG2 || prodG3 || prodName))
              );

  const handleCreateReport = useCallback(() => {
    setShowNameDialog(true);
  }, []);

  const handleConfirmName = useCallback(
    (name: string) => {
      setReportName(name);
      setShowNameDialog(false);
      setShowPopup(true);
      // reset report filters after submission
      setDistributor("");
      setCategory("");
      setProduct("");
      setDiscount("");
      setPaymentType("");
      setSaleMethod("");
      setFilter("agreement", []);
      setFilter("branchSaleTime", "all");
      setFilter("branchHoliday", "");
      setFilter("branchOffers", "");
      setAiBasketReportG3([]);
      setCustomersG1([]);
      setCustomersG2([]);
      setCustomersG3([]);
      setCustomersProduct("");
      setProdG1("");
      setProdG2("");
      setProdG3("");
      setProdName("");
    },
    [setFilter],
  );

  const resetAll = useCallback(() => {
    setActiveBranches([]);
    if (pathname === "/sales") {
      setActivePeriod(DEFAULT_SALES_INSTANT_PERIOD);
      const r = getSalesQuickPeriodRange(DEFAULT_SALES_INSTANT_PERIOD);
      if (r) {
        setDateFrom(r.from);
        setDateTo(r.to);
      }
    } else {
      setActivePeriod(DEFAULT_INSTANT_PERIOD);
      setDateFrom("");
      setDateTo("");
    }
    setActiveRegions([]);
    setFilter("employee", []);
    setFilter("employeeCities", []);
    setFilter("workShift", "all");
    setFilter("returnRateRange", [0, 100]);
    setFilter("dailyInvoiceRatioRange", [0, 100]);
    setFilter("employeePerformanceRatioRange", [0, 100]);
    setFilter("aiBasketCities", []);
    setFilter("aiBasketSaleTime", "all");
    setFilter("aiBasketHoliday", "");
    setFilter("aiBasketOffers", "");
    setFilter("aiBasketValueRange", [0, 100_000]);
    setFilter("customersCities", []);
    setFilter("customersSaleTime", "all");
    setFilter("customersOffers", "");
    setFilter("customersSaleMethod", "");
    setFilter("customersBasketValueRange", [0, 100_000]);
    setFilter("branchCities", []);
    setFilter("branchSaleTime", "all");
    setFilter("branchHoliday", "");
    setFilter("branchOffers", "");
    setFilter("agreement", []);
    setFilter("region", []);
    setFilter("productCategory", []);
    setFilter("subcategory", []);
    setFilter("product", []);
    setFilter("holiday", "");
    setAiBasketG1([]);
    setAiBasketG2([]);
    setAiBasketReportG3([]);
    setBranchesInstantG1([]);
    setBranchesInstantG2([]);
    setBranchesInstantG3([]);
    setBranchesInstantProduct("");
    setSalesG1([]);
    setSalesG2([]);
    setSalesG3([]);
    setSalesCompany([]);
    setSalesProduct([]);
    setDistributor("");
    setCategory("");
    setProduct("");
    setDiscount("");
    setPaymentType("");
    setSaleMethod("");
    setCustomersG1([]);
    setCustomersG2([]);
    setCustomersG3([]);
    setCustomersProduct("");
    setProdG1("");
    setProdG2("");
    setProdG3("");
    setProdName("");
  }, [pathname, setActiveBranches, setActivePeriod, setFilter]);

  const [showReportsRow, setShowReportsRow] = useState(true);

  useEffect(() => {
    const el = document.getElementById("dashboard-scroll-root");
    if (!el) return;
    const onScroll = () => {
      const currentTop = el.scrollTop;
      setShowReportsRow((prev) => {
        if (prev) {
          return currentTop < FILTERS_HIDE_THRESHOLD;
        }
        return currentTop <= FILTERS_SHOW_THRESHOLD;
      });
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (pathname === "/reports") return null;

  const salesInstantDirty =
    isSalesPage &&
    (salesG1.length > 0 ||
      salesG2.length > 0 ||
      salesG3.length > 0 ||
      salesCompany.length > 0 ||
      salesProduct.length > 0);

  const defaultInstantPeriod = isSalesPage
    ? DEFAULT_SALES_INSTANT_PERIOD
    : DEFAULT_INSTANT_PERIOD;

  const isAnyInstantChanged =
    activeBranches.length > 0 ||
    activePeriod !== defaultInstantPeriod ||
    activeRegions.length > 0 ||
    (isBranchesPage && branchCities.length > 0) ||
    (isBranchesPage &&
      (branchesInstantG1.length > 0 ||
        branchesInstantG2.length > 0 ||
        branchesInstantG3.length > 0 ||
        branchesInstantProduct !== "")) ||
    dateFrom ||
    dateTo ||
    (isEmployeesPage && employeeCities.length > 0) ||
    (isEmployeesPage && workShift !== "all") ||
    (isEmployeesPage &&
      (returnRateRange[0] !== 0 || returnRateRange[1] !== 100)) ||
    (isEmployeesPage &&
      (dailyInvoiceRatioRange[0] !== 0 || dailyInvoiceRatioRange[1] !== 100)) ||
    (isEmployeesPage &&
      (employeePerformanceRatioRange[0] !== 0 ||
        employeePerformanceRatioRange[1] !== 100)) ||
    (isBasketLikePage && aiBasketCities.length > 0) ||
    (isBasketLikePage && aiBasketSaleTime !== "all") ||
    (isBasketLikePage && aiBasketHoliday !== "") ||
    (isBasketLikePage && aiBasketOffers !== "") ||
    (isBasketLikePage &&
      (aiBasketValueRange[0] !== 0 || aiBasketValueRange[1] !== 100_000)) ||
    (isBasketLikePage && (aiBasketG1.length > 0 || aiBasketG2.length > 0)) ||
    (isCustomersPage &&
      (customersCities.length > 0 ||
        customersSaleTime !== "all" ||
        holiday !== "" ||
        customersOffers !== "" ||
        customersSaleMethod ||
        customersBasketValueRange[0] !== 0 ||
        customersBasketValueRange[1] !== 100_000)) ||
    salesInstantDirty;

  return (
    <>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginBottom: 16,
          borderRadius: 12,
          background: "var(--bg-panel)",
          border: "1px solid var(--border-subtle)",
          padding: "7px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          boxShadow: "0 2px 12px rgba(0,0,0,.2)",
          backdropFilter: "blur(20px)",
        }}
      >
        <>
          {/* ── فلاتر لحظية ── */}
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "var(--accent-green)",
              letterSpacing: ".5px",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
            }}
          >
            ⚡ لحظي
          </span>

          {isBranchesPage ? (
            <>
              <DateFilterDropdown
                activePeriod={activePeriod}
                setActivePeriod={setActivePeriod}
                dateFrom={dateFrom}
                dateTo={dateTo}
                setDateFrom={setDateFrom}
                setDateTo={setDateTo}
                quickPeriodOptions={[...QUICK_PERIODS]}
                rangeGranularity="month"
              />
              <MultiSelectDropdown
                icon={MapPin}
                label="الإقليم"
                selectedValues={activeRegions}
                options={REGIONS}
                onChange={setActiveRegions}
                accent="var(--accent-cyan)"
                manyLabel={(n) => `${n} أقاليم`}
              />
              <MultiSelectDropdown
                icon={MapPinned}
                label="المدينة"
                selectedValues={branchCities}
                options={[...EMPLOYEES_CITIES]}
                onChange={(v) => setFilter("branchCities", v)}
                accent="#38bdf8"
                manyLabel={(n) => `${n} مدن`}
              />
              <MultiSelectDropdown
                icon={Building2}
                label="الفرع"
                selectedValues={activeBranches}
                options={BRANCHES}
                onChange={setActiveBranches}
                accent="var(--accent-green)"
                manyLabel={(n) => `${n} فروع`}
              />
              <MultiSelectDropdown
                icon={Layers}
                label="المجموعة الأولى"
                selectedValues={branchesInstantG1}
                options={SALES_GROUP_1}
                onChange={setBranchesInstantG1}
                accent="var(--accent-amber)"
                manyLabel={(n) => `${n} مجموعات`}
              />
              <MultiSelectDropdown
                icon={Layers}
                label="المجموعة الثانية"
                selectedValues={branchesInstantG2}
                options={SALES_GROUP_2}
                onChange={setBranchesInstantG2}
                accent="#f59e0b"
                manyLabel={(n) => `${n} مجموعات`}
              />
              <MultiSelectDropdown
                icon={Layers}
                label="المجموعة الثالثة"
                selectedValues={branchesInstantG3}
                options={SALES_GROUP_3}
                onChange={setBranchesInstantG3}
                accent="#ea580c"
                manyLabel={(n) => `${n} مجموعات`}
              />
              <SearchDropdown
                icon={Search}
                label="المنتج"
                value={branchesInstantProduct}
                options={PRODUCTS}
                onChange={setBranchesInstantProduct}
                accent="#00d4ff"
              />
            </>
          ) : isEmployeesPage ? (
            <>
              <DateFilterDropdown
                activePeriod={activePeriod}
                setActivePeriod={setActivePeriod}
                dateFrom={dateFrom}
                dateTo={dateTo}
                setDateFrom={setDateFrom}
                setDateTo={setDateTo}
                quickPeriodOptions={[...QUICK_PERIODS]}
                rangeGranularity="month"
              />
              <MultiSelectDropdown
                icon={MapPin}
                label="الإقليم"
                selectedValues={activeRegions}
                options={REGIONS}
                onChange={setActiveRegions}
                accent="var(--accent-cyan)"
                manyLabel={(n) => `${n} أقاليم`}
              />
              <MultiSelectDropdown
                icon={MapPinned}
                label="المدينة"
                selectedValues={employeeCities}
                options={[...EMPLOYEES_CITIES]}
                onChange={(v) => setFilter("employeeCities", v)}
                accent="#38bdf8"
                manyLabel={(n) => `${n} مدن`}
              />
              <MultiSelectDropdown
                icon={Building2}
                label="الفرع"
                selectedValues={activeBranches}
                options={BRANCHES}
                onChange={setActiveBranches}
                accent="var(--accent-green)"
                manyLabel={(n) => `${n} فروع`}
              />
              <Dropdown
                icon={Clock}
                label="وقت البيع"
                value={workShift}
                options={
                  WORK_SHIFTS as unknown as { value: string; label: string }[]
                }
                onChange={(v) =>
                  setFilter(
                    "workShift",
                    (v === "morning" || v === "evening" ? v : "all") as
                      | "all"
                      | "morning"
                      | "evening",
                  )
                }
                accent="var(--accent-cyan)"
              />
              <Dropdown
                icon={Percent}
                label="نسبة عدد الفواتير اليومية"
                value={`${dailyInvoiceRatioRange[0]}-${dailyInvoiceRatioRange[1]}`}
                options={DAILY_INVOICE_RATIO_RANGES.map((r) => ({
                  value: `${r.range[0]}-${r.range[1]}`,
                  label: r.label,
                }))}
                onChange={(v) => {
                  const hit = DAILY_INVOICE_RATIO_RANGES.find(
                    (r) => `${r.range[0]}-${r.range[1]}` === v,
                  );
                  setFilter(
                    "dailyInvoiceRatioRange",
                    hit ? hit.range : [0, 100],
                  );
                }}
                accent="#22c55e"
              />
              <Dropdown
                icon={Percent}
                label="نسبة المرتجعات"
                value={`${returnRateRange[0]}-${returnRateRange[1]}`}
                options={RETURN_RATE_RANGES.map((r) => ({
                  value: `${r.range[0]}-${r.range[1]}`,
                  label: r.label,
                }))}
                onChange={(v) => {
                  const hit = RETURN_RATE_RANGES.find(
                    (r) => `${r.range[0]}-${r.range[1]}` === v,
                  );
                  setFilter("returnRateRange", hit ? hit.range : [0, 100]);
                }}
                accent="var(--accent-red)"
              />
              <Dropdown
                icon={Percent}
                label="نسبة أداء الموظفين"
                value={`${employeePerformanceRatioRange[0]}-${employeePerformanceRatioRange[1]}`}
                options={EMPLOYEE_PERFORMANCE_RATIO_RANGES.map((r) => ({
                  value: `${r.range[0]}-${r.range[1]}`,
                  label: r.label,
                }))}
                onChange={(v) => {
                  const hit = EMPLOYEE_PERFORMANCE_RATIO_RANGES.find(
                    (r) => `${r.range[0]}-${r.range[1]}` === v,
                  );
                  setFilter(
                    "employeePerformanceRatioRange",
                    hit ? hit.range : [0, 100],
                  );
                }}
                accent="#a855f7"
              />
            </>
          ) : isBasketLikePage ? (
            <>
              <DateFilterDropdown
                activePeriod={activePeriod}
                setActivePeriod={setActivePeriod}
                dateFrom={dateFrom}
                dateTo={dateTo}
                setDateFrom={setDateFrom}
                setDateTo={setDateTo}
                quickPeriodOptions={[...QUICK_PERIODS]}
                rangeGranularity="month"
              />
              <MultiSelectDropdown
                icon={MapPin}
                label="الإقليم"
                selectedValues={activeRegions}
                options={REGIONS}
                onChange={setActiveRegions}
                accent="var(--accent-cyan)"
                manyLabel={(n) => `${n} أقاليم`}
              />
              <MultiSelectDropdown
                icon={MapPinned}
                label="المدينة"
                selectedValues={aiBasketCities}
                options={[...EMPLOYEES_CITIES]}
                onChange={(v) => setFilter("aiBasketCities", v)}
                accent="#38bdf8"
                manyLabel={(n) => `${n} مدن`}
              />
              <MultiSelectDropdown
                icon={Building2}
                label="الفرع"
                selectedValues={activeBranches}
                options={BRANCHES}
                onChange={setActiveBranches}
                accent="var(--accent-green)"
                manyLabel={(n) => `${n} فروع`}
              />
              <Dropdown
                icon={Clock}
                label="وقت البيع"
                value={aiBasketSaleTime}
                options={
                  AI_BASKET_SHIFTS as unknown as {
                    value: string;
                    label: string;
                  }[]
                }
                onChange={(v) =>
                  setFilter(
                    "aiBasketSaleTime",
                    (v === "morning" || v === "evening" ? v : "all") as
                      | "all"
                      | "morning"
                      | "evening",
                  )
                }
                accent="var(--accent-cyan)"
              />
              <Dropdown
                icon={Calendar}
                label="أيام العطل / المناسبات"
                value={aiBasketHoliday}
                options={AI_BASKET_HOLIDAY_OPTIONS}
                onChange={(v) => setFilter("aiBasketHoliday", v)}
                accent="var(--accent-amber)"
              />
              <Dropdown
                icon={Tag}
                label="العروض"
                value={aiBasketOffers}
                options={
                  AI_BASKET_OFFERS as unknown as {
                    value: string;
                    label: string;
                  }[]
                }
                onChange={(v) => setFilter("aiBasketOffers", v)}
                accent="#f472b6"
              />
              <MultiSelectDropdown
                icon={Layers}
                label="المجموعة الأولى"
                selectedValues={aiBasketG1}
                options={SALES_GROUP_1}
                onChange={setAiBasketG1}
                accent="var(--accent-amber)"
                manyLabel={(n) => `${n} مجموعات`}
              />
              <MultiSelectDropdown
                icon={Layers}
                label="المجموعة الثانية"
                selectedValues={aiBasketG2}
                options={SALES_GROUP_2}
                onChange={setAiBasketG2}
                accent="#f59e0b"
                manyLabel={(n) => `${n} مجموعات`}
              />
              <Dropdown
                icon={ShoppingCart}
                label="القيمة المادية للسلة"
                value={`${aiBasketValueRange[0]}-${aiBasketValueRange[1]}`}
                options={BASKET_VALUE_RANGES.map((r) => ({
                  value: `${r.range[0]}-${r.range[1]}`,
                  label: r.label,
                }))}
                onChange={(v) => {
                  const hit = BASKET_VALUE_RANGES.find(
                    (r) => `${r.range[0]}-${r.range[1]}` === v,
                  );
                  setFilter(
                    "aiBasketValueRange",
                    hit ? hit.range : [0, 100_000],
                  );
                }}
                accent="#14b8a6"
              />
            </>
          ) : isCustomersPage ? (
            <>
              <DateFilterDropdown
                activePeriod={activePeriod}
                setActivePeriod={setActivePeriod}
                dateFrom={dateFrom}
                dateTo={dateTo}
                setDateFrom={setDateFrom}
                setDateTo={setDateTo}
                quickPeriodOptions={[...QUICK_PERIODS]}
                rangeGranularity="month"
              />
              <MultiSelectDropdown
                icon={MapPin}
                label="الإقليم"
                selectedValues={activeRegions}
                options={REGIONS}
                onChange={setActiveRegions}
                accent="var(--accent-cyan)"
                manyLabel={(n) => `${n} أقاليم`}
              />
              <MultiSelectDropdown
                icon={MapPinned}
                label="المدينة"
                selectedValues={customersCities}
                options={[...EMPLOYEES_CITIES]}
                onChange={(v) => setFilter("customersCities", v)}
                accent="#38bdf8"
                manyLabel={(n) => `${n} مدن`}
              />
              <MultiSelectDropdown
                icon={Building2}
                label="الفرع"
                selectedValues={activeBranches}
                options={BRANCHES}
                onChange={setActiveBranches}
                accent="var(--accent-green)"
                manyLabel={(n) => `${n} فروع`}
              />
              <Dropdown
                icon={Clock}
                label="وقت البيع"
                value={customersSaleTime}
                options={
                  AI_BASKET_SHIFTS as unknown as {
                    value: string;
                    label: string;
                  }[]
                }
                onChange={(v) =>
                  setFilter(
                    "customersSaleTime",
                    (v === "morning" || v === "evening" ? v : "all") as
                      | "all"
                      | "morning"
                      | "evening",
                  )
                }
                accent="var(--accent-cyan)"
              />
              <Dropdown
                icon={Calendar}
                label="أيام العطل / المناسبات"
                value={holiday}
                options={
                  CUSTOMER_HOLIDAYS as unknown as {
                    value: string;
                    label: string;
                  }[]
                }
                onChange={(v) => setFilter("holiday", v)}
                accent="var(--accent-amber)"
              />
              <Dropdown
                icon={Tag}
                label="العروض"
                value={customersOffers}
                options={
                  AI_BASKET_OFFERS as unknown as {
                    value: string;
                    label: string;
                  }[]
                }
                onChange={(v) => setFilter("customersOffers", v)}
                accent="#f472b6"
              />
              <Dropdown
                icon={Store}
                label="طريقة البيع"
                value={customersSaleMethod}
                options={[
                  { value: "", label: "طريقة البيع" },
                  ...SALE_METHOD_OPTIONS.map((m) => ({
                    value: m,
                    label: m,
                  })),
                ]}
                onChange={(v) => setFilter("customersSaleMethod", v)}
                accent="#0ea5e9"
              />
              <Dropdown
                icon={ShoppingCart}
                label="القيمة المادية للسلة"
                value={`${customersBasketValueRange[0]}-${customersBasketValueRange[1]}`}
                options={BASKET_VALUE_RANGES.map((r) => ({
                  value: `${r.range[0]}-${r.range[1]}`,
                  label: r.label,
                }))}
                onChange={(v) => {
                  const hit = BASKET_VALUE_RANGES.find(
                    (r) => `${r.range[0]}-${r.range[1]}` === v,
                  );
                  setFilter(
                    "customersBasketValueRange",
                    hit ? hit.range : [0, 100_000],
                  );
                }}
                accent="#14b8a6"
              />
            </>
          ) : isProductsPage ? (
            <>
              <DateFilterDropdown
                activePeriod={activePeriod}
                setActivePeriod={setActivePeriod}
                dateFrom={dateFrom}
                dateTo={dateTo}
                setDateFrom={setDateFrom}
                setDateTo={setDateTo}
                quickPeriodOptions={QUICK_PERIODS}
                fillQuickPeriodDates={
                  isSalesPage ? getSalesQuickPeriodRange : undefined
                }
                rangeGranularity="month"
              />

              <MultiSelectDropdown
                icon={MapPin}
                label="الإقليم"
                selectedValues={activeRegions}
                options={REGIONS}
                onChange={setActiveRegions}
                accent="var(--accent-cyan)"
                manyLabel={(n) => `${n} أقاليم`}
              />

              <MultiSelectDropdown
                icon={Building2}
                label="الفرع"
                selectedValues={activeBranches}
                options={BRANCHES}
                onChange={setActiveBranches}
                accent="var(--accent-green)"
                manyLabel={(n) => `${n} فروع`}
              />

              <>
                <SearchDropdown
                  icon={Layers}
                  label="المجموعة الأولى"
                  value={prodG1}
                  options={PRODUCTS_GROUP_1}
                  onChange={setProdG1}
                  accent="var(--accent-amber)"
                />
                <SearchDropdown
                  icon={Layers}
                  label="المجموعة الثانية"
                  value={prodG2}
                  options={PRODUCTS_GROUP_2}
                  onChange={setProdG2}
                  accent="#f59e0b"
                />
                <SearchDropdown
                  icon={Layers}
                  label="المجموعة الثالثة"
                  value={prodG3}
                  options={PRODUCTS_GROUP_3}
                  onChange={setProdG3}
                  accent="#ea580c"
                />
                <SearchDropdown
                  icon={Package}
                  label="المنتجات"
                  value={prodName}
                  options={PRODUCTS}
                  onChange={setProdName}
                  accent="#00d4ff"
                />
              </>
            </>
          ) : (
            <>
              <DateFilterDropdown
                activePeriod={activePeriod}
                setActivePeriod={setActivePeriod}
                dateFrom={dateFrom}
                dateTo={dateTo}
                setDateFrom={setDateFrom}
                setDateTo={setDateTo}
                quickPeriodOptions={QUICK_PERIODS}
                fillQuickPeriodDates={
                  isSalesPage ? getSalesQuickPeriodRange : undefined
                }
                rangeGranularity="month"
              />

              <MultiSelectDropdown
                icon={MapPin}
                label="الإقليم"
                selectedValues={activeRegions}
                options={REGIONS}
                onChange={setActiveRegions}
                accent="var(--accent-cyan)"
                manyLabel={(n) => `${n} أقاليم`}
              />

              <MultiSelectDropdown
                icon={Building2}
                label="الفرع"
                selectedValues={activeBranches}
                options={BRANCHES}
                onChange={setActiveBranches}
                accent="var(--accent-green)"
                manyLabel={(n) => `${n} فروع`}
              />

              {isSalesPage && (
                <>
                  <MultiSelectDropdown
                    icon={Layers}
                    label="المجموعة الأولى"
                    selectedValues={salesG1}
                    options={SALES_GROUP_1}
                    onChange={setSalesG1}
                    accent="var(--accent-amber)"
                    manyLabel={(n) => `${n} مجموعات`}
                  />
                  <MultiSelectDropdown
                    icon={Layers}
                    label="المجموعة الثانية"
                    selectedValues={salesG2}
                    options={SALES_GROUP_2}
                    onChange={setSalesG2}
                    accent="#f59e0b"
                    manyLabel={(n) => `${n} مجموعات`}
                  />
                  <MultiSelectDropdown
                    icon={Layers}
                    label="المجموعة الثالثة"
                    selectedValues={salesG3}
                    options={SALES_GROUP_3}
                    onChange={setSalesG3}
                    accent="#ea580c"
                    manyLabel={(n) => `${n} مجموعات`}
                  />
                  <MultiSelectDropdown
                    icon={Building2}
                    label="الشركة"
                    selectedValues={salesCompany}
                    options={SALES_COMPANIES}
                    onChange={setSalesCompany}
                    accent="#6366f1"
                    manyLabel={(n) => `${n} شركات`}
                  />
                  <MultiSelectDropdown
                    icon={Package}
                    label="كل المنتجات"
                    selectedValues={salesProduct}
                    options={SALES_INSTANT_PRODUCTS}
                    onChange={setSalesProduct}
                    accent="#00d4ff"
                    manyLabel={(n) => `${n} منتجات`}
                  />
                </>
              )}
            </>
          )}

          {showReportsRow && isEmployeesPage && (
            <>
              <div
                style={{
                  width: 1,
                  height: 20,
                  background: "#000",
                  marginInline: 4,
                }}
              />

              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: "#000",
                  letterSpacing: ".5px",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                }}
              >
                📊 غير لحظي
              </span>

              <Dropdown
                icon={CreditCard}
                label="نوع الدفع"
                value={paymentType}
                options={[
                  { value: "", label: "نوع الدفع" },
                  ...PAYMENT_TYPES.map((p) => ({ value: p, label: p })),
                ]}
                onChange={setPaymentType}
                accent="#a855f7"
              />
              <Dropdown
                icon={Store}
                label="طريقة البيع"
                value={saleMethod}
                options={[
                  { value: "", label: "طريقة البيع" },
                  ...SALE_METHOD_OPTIONS.map((m) => ({
                    value: m,
                    label: m,
                  })),
                ]}
                onChange={setSaleMethod}
                accent="#0ea5e9"
              />
            </>
          )}

          {showReportsRow && isBasketLikePage && (
            <>
              <div
                style={{
                  width: 1,
                  height: 20,
                  background: "#000",
                  marginInline: 4,
                }}
              />

              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: "#000",
                  letterSpacing: ".5px",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                }}
              >
                📊 غير لحظي
              </span>

              <MultiSelectDropdown
                icon={Layers}
                label="المجموعة الثالثة"
                selectedValues={aiBasketReportG3}
                options={SALES_GROUP_3}
                onChange={setAiBasketReportG3}
                accent="#ea580c"
                manyLabel={(n) => `${n} مجموعات`}
              />
              <SearchDropdown
                icon={Package}
                label="المنتج"
                value={product}
                options={PRODUCTS}
                onChange={setProduct}
                accent="#00d4ff"
              />
              <Dropdown
                icon={CreditCard}
                label="نوع الدفع"
                value={paymentType}
                options={[
                  { value: "", label: "نوع الدفع" },
                  ...PAYMENT_TYPES.map((p) => ({ value: p, label: p })),
                ]}
                onChange={setPaymentType}
                accent="#a855f7"
              />
              <Dropdown
                icon={Store}
                label="طريقة البيع"
                value={saleMethod}
                options={[
                  { value: "", label: "طريقة البيع" },
                  ...SALE_METHOD_OPTIONS.map((m) => ({
                    value: m,
                    label: m,
                  })),
                ]}
                onChange={setSaleMethod}
                accent="#0ea5e9"
              />
            </>
          )}

          {!isEmployeesPage && !isBasketLikePage && (
            <>
              {isSalesPage
                ? showReportsRow && (
                    <>
                      {/* Divider */}
                      <div
                        style={{
                          width: 1,
                          height: 20,
                          background: "#000",
                          marginInline: 4,
                        }}
                      />

                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: "#000",
                          letterSpacing: ".5px",
                          whiteSpace: "nowrap",
                          textTransform: "uppercase",
                        }}
                      >
                        📊 غير لحظي
                      </span>

                      <Dropdown
                        icon={CreditCard}
                        label="نوع الدفع"
                        value={paymentType}
                        options={[
                          { value: "", label: "نوع الدفع" },
                          ...PAYMENT_TYPES.map((p) => ({ value: p, label: p })),
                        ]}
                        onChange={setPaymentType}
                        accent="#a855f7"
                      />
                      <Dropdown
                        icon={Store}
                        label="طريقة البيع"
                        value={saleMethod}
                        options={[
                          { value: "", label: "طريقة البيع" },
                          ...SALE_METHOD_OPTIONS.map((m) => ({
                            value: m,
                            label: m,
                          })),
                        ]}
                        onChange={setSaleMethod}
                        accent="#0ea5e9"
                      />
                      <MultiSelectDropdown
                        icon={Handshake}
                        label="الاتفاقية"
                        selectedValues={agreement}
                        options={SALES_AGREEMENTS}
                        onChange={(v) => setFilter("agreement", v)}
                        accent="#c084fc"
                        manyLabel={(n) => `${n} اتفاقيات`}
                      />
                    </>
                  )
                : showReportsRow && (
                    <>
                      {/* Divider */}
                      <div
                        style={{
                          width: 1,
                          height: 20,
                          background: "#000",
                          marginInline: 4,
                        }}
                      />

                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: "#000",
                          letterSpacing: ".5px",
                          whiteSpace: "nowrap",
                          textTransform: "uppercase",
                        }}
                      >
                        📊 غير لحظي
                      </span>

                      {isBranchesPage ? (
                        <>
                          <Dropdown
                            icon={Clock}
                            label="وقت البيع"
                            value={branchSaleTime}
                            options={
                              AI_BASKET_SHIFTS as unknown as {
                                value: string;
                                label: string;
                              }[]
                            }
                            onChange={(v) =>
                              setFilter(
                                "branchSaleTime",
                                (v === "morning" || v === "evening"
                                  ? v
                                  : "all") as "all" | "morning" | "evening",
                              )
                            }
                            accent="var(--accent-cyan)"
                          />
                          <Dropdown
                            icon={Calendar}
                            label="أيام العطل / المناسبات"
                            value={branchHoliday}
                            options={BRANCH_HOLIDAY_OPTIONS}
                            onChange={(v) => setFilter("branchHoliday", v)}
                            accent="var(--accent-amber)"
                          />
                          <Dropdown
                            icon={Tag}
                            label="العروض"
                            value={branchOffers}
                            options={
                              AI_BASKET_OFFERS as unknown as {
                                value: string;
                                label: string;
                              }[]
                            }
                            onChange={(v) => setFilter("branchOffers", v)}
                            accent="#f472b6"
                          />
                          <Dropdown
                            icon={CreditCard}
                            label="نوع الدفع"
                            value={paymentType}
                            options={[
                              { value: "", label: "نوع الدفع" },
                              ...PAYMENT_TYPES.map((p) => ({
                                value: p,
                                label: p,
                              })),
                            ]}
                            onChange={setPaymentType}
                            accent="#a855f7"
                          />
                          <Dropdown
                            icon={Store}
                            label="طريقة البيع"
                            value={saleMethod}
                            options={[
                              { value: "", label: "طريقة البيع" },
                              ...SALE_METHOD_OPTIONS.map((m) => ({
                                value: m,
                                label: m,
                              })),
                            ]}
                            onChange={setSaleMethod}
                            accent="#0ea5e9"
                          />
                        </>
                      ) : (
                        <>
                          {isCustomersPage ? (
                            <>
                              <MultiSelectDropdown
                                icon={Layers}
                                label="المجموعة الأولى"
                                selectedValues={customersG1}
                                options={SALES_GROUP_1}
                                onChange={setCustomersG1}
                                accent="var(--accent-amber)"
                                manyLabel={(n) => `${n} مجموعات`}
                              />
                              <MultiSelectDropdown
                                icon={Layers}
                                label="المجموعة الثانية"
                                selectedValues={customersG2}
                                options={SALES_GROUP_2}
                                onChange={setCustomersG2}
                                accent="#f59e0b"
                                manyLabel={(n) => `${n} مجموعات`}
                              />
                              <MultiSelectDropdown
                                icon={Layers}
                                label="المجموعة الثالثة"
                                selectedValues={customersG3}
                                options={SALES_GROUP_3}
                                onChange={setCustomersG3}
                                accent="#ea580c"
                                manyLabel={(n) => `${n} مجموعات`}
                              />
                              <SearchDropdown
                                icon={Search}
                                label="المنتج"
                                value={customersProduct}
                                options={PRODUCTS}
                                onChange={setCustomersProduct}
                                accent="#00d4ff"
                              />
                            </>
                          ) : (
                            <>
                              <SearchDropdown
                                icon={Truck}
                                label="الموزع"
                                value={distributor}
                                options={DISTRIBUTORS}
                                onChange={setDistributor}
                                accent="#f59e0b"
                              />
                              <SearchDropdown
                                icon={Package}
                                label="الفئة"
                                value={category}
                                options={CATEGORIES}
                                onChange={setCategory}
                                accent="#3b82f6"
                              />
                              <SearchDropdown
                                icon={Search}
                                label="المنتج"
                                value={product}
                                options={PRODUCTS}
                                onChange={setProduct}
                                accent="#00d4ff"
                              />
                            </>
                          )}

                          {!isCustomersPage && (
                            <Dropdown
                              icon={Percent}
                              label="الخصم"
                              value={discount}
                              options={[
                                { value: "", label: "الخصم" },
                                ...DISCOUNTS.map((d) => ({
                                  value: d,
                                  label: d,
                                })),
                              ]}
                              onChange={setDiscount}
                              accent="#ef4444"
                            />
                          )}

                          {!isCustomersPage && (
                            <Dropdown
                              icon={CreditCard}
                              label="نوع الدفع"
                              value={paymentType}
                              options={[
                                { value: "", label: "نوع الدفع" },
                                ...PAYMENT_TYPES.map((p) => ({
                                  value: p,
                                  label: p,
                                })),
                              ]}
                              onChange={setPaymentType}
                              accent="#a855f7"
                            />
                          )}
                        </>
                      )}
                    </>
                  )}
            </>
          )}
        </>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* زر إنشاء التقرير */}
        <AnimatePresence>
          {hasReportFilter && showReportsRow && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={handleCreateReport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
              style={{
                background: "var(--btn-primary-bg)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                boxShadow: "var(--btn-primary-shadow)",
                whiteSpace: "nowrap",
              }}
            >
              <FileBarChart2 size={13} />
              إنشاء التقرير
            </motion.button>
          )}
        </AnimatePresence>

        {/* زر إعادة التعيين */}
        {(isAnyInstantChanged || hasReportFilter) && (
          <button
            onClick={resetAll}
            style={{
              padding: "4px 8px",
              borderRadius: 7,
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
              fontSize: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap",
            }}
          >
            <RotateCcw size={10} /> إعادة
          </button>
        )}
      </div>

      {/* ديالوج التسمية */}
      <AnimatePresence>
        {showNameDialog && (
          <ReportNameDialog
            onConfirm={handleConfirmName}
            onCancel={() => setShowNameDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* البوب اب جاري الإنشاء */}
      <AnimatePresence>
        {showPopup && (
          <ReportCreatingPopup
            name={reportName}
            onClose={() => setShowPopup(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
