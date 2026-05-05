"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebarStore } from "@/store/sidebarStore";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import {
  TrendingUp,
  Building2,
  Settings2,
  Users,
  UserCircle,
  Package,
  Percent,
  FileText,
  Receipt,
  CreditCard,
  Brain,
  ShoppingBasket,
  Clock,
  FileBarChart,
  Palette,
  ChevronRight,
  ChevronLeft,
  Search,
  Bell,
  Lock,
  Sun,
  Moon,
  Tag,
} from "lucide-react";
import logo from "@/assets/logo.jpeg";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  isAI?: boolean;
  dividerBefore?: boolean;
  subItems?: { id: string; label: string; href: string }[];
}

const navItems: NavItem[] = [
  // {
  //   id: "dashboard",
  //   label: "لوحة القيادة",
  //   icon: LayoutDashboard,
  //   href: "/dashboard",
  // },
  { id: "sales", label: "تحليل المبيعات", icon: TrendingUp, href: "/sales" },
  { id: "branches", label: "أداء الفروع", icon: Building2, href: "/branches" },
  { id: "operations", label: "السلة", icon: Settings2, href: "/operations" },
  { id: "employees", label: "الموظفين", icon: Users, href: "/employees" },
  { id: "customers", label: "العملاء", icon: UserCircle, href: "/customers" },
  { id: "products", label: "المنتجات", icon: Package, href: "/products" },
  { id: "discounts", label: "الخصومات", icon: Percent, href: "/discounts" },
  { id: "offers", label: "العروض", icon: Tag, href: "/offers" },
  {
    id: "agreements",
    label: "الاتفاقيات",
    icon: FileText,
    href: "/agreements",
  },
  {
    id: "sales-method",
    label: "طريقة البيع",
    icon: CreditCard,
    href: "/sales-method",
  },
  {
    id: "transactions",
    label: "المعاملات",
    icon: Receipt,
    href: "/transactions",
  },
  {
    id: "ai-forecast",
    label: "التنبؤ الذكي",
    icon: Brain,
    href: "/ai-forecast",
    isAI: true,
    dividerBefore: true,
  },
  {
    id: "ai-basket",
    label: "السلة الذكية",
    icon: ShoppingBasket,
    href: "/ai-basket",
    isAI: true,
    subItems: [
      { id: "ai-basket-main", label: "نظرة عامة", href: "/ai-basket" },
      {
        id: "ai-basket-products",
        label: "شبكة ارتباط المنتجات",
        href: "/ai-basket/products",
      },
      {
        id: "ai-basket-analysis",
        label: "شبكة تحليل السلة",
        href: "/ai-basket/analysis",
      },
    ],
  },
  {
    id: "time-compare",
    label: "المقارنة الزمنية",
    icon: Clock,
    href: "/time-compare",
  },
  {
    id: "reports",
    label: "مركز التقارير",
    icon: FileBarChart,
    href: "/reports",
    dividerBefore: true,
  },
  {
    id: "chart-colors",
    label: "ألوان الرسوم",
    icon: Palette,
    href: "/chart-colors",
  },
];

const LG_BREAKPOINT = 1024;

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleSidebar, setMobileOpen } =
    useSidebarStore();
  const { mode, toggleMode } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const [isSmallViewport, setIsSmallViewport] = useState(false);
  const [time, setTime] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`);
    const handler = () => setIsSmallViewport(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isSmallViewport) return;
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("ar-JO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [isSmallViewport]);

  const isOverlay = isSmallViewport;
  const isShown = isSmallViewport ? isMobileOpen : true;
  const width = isSmallViewport ? 260 : isCollapsed ? 72 : 260;

  return (
    <AnimatePresence>
      {isShown && (
        <>
          {isOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
          )}
          <motion.aside
            initial={isOverlay ? { x: "100%" } : undefined}
            animate={isOverlay ? { x: 0 } : undefined}
            exit={isOverlay ? { x: "100%" } : undefined}
            transition={
              isOverlay
                ? { type: "spring", damping: 28, stiffness: 300 }
                : undefined
            }
            className={`flex flex-col z-50 sidebar-transition overflow-hidden ${
              isOverlay
                ? "fixed top-0 right-0 h-screen lg:hidden"
                : "sticky top-0 h-screen shrink-0"
            }`}
            style={{
              width,
              background: "var(--sidebar-bg)",
              borderLeft: "1px solid var(--sidebar-border)",
              boxShadow: isOverlay ? "-6px 0 24px rgba(0,0,0,0.18)" : undefined,
            }}
          >
            {/* شعار */}
            <div
              className="flex items-center gap-3 px-4 h-16 border-b"
              style={{ borderColor: "var(--sidebar-border)" }}
            >
              <div
                className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-white"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                title="المؤسسة الاستهلاكية العسكرية"
              >
                <Image
                  src={logo}
                  alt="شعار المؤسسة الاستهلاكية العسكرية"
                  width={40}
                  height={40}
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <p
                      className="text-xs font-bold tracking-wider"
                      style={{ color: "var(--sidebar-logo-text)" }}
                    >
                      المؤسسة الاستهلاكية العسكرية
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: "var(--sidebar-logo-sub)" }}
                    >
                      منصة البيانات
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isSmallViewport && (
              <div
                className="px-4 py-3 border-b space-y-3"
                style={{ borderColor: "var(--sidebar-border)" }}
              >
                {/* Profile */}
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <div
                      className="relative w-9 h-9 rounded-full overflow-hidden shrink-0"
                      style={{ border: "1px solid var(--sidebar-border)" }}
                    >
                      <Image
                        src={user.avatar}
                        alt={user.nameAr || user.name}
                        fill
                        sizes="36px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: "var(--accent-green)" }}
                    >
                      {user?.role === "admin" ? "م" : "ض"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user?.nameAr || "مسؤول النظام"}
                    </p>
                    <p
                      className="text-[10px] truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {user?.department || "مدير النظام"}
                    </p>
                  </div>
                </div>

                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: "var(--header-search-bg)",
                    border: "1px solid var(--header-search-border)",
                  }}
                >
                  <Search
                    size={16}
                    style={{ color: "var(--header-search-text)" }}
                  />
                  <input
                    type="text"
                    placeholder="البحث في الوحدات والتقارير..."
                    className="bg-transparent border-none outline-none text-sm flex-1 min-w-0"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>

                {/* Time / Secure / Notifications */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Clock size={14} />
                    <span
                      className="text-sm font-medium tabular-nums"
                      dir="ltr"
                    >
                      {time}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{
                      background: "var(--header-badge-bg)",
                      border: "1px solid transparent",
                    }}
                  >
                    <Lock
                      size={13}
                      style={{ color: "var(--header-badge-text)" }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--header-badge-text)" }}
                    >
                      آمن
                    </span>
                  </div>
                  <button
                    className="relative p-2 rounded-lg transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    type="button"
                  >
                    <Bell size={18} />
                    <span
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ background: "#ef4444" }}
                    >
                      3
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* التنقل */}
            <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/sales" && pathname.startsWith(item.href));
                const Icon = item.icon;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedItems.includes(item.id) || isActive;

                return (
                  <React.Fragment key={item.id}>
                    {item.dividerBefore && (
                      <div
                        className="mx-4 my-2 h-px"
                        style={{ background: "var(--sidebar-divider)" }}
                      />
                    )}
                    <div className="flex flex-col">
                      <Link
                        href={hasSubItems ? "#" : item.href}
                        onClick={(e) => {
                          if (hasSubItems) {
                            e.preventDefault();
                            toggleExpand(item.id);
                          } else if (isSmallViewport) {
                            setMobileOpen(false);
                          }
                        }}
                      >
                        <div
                          className="relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group"
                          style={{
                            background:
                              isActive && !hasSubItems
                                ? "var(--sidebar-active-bg)"
                                : "transparent",
                            color:
                              isActive && !hasSubItems
                                ? "var(--sidebar-text-active)"
                                : item.isAI
                                  ? "var(--sidebar-ai-text)"
                                  : "var(--sidebar-text)",
                          }}
                          title={isCollapsed ? item.label : undefined}
                        >
                          {isActive && !hasSubItems && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute right-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-l-full"
                              style={{
                                background: "var(--sidebar-active-bar)",
                              }}
                            />
                          )}

                          <Icon
                            size={20}
                            className="shrink-0 transition-colors"
                          />

                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-[13px] font-medium whitespace-nowrap overflow-hidden flex-1"
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>

                          {!isCollapsed && hasSubItems && (
                            <ChevronLeft
                              size={14}
                              className={`transition-transform duration-200 ${
                                isExpanded ? "-rotate-90" : ""
                              }`}
                              style={{ color: "var(--text-muted)" }}
                            />
                          )}

                          {item.isAI && !isCollapsed && !hasSubItems && (
                            <span
                              className="mr-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                              style={{
                                background: "var(--sidebar-ai-bg)",
                                color: "var(--sidebar-ai-text)",
                                border: "1px solid var(--sidebar-ai-border)",
                              }}
                            >
                              AI
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Sub Items */}
                      <AnimatePresence>
                        {hasSubItems && isExpanded && !isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col gap-1 mt-1 mb-2"
                          >
                            {item.subItems?.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              // Note: window.location might not be available during SSR, but this is a client component.
                              // Actually, in Next.js it's better to use useSearchParams for robustness.

                              return (
                                <Link key={sub.id} href={sub.href}>
                                  <div
                                    onClick={() => {
                                      if (isSmallViewport) setMobileOpen(false);
                                    }}
                                    className="flex items-center gap-3 mx-2 mr-9 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200"
                                    style={{
                                      background: isSubActive
                                        ? "var(--sidebar-active-bg)"
                                        : "transparent",
                                      color: isSubActive
                                        ? "var(--sidebar-text-active)"
                                        : "var(--sidebar-text)",
                                      opacity: isSubActive ? 1 : 0.8,
                                    }}
                                  >
                                    <span className="text-[12px] font-medium whitespace-nowrap">
                                      {sub.label}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </React.Fragment>
                );
              })}
            </nav>

            {/* التحكم */}
            <div
              className="border-t"
              style={{ borderColor: "var(--sidebar-toggle-border)" }}
            >
              {/* زر تبديل الثيم */}
              <button
                onClick={toggleMode}
                className="flex items-center justify-center gap-2 w-full py-3 transition-colors"
                style={{ color: "var(--sidebar-toggle-text)" }}
                title={mode === "dark" ? "الوضع الفاتح" : "الوضع المظلم"}
              >
                {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs"
                    >
                      {mode === "dark" ? "الوضع الفاتح" : "الوضع المظلم"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* زر طي الشريط */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center h-11 w-full border-t transition-colors"
                style={{
                  borderColor: "var(--sidebar-toggle-border)",
                  color: "var(--sidebar-toggle-text)",
                }}
              >
                {isCollapsed ? (
                  <ChevronLeft size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
