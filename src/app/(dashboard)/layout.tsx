"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import GlobalFilterBar from "@/components/ui/GlobalFilterBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mode = useThemeStore((s) => s.mode);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  // useEffect(() => {
  //     if (!isAuthenticated) {
  //         router.replace('/login');
  //     }
  // }, [isAuthenticated, router]);

  // if (!isAuthenticated) {
  //     return (
  //         <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
  //             <div className="w-10 h-10 border-2 rounded-full animate-spin"
  //                 style={{ borderColor: 'var(--accent-green)', borderTopColor: 'transparent' }} />
  //         </div>
  //     );
  // }

  return (
    <div
      id="dashboard-scroll-root"
      className="h-screen overflow-y-auto"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="flex min-h-screen flex-row"
        style={{ background: "var(--bg-primary)" }}
        dir="rtl"
      >
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <Header />
          <main className="flex-1 content-transition min-h-0">
            {/* شريط الفلاتر — ثابت (sticky) تحت الهيدر في كل الصفحات */}
            <div
              className="sticky z-20"
              style={{
                top: 64,
                padding: "8px 24px 0",
                background: "var(--bg-primary)",
              }}
            >
              <GlobalFilterBar />
            </div>
            <div className="p-6 pt-2">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
