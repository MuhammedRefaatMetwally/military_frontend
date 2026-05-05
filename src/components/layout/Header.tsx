"use client";

// import React, { useState, useEffect } from "react";
import { Lock, ChevronDown, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";
// import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const user = useAuthStore((s) => s.user);
  // const [time, setTime] = useState("");
  const { isMobileOpen, toggleMobile } = useSidebarStore();

  // useEffect(() => {
  //   const update = () =>
  //     setTime(
  //       new Date().toLocaleTimeString("ar-JO", {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       }),
  //     );
  //   update();
  //   const id = setInterval(update, 60000);
  //   return () => clearInterval(id);
  // }, []);

  return (
    <>
      <header
        className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 backdrop-blur-lg border-b shrink-0"
        style={{
          background: "var(--header-bg)",
          borderColor: "var(--header-border)",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* يسار: بحث — مخفي على الشاشات الصغيرة */}
        {/* <div className="hidden lg:flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: 'var(--header-search-bg)', border: '1px solid var(--header-search-border)' }}>
                        <Search size={16} style={{ color: 'var(--header-search-text)' }} />
                        <input
                            type="text"
                            placeholder="البحث في الوحدات والتقارير..."
                            className="bg-transparent border-none outline-none text-sm w-64"
                            style={{ color: 'var(--text-primary)' }}
                        />
                    </div>
                </div> */}

        {/* يمين: المستخدم ثم زر القائمة على الشاشات الصغيرة */}
        <div className="flex items-center gap-3 w-full justify-between">
          {/* زر القائمة — أقصى اليمين في RTL — يظهر عندما الشريط collapsable (<lg) */}
          <button
            type="button"
            onClick={toggleMobile}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label={
              isMobileOpen ? "إغلاق الشريط الجانبي" : "فتح الشريط الجانبي"
            }
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* معلومات المستخدم — دائماً أولاً (يظهر أقصى اليمين في RTL) */}
          <div className="hidden lg:flex items-center gap-2.5 cursor-pointer group shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: "var(--accent-green)" }}
            >
              {user?.role === "admin" ? "م" : "ض"}
            </div>
            <div className="leading-tight">
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--header-text)" }}
              >
                مسؤول النظام
              </p>
              <p
                className="text-[10px]"
                style={{ color: "var(--header-text-sub)" }}
              >
                مدير النظام
              </p>
            </div>
            <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
          </div>

          {/* على الشاشات الكبيرة: الوقت + الأمان + الإشعارات بجانب المستخدم */}
          <div className="hidden lg:flex items-center gap-4">
            {/* <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={14} />
                            <span className="text-sm font-medium tabular-nums" dir="ltr">{time}</span>
                        </div> */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{
                background: "var(--header-badge-bg)",
                border: "1px solid transparent",
              }}
            >
              <Lock size={13} style={{ color: "var(--header-badge-text)" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--header-badge-text)" }}
              >
                آمن
              </span>
            </div>
            {/* 
							<button className="relative p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
								<Bell size={18} />
								<span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: '#ef4444' }}>
										3
								</span>
						</button> 
						*/}
          </div>
        </div>
      </header>

      {/* على الشاشات الصغيرة: زر القائمة يتحكم بالشريط الجانبي */}
    </>
  );
}
