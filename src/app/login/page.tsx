"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, User, ArrowLeft, AlertCircle } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  const router = useRouter();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("جميع الحقول مطلوبة");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const success = await login(username, password);
      if (success) {
        router.push("/sales");
      }
    } catch {
      setError("فشل التحقق من الهوية. تواصل مع مسؤول النظام.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: isDark ? "#0a0e17" : "#f1f5f9" }}
    >
      <div className="absolute inset-0 animated-grid opacity-30" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(4,120,87,0.05) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-20"
        style={{
          borderTop: "2px solid #047857",
          borderRight: "2px solid #047857",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 opacity-20"
        style={{
          borderBottom: "2px solid #047857",
          borderLeft: "2px solid #047857",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="h-0.5 rounded-t-xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, #047857, transparent)",
          }}
        />
        <div
          className="p-8 rounded-b-xl"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(26,32,53,0.95) 0%, rgba(17,24,39,0.98) 100%)"
              : "#ffffff",
            border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderTop: "none",
            backdropFilter: "blur(40px)",
            boxShadow:
              "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 60px rgba(4,120,87,0.03)",
          }}
        >
          {/* الشعار */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="relative mb-4 flex items-center justify-center rounded-full overflow-hidden shrink-0"
              style={{
                width: 96,
                height: 96,
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(4,120,87,0.15)",
              }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Image
                src={logo}
                alt="شعار المؤسسة الاستهلاكية العسكرية"
                width={96}
                height={96}
                className="object-contain bg-white"
                priority
              />
            </motion.div>
            <h1
              className="text-lg font-bold tracking-wide text-center"
              style={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
            >
              المؤسسة الاستهلاكية العسكرية
            </h1>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              منصة البيانات — المملكة الأردنية الهاشمية
            </p>
          </div>

          {/* النموذج */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444",
                }}
              >
                <AlertCircle size={14} />
                <span className="text-xs">{error}</span>
              </motion.div>
            )}

            <div>
              <label
                className="text-[11px] font-medium block mb-2"
                style={{ color: "#64748b" }}
              >
                رقم الضابط
              </label>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus-within:border-[#047857]"
                style={{
                  background: isDark ? "#0f1729" : "#f8fafc",
                  border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
                }}
              >
                <User size={16} style={{ color: "#475569" }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل رقم الضابط"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
                />
              </div>
            </div>

            <div>
              <label
                className="text-[11px] font-medium block mb-2"
                style={{ color: "#64748b" }}
              >
                رمز الدخول
              </label>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus-within:border-[#047857]"
                style={{
                  background: isDark ? "#0f1729" : "#f8fafc",
                  border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
                }}
              >
                <Lock size={16} style={{ color: "#475569" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل رمز الدخول"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-bold tracking-wide transition-all mt-6"
              style={{
                background: isLoading
                  ? "rgba(4,120,87,0.3)"
                  : "linear-gradient(135deg, #047857 0%, #065f46 100%)",
                color: "#ffffff",
                boxShadow: isLoading ? "none" : "0 0 20px rgba(4,120,87,0.2)",
              }}
            >
              {isLoading ? (
                <div
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{ borderColor: "#fff", borderTopColor: "transparent" }}
                />
              ) : (
                <>
                  تسجيل الدخول <ArrowLeft size={16} />
                </>
              )}
            </button>
          </form>

          <div
            className="mt-6 pt-4 border-t text-center"
            style={{ borderColor: isDark ? "#1e293b" : "#e2e8f0" }}
          >
            <p className="text-[10px]" style={{ color: "#334155" }}>
              🔒 اتصال مشفّر • AES-256
            </p>
            <p className="text-[10px] mt-1" style={{ color: "#334155" }}>
              للأفراد المصرّح لهم فقط • الجلسة مراقبة
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
