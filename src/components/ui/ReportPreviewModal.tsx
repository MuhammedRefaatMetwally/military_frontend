"use client";

import "@/lib/echarts/register-bar-line-pie";
import dynamic from "next/dynamic";
import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  FileBarChart,
  TrendingUp,
  Users,
  Package,
  Percent,
  BarChart3,
  Brain,
  ShoppingCart,
  Clock,
} from "lucide-react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 280 }}>Loading chart...</div>,
  },
);

interface ReportPreviewModalProps {
  type: string | null;
  reportName: string;
  filters: Record<string, string>;
  onClose: () => void;
}

// ── shared colours ──────────────────────────────────────────────────────────
const G = "#00e5a0";
const C = "#00d4ff";
const A = "#f59e0b";
const R = "#ef4444";
const P = "#a855f7";
const B = "#3b82f6";
const months = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
const branches = ["عمّان", "4إربد", "الزرقاء", "العقبة", "الكرك"];

const tt = {
  backgroundColor: "#1a2035",
  borderColor: "#1e293b",
  textStyle: { color: "#e2e8f0", fontSize: 10 },
};
const grid = (extra?: Record<string, string>) => ({
  left: "3%",
  right: "3%",
  bottom: "12%",
  top: "12%",
  containLabel: true,
  ...extra,
});
const axX = (data: string[]) => ({
  type: "category" as const,
  data,
  axisLabel: { fontSize: 9, color: "#64748b" },
  axisLine: { lineStyle: { color: "#334155" } },
});
const axY = (fmt?: (v: number) => string) => ({
  type: "value" as const,
  axisLabel: {
    formatter: fmt || ((v: number) => `${(v / 1000).toFixed(0)}K`),
    fontSize: 9,
    color: "#64748b",
  },
  splitLine: { lineStyle: { color: "#1e293b" } },
});

// ── per-type config ──────────────────────────────────────────────────────────
function getReportConfig(type: string): {
  icon: React.ElementType;
  color: string;
  kpis: { label: string; value: string; color: string }[];
  charts: {
    title: string;
    subtitle?: string;
    option: Record<string, unknown>;
    height?: string;
  }[];
} {
  switch (type) {
    // 1 ── أداء المبيعات ───────────────────────────────────────────────
    case "sales":
      return {
        icon: TrendingUp,
        color: G,
        kpis: [
          { label: "صافي المبيعات", value: "4.25M", color: G },
          { label: "قيمة الربح", value: "1.56M", color: C },
          { label: "إجمالي الطلبات", value: "140,600", color: A },
          { label: "معدل النمو", value: "+11.4%", color: G },
        ],
        charts: [
          {
            title: "المبيعات الشهرية",
            subtitle: "صافي المبيعات + الربح",
            height: "250px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              legend: {
                data: ["المبيعات", "الربح"],
                top: 0,
                textStyle: { color: "#64748b", fontSize: 9 },
              },
              grid: grid(),
              xAxis: axX(months),
              yAxis: axY(),
              series: [
                {
                  name: "المبيعات",
                  type: "bar",
                  barMaxWidth: 28,
                  data: [
                    310, 280, 420, 390, 450, 370, 290, 520, 440, 380, 560, 620,
                  ].map((v) => ({
                    value: v * 1000,
                    itemStyle: { color: G, borderRadius: [4, 4, 0, 0] },
                  })),
                },
                {
                  name: "الربح",
                  type: "line",
                  data: [
                    110, 100, 155, 145, 170, 135, 105, 195, 165, 140, 210, 235,
                  ].map((v) => v * 1000),
                  lineStyle: { color: C, width: 2 },
                  itemStyle: { color: C },
                  smooth: true,
                },
              ],
            },
          },
          {
            title: "توزيع المبيعات حسب الفرع",
            subtitle: "نسبة المساهمة",
            height: "250px",
            option: {
              tooltip: { ...tt, trigger: "item" as const },
              series: [
                {
                  type: "pie",
                  radius: ["38%", "68%"],
                  data: [
                    { name: "عمّان", value: 1850000, itemStyle: { color: G } },
                    { name: "إربد", value: 920000, itemStyle: { color: C } },
                    { name: "الزرقاء", value: 740000, itemStyle: { color: A } },
                    { name: "العقبة", value: 480000, itemStyle: { color: P } },
                    { name: "الكرك", value: 260000, itemStyle: { color: R } },
                  ],
                  label: { color: "#94a3b8", fontSize: 10 },
                  labelLine: { lineStyle: { color: "#334155" } },
                },
              ],
            },
          },
          {
            title: "نمو المبيعات — مقارنة سنوية",
            subtitle: "2024 vs 2025",
            height: "230px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              legend: {
                data: ["2024", "2025"],
                top: 0,
                textStyle: { color: "#64748b", fontSize: 9 },
              },
              grid: grid(),
              xAxis: axX(["ر1", "ر2", "ر3", "ر4"]),
              yAxis: axY(),
              series: [
                {
                  name: "2024",
                  type: "bar",
                  barGap: "10%",
                  barMaxWidth: 32,
                  data: [820, 940, 870, 1100].map((v) => ({
                    value: v * 1000,
                    itemStyle: {
                      color: "rgba(0,229,160,0.3)",
                      borderRadius: [4, 4, 0, 0],
                    },
                  })),
                },
                {
                  name: "2025",
                  type: "bar",
                  barMaxWidth: 32,
                  data: [950, 1080, 1020, 1240].map((v) => ({
                    value: v * 1000,
                    itemStyle: { color: G, borderRadius: [4, 4, 0, 0] },
                  })),
                },
              ],
            },
          },
          {
            title: "طريقة الدفع",
            subtitle: "توزيع حسب نوع الدفع",
            height: "230px",
            option: {
              tooltip: { ...tt, trigger: "item" as const },
              series: [
                {
                  type: "pie",
                  radius: "60%",
                  data: [
                    { name: "نقدي", value: 38 },
                    { name: "فيزا", value: 29 },
                    { name: "محفظة إلكترونية", value: 22 },
                    { name: "آجل", value: 11 },
                  ].map((d, i) => ({
                    ...d,
                    itemStyle: { color: [G, C, A, P][i] },
                  })),
                  label: { color: "#94a3b8", fontSize: 10 },
                },
              ],
            },
          },
        ],
      };

    // 2 ── أداء الفروع ────────────────────────────────────────────────
    case "branches":
      return {
        icon: BarChart3,
        color: C,
        kpis: [
          { label: "عدد الفروع", value: "7", color: C },
          { label: "متوسط الأداء", value: "78.4%", color: G },
          { label: "أفضل فرع", value: "عمّان", color: G },
          { label: "نمو متوسط", value: "+8.7%", color: A },
        ],
        charts: [
          {
            title: "مؤشر أداء الفروع",
            subtitle: "نقاط مُرجَّحة لكل فرع",
            height: "280px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: grid(),
              xAxis: { ...axX(branches), axisTick: { show: false } },
              yAxis: axY((v) => `${v}%`),
              series: [
                {
                  type: "bar",
                  data: [88, 74, 71, 66, 59].map((v) => ({
                    value: v,
                    itemStyle: {
                      color: v >= 80 ? G : v >= 70 ? C : A,
                      borderRadius: [6, 6, 0, 0],
                    },
                  })),
                  barMaxWidth: 40,
                  label: {
                    show: true,
                    position: "top" as const,
                    formatter: "{c}%",
                    fontSize: 10,
                    color: "#94a3b8",
                  },
                },
              ],
            },
          },
          {
            title: "مقارنة الإيرادات حسب الفرع",
            subtitle: "2024 vs 2025",
            height: "280px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              legend: {
                data: ["2024", "2025"],
                top: 0,
                textStyle: { color: "#64748b", fontSize: 9 },
              },
              grid: grid(),
              xAxis: axX(branches),
              yAxis: axY(),
              series: [
                {
                  name: "2024",
                  type: "bar",
                  barGap: "5%",
                  barMaxWidth: 24,
                  data: [1520, 840, 690, 430, 280].map((v) => ({
                    value: v * 1000,
                    itemStyle: {
                      color: "rgba(0,212,255,0.3)",
                      borderRadius: [4, 4, 0, 0],
                    },
                  })),
                },
                {
                  name: "2025",
                  type: "bar",
                  barMaxWidth: 24,
                  data: [1850, 920, 740, 480, 320].map((v) => ({
                    value: v * 1000,
                    itemStyle: { color: C, borderRadius: [4, 4, 0, 0] },
                  })),
                },
              ],
            },
          },
        ],
      };

    // 3 ── العمليات ─────────────────────────────────────────────────
    case "operations":
      return {
        icon: Clock,
        color: A,
        kpis: [
          { label: "متوسط وقت الفاتورة", value: "3.2 دق", color: A },
          { label: "معدل الخطأ", value: "0.8%", color: R },
          { label: "الفواتير اليومية", value: "1,240", color: G },
          { label: "كفاءة العمليات", value: "94.2%", color: C },
        ],
        charts: [
          {
            title: "الفواتير الشهرية",
            subtitle: "عدد الفواتير + متوسط الوقت",
            height: "280px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              legend: {
                data: ["عدد الفواتير", "متوسط الوقت (دق)"],
                top: 0,
                textStyle: { color: "#64748b", fontSize: 9 },
              },
              grid: grid(),
              xAxis: axX(months),
              yAxis: [
                axY((v: number) => `${(v / 1000).toFixed(0)}K`),
                {
                  type: "value" as const,
                  axisLabel: {
                    formatter: (v: number) => `${v}د`,
                    fontSize: 9,
                    color: "#64748b",
                  },
                },
              ],
              series: [
                {
                  name: "عدد الفواتير",
                  type: "bar",
                  barMaxWidth: 28,
                  data: [28, 24, 38, 34, 40, 32, 26, 46, 38, 34, 48, 54].map(
                    (v) => ({
                      value: v * 1000,
                      itemStyle: { color: A, borderRadius: [4, 4, 0, 0] },
                    }),
                  ),
                },
                {
                  name: "متوسط الوقت (دق)",
                  type: "line",
                  yAxisIndex: 1,
                  data: [
                    3.4, 3.2, 2.9, 3.1, 2.8, 3.3, 3.5, 2.7, 3.0, 3.2, 2.6, 2.5,
                  ],
                  lineStyle: { color: C, width: 2 },
                  itemStyle: { color: C },
                  smooth: true,
                },
              ],
            },
          },
          {
            title: "توزيع العمليات حسب الفرع",
            subtitle: "نسبة الحصة",
            height: "280px",
            option: {
              tooltip: { ...tt, trigger: "item" as const },
              series: [
                {
                  type: "pie",
                  radius: ["35%", "65%"],
                  data: [
                    { name: "عمّان", value: 42 },
                    { name: "إربد", value: 22 },
                    { name: "الزرقاء", value: 18 },
                    { name: "العقبة", value: 11 },
                    { name: "الكرك", value: 7 },
                  ].map((d, i) => ({
                    ...d,
                    itemStyle: { color: [G, C, A, P, R][i] },
                  })),
                  label: { color: "#94a3b8", fontSize: 10 },
                },
              ],
            },
          },
        ],
      };

    // 4 ── أداء الموظفين ──────────────────────────────────────────────
    case "employees":
      return {
        icon: Users,
        color: P,
        kpis: [
          { label: "عدد الكاشيرين", value: "48", color: P },
          { label: "متوسط المبيعات/يوم", value: "3,240 د.أ", color: G },
          { label: "أعلى أداء", value: "عمر خليل", color: G },
          { label: "متوسط الدقة", value: "99.1%", color: C },
        ],
        charts: [
          {
            title: "تصنيف الكاشيرين",
            subtitle: "أفضل 10 حسب المبيعات الشهرية",
            height: "300px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: { ...grid(), left: "22%" },
              xAxis: axY((v: number) => `${(v / 1000).toFixed(0)}K`),
              yAxis: {
                type: "category" as const,
                data: [
                  "عمر خليل",
                  "سارة حداد",
                  "أحمد الرشيد",
                  "ليلى منصور",
                  "خالد عمر",
                  "منى سليم",
                  "نادر حسن",
                  "هدى الطيب",
                  "سامي رضا",
                  "رانيا حلو",
                ],
                axisLabel: { fontSize: 9, color: "#94a3b8" },
                axisTick: { show: false },
              },
              series: [
                {
                  type: "bar",
                  barMaxWidth: 20,
                  data: [98, 92, 88, 84, 80, 76, 73, 70, 68, 65].map(
                    (v, i) => ({
                      value: v * 1000,
                      itemStyle: {
                        color: i === 0 ? G : i < 3 ? C : P,
                        borderRadius: [0, 4, 4, 0],
                      },
                    }),
                  ),
                  label: {
                    show: true,
                    position: "right" as const,
                    formatter: (p: { value: number }) =>
                      `${(p.value / 1000).toFixed(0)}K`,
                    fontSize: 9,
                    color: "#94a3b8",
                  },
                },
              ],
            },
          },
          {
            title: "المبيعات اليومية حسب اليوم",
            subtitle: "متوسط الأسبوع",
            height: "300px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: grid(),
              xAxis: axX([
                "السبت",
                "الأحد",
                "الاثنين",
                "الثلاثاء",
                "الأربعاء",
                "الخميس",
                "الجمعة",
              ]),
              yAxis: axY(),
              series: [
                {
                  type: "bar",
                  barMaxWidth: 36,
                  data: [420, 380, 360, 390, 410, 480, 320].map((v) => ({
                    value: v * 1000,
                    itemStyle: { color: P, borderRadius: [6, 6, 0, 0] },
                  })),
                },
              ],
            },
          },
        ],
      };

    // 5 ── سلوك العملاء ───────────────────────────────────────────────
    case "customers":
      return {
        icon: Users,
        color: C,
        kpis: [
          { label: "إجمالي العملاء", value: "18,400", color: C },
          { label: "عملاء مميزون", value: "2,840", color: G },
          { label: "متوسط قيمة العميل", value: "842 د.أ", color: A },
          { label: "معدل الاحتفاظ", value: "68.5%", color: G },
        ],
        charts: [
          {
            title: "توزيع العملاء حسب الشريحة",
            subtitle: "نسبة كل شريحة",
            height: "260px",
            option: {
              tooltip: { ...tt, trigger: "item" as const },
              series: [
                {
                  type: "pie",
                  radius: ["40%", "70%"],
                  data: [
                    { name: "مميز", value: 2840 },
                    { name: "منتظم", value: 7200 },
                    { name: "عرضي", value: 5600 },
                    { name: "جديد", value: 2760 },
                  ].map((d, i) => ({
                    ...d,
                    itemStyle: { color: [G, C, A, P][i] },
                  })),
                  label: { color: "#94a3b8", fontSize: 10 },
                },
              ],
            },
          },
          {
            title: "عملاء جدد شهرياً",
            subtitle: "نمو قاعدة العملاء",
            height: "260px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: grid(),
              xAxis: axX(months),
              yAxis: axY((v: number) => `${v}`),
              series: [
                {
                  type: "line",
                  data: [
                    420, 380, 490, 450, 520, 480, 410, 580, 540, 500, 620, 690,
                  ],
                  lineStyle: { color: C, width: 2.5 },
                  itemStyle: { color: C },
                  smooth: true,
                  showSymbol: true,
                  symbolSize: 6,
                  areaStyle: {
                    color: {
                      type: "linear" as const,
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: "rgba(0,212,255,0.2)" },
                        { offset: 1, color: "rgba(0,212,255,0.02)" },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            title: "متوسط إنفاق العميل",
            subtitle: "حسب الشريحة — د.أ/شهر",
            height: "220px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: { ...grid(), left: "18%" },
              xAxis: axY((v: number) => `${v}`),
              yAxis: {
                type: "category" as const,
                data: ["مميز", "منتظم", "عرضي", "جديد"],
                axisLabel: { fontSize: 9, color: "#94a3b8" },
                axisTick: { show: false },
              },
              series: [
                {
                  type: "bar",
                  barMaxWidth: 28,
                  data: [842, 340, 180, 95].map((v, i) => ({
                    value: v,
                    itemStyle: {
                      color: [G, C, A, P][i],
                      borderRadius: [0, 4, 4, 0],
                    },
                  })),
                  label: {
                    show: true,
                    position: "right" as const,
                    fontSize: 9,
                    color: "#94a3b8",
                  },
                },
              ],
            },
          },
        ],
      };

    // 6 ── أداء المنتجات ─────────────────────────────────────────────
    case "products":
      return {
        icon: Package,
        color: G,
        kpis: [
          { label: "عدد المنتجات", value: "1,240", color: G },
          { label: "أعلى هامش", value: "أجهزة إلكترونية 72%", color: C },
          { label: "أعلى مبيعات", value: "أرز عنبر 5كجم", color: G },
          { label: "متوسط هامش الربح", value: "34.2%", color: A },
        ],
        charts: [
          {
            title: "أفضل 10 منتجات — قيمة الربح",
            subtitle: "Top 10 Products by Profit Value",
            height: "290px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: { ...grid(), left: "28%" },
              xAxis: axY((v: number) => `${(v / 1000).toFixed(0)}K`),
              yAxis: {
                type: "category" as const,
                data: [
                  "أرز عنبر 5كجم",
                  "الفراولة تايم",
                  "معجون بودي",
                  "طحينة طعم",
                  "شوكولاته توبي",
                  "شوكو ندى",
                  "قرص وفر",
                  "ماسورة كامل",
                  "مكرونة كلاسيك",
                  "جبن هرفة",
                ].reverse(),
                axisLabel: { fontSize: 9, color: "#94a3b8" },
                axisTick: { show: false },
              },
              series: [
                {
                  type: "bar",
                  barMaxWidth: 20,
                  data: [
                    8420, 7680, 6540, 5890, 5240, 4780, 4320, 3960, 3580, 3240,
                  ]
                    .reverse()
                    .map((v, i) => ({
                      value: v,
                      itemStyle: {
                        color: [G, C, A, P, B, R, G, C, A, P][i],
                        borderRadius: [0, 4, 4, 0],
                      },
                    })),
                  label: {
                    show: true,
                    position: "right" as const,
                    fontSize: 9,
                    color: "#94a3b8",
                    formatter: (p: { value: number }) =>
                      `${(p.value / 1000).toFixed(1)}K`,
                  },
                },
              ],
            },
          },
          {
            title: "هامش الربح حسب الفئة",
            subtitle: "Net Margin % by Category",
            height: "290px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: grid(),
              xAxis: axX([
                "بقالة",
                "ألبان",
                "منزلية",
                "أجهزة",
                "وجبات",
                "عناية",
                "ورقية",
              ]),
              yAxis: axY((v: number) => `${v}%`),
              series: [
                {
                  type: "bar",
                  barMaxWidth: 36,
                  data: [28, 35, 38, 72, 42, 26, 44].map((v, i) => ({
                    value: v,
                    itemStyle: {
                      color: [G, C, A, P, B, R, A][i],
                      borderRadius: [6, 6, 0, 0],
                    },
                  })),
                  label: {
                    show: true,
                    position: "top" as const,
                    fontSize: 9,
                    color: "#94a3b8",
                    formatter: "{c}%",
                  },
                },
              ],
            },
          },
        ],
      };

    // 7 ── تحليل الخصومات ────────────────────────────────────────────
    case "discounts":
      return {
        icon: Percent,
        color: A,
        kpis: [
          { label: "إجمالي الخصومات", value: "169.5K", color: A },
          { label: "متوسط نسبة الخصم", value: "1.97%", color: R },
          { label: "% مبيعات مخصومة", value: "21.3%", color: P },
          { label: "ربح المخصومة", value: "43.6K", color: G },
        ],
        charts: [
          {
            title: "الخصومات الشهرية",
            subtitle: "إجمالي قيمة الخصومات",
            height: "250px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: grid(),
              xAxis: axX(months),
              yAxis: axY(),
              series: [
                {
                  type: "line",
                  smooth: true,
                  showSymbol: true,
                  symbolSize: 7,
                  data: [
                    153, 118, 353, 185, 206, 140, 112, 404, 225, 178, 478, 571,
                  ].map((v) => v * 1000),
                  lineStyle: { color: A, width: 2.5 },
                  itemStyle: {
                    color: A,
                    borderColor: "#1a2035",
                    borderWidth: 2,
                  },
                  areaStyle: {
                    color: {
                      type: "linear" as const,
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: "rgba(245,158,11,0.25)" },
                        { offset: 1, color: "rgba(245,158,11,0.02)" },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            title: "تأثير الخصم على هامش الربح",
            subtitle: "مع خصم vs بدون خصم",
            height: "250px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              legend: {
                data: ["مع خصم", "بدون خصم"],
                top: 0,
                textStyle: { color: "#64748b", fontSize: 9 },
              },
              grid: grid(),
              xAxis: axX([
                "بقالة",
                "ألبان",
                "أجهزة",
                "فرفاشية",
                "عناية",
                "منزلية",
                "ورقية",
              ]),
              yAxis: axY((v: number) => `${v}%`),
              series: [
                {
                  name: "مع خصم",
                  type: "bar",
                  barGap: "8%",
                  barMaxWidth: 22,
                  data: [27, 35, 72, 72, 26, 38, 44].map((v) => ({
                    value: v,
                    itemStyle: { color: G, borderRadius: [4, 4, 0, 0] },
                  })),
                },
                {
                  name: "بدون خصم",
                  type: "bar",
                  barMaxWidth: 22,
                  data: [21, 28, 57, 44, 22, 24, 41].map((v) => ({
                    value: v,
                    itemStyle: {
                      color: "rgba(0,229,160,0.25)",
                      borderRadius: [4, 4, 0, 0],
                    },
                  })),
                },
              ],
            },
          },
        ],
      };

    // 8 ── الأرباح مع التغيرات ───────────────────────────────────────
    case "profit-time":
      return {
        icon: TrendingUp,
        color: G,
        kpis: [
          { label: "الربح الحالي", value: "1.56M", color: G },
          { label: "الربح السابق", value: "1.38M", color: C },
          { label: "نمو الربح", value: "+13.0%", color: G },
          { label: "هامش الربح الصافي", value: "36.7%", color: A },
        ],
        charts: [
          {
            title: "مقارنة الأرباح الفصلية",
            subtitle: "ر1 2024 vs ر1 2025",
            height: "280px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              legend: {
                data: ["الفترة المقارنة", "الفترة الحالية"],
                top: 0,
                textStyle: { color: "#64748b", fontSize: 9 },
              },
              grid: grid(),
              xAxis: axX(months),
              yAxis: axY(),
              series: [
                {
                  name: "الفترة المقارنة",
                  type: "line",
                  data: [
                    95, 86, 118, 105, 122, 98, 82, 138, 112, 98, 148, 165,
                  ].map((v) => v * 1000),
                  lineStyle: {
                    color: "rgba(0,229,160,0.4)",
                    width: 2,
                    type: "dashed" as const,
                  },
                  itemStyle: { color: "rgba(0,229,160,0.4)" },
                  smooth: true,
                  showSymbol: false,
                },
                {
                  name: "الفترة الحالية",
                  type: "line",
                  data: [
                    110, 100, 135, 122, 140, 114, 96, 158, 130, 114, 168, 188,
                  ].map((v) => v * 1000),
                  lineStyle: { color: G, width: 2.5 },
                  itemStyle: { color: G },
                  smooth: true,
                  showSymbol: true,
                  symbolSize: 6,
                },
              ],
            },
          },
          {
            title: "هامش الربح حسب الفرع",
            subtitle: "مقارنة بين الفترتين",
            height: "280px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              legend: {
                data: ["الفترة السابقة", "الفترة الحالية"],
                top: 0,
                textStyle: { color: "#64748b", fontSize: 9 },
              },
              grid: grid(),
              xAxis: axX(branches),
              yAxis: axY((v: number) => `${v}%`),
              series: [
                {
                  name: "الفترة السابقة",
                  type: "bar",
                  barGap: "8%",
                  barMaxWidth: 24,
                  data: [34, 31, 29, 33, 28].map((v) => ({
                    value: v,
                    itemStyle: {
                      color: "rgba(0,229,160,0.3)",
                      borderRadius: [4, 4, 0, 0],
                    },
                  })),
                },
                {
                  name: "الفترة الحالية",
                  type: "bar",
                  barMaxWidth: 24,
                  data: [38, 35, 33, 37, 31].map((v) => ({
                    value: v,
                    itemStyle: { color: G, borderRadius: [4, 4, 0, 0] },
                  })),
                },
              ],
            },
          },
        ],
      };

    // 9 ── الاتفاقيات ────────────────────────────────────────────────
    case "agreements":
      return {
        icon: FileBarChart,
        color: B,
        kpis: [
          { label: "إجمالي الاتفاقيات", value: "24", color: B },
          { label: "نشطة", value: "18", color: G },
          { label: "قاربت الانتهاء", value: "4", color: A },
          { label: "قيمة إجمالية", value: "2.84M", color: C },
        ],
        charts: [
          {
            title: "توزيع الاتفاقيات حسب النوع",
            subtitle: "عدد الاتفاقيات",
            height: "270px",
            option: {
              tooltip: { ...tt, trigger: "item" as const },
              series: [
                {
                  type: "pie",
                  radius: ["38%", "68%"],
                  data: [
                    { name: "مشتريات", value: 8 },
                    { name: "توزيع", value: 6 },
                    { name: "خدمات", value: 5 },
                    { name: "تسويق", value: 5 },
                  ].map((d, i) => ({
                    ...d,
                    itemStyle: { color: [G, C, A, P][i] },
                  })),
                  label: { color: "#94a3b8", fontSize: 10 },
                },
              ],
            },
          },
          {
            title: "قيمة الاتفاقيات الشهرية",
            subtitle: "إجمالي القيمة لكل شهر",
            height: "270px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: grid(),
              xAxis: axX(months),
              yAxis: axY(),
              series: [
                {
                  type: "bar",
                  barMaxWidth: 28,
                  data: [
                    180, 220, 195, 240, 210, 185, 160, 280, 250, 225, 310, 330,
                  ].map((v) => ({
                    value: v * 1000,
                    itemStyle: { color: B, borderRadius: [4, 4, 0, 0] },
                  })),
                },
              ],
            },
          },
        ],
      };

    // 10 ── طريقة البيع ───────────────────────────────────────────────
    case "sales-method":
      return {
        icon: ShoppingCart,
        color: C,
        kpis: [
          { label: "نقدي", value: "38.2%", color: G },
          { label: "فيزا/بطاقة", value: "29.4%", color: C },
          { label: "محفظة إلكترونية", value: "22.1%", color: A },
          { label: "آجل", value: "10.3%", color: P },
        ],
        charts: [
          {
            title: "توزيع طرق الدفع",
            subtitle: "نسبة كل طريقة",
            height: "280px",
            option: {
              tooltip: { ...tt, trigger: "item" as const },
              series: [
                {
                  type: "pie",
                  radius: ["35%", "65%"],
                  data: [
                    { name: "نقدي", value: 38.2 },
                    { name: "فيزا", value: 29.4 },
                    { name: "محفظة إلكترونية", value: 22.1 },
                    { name: "آجل", value: 10.3 },
                  ].map((d, i) => ({
                    ...d,
                    itemStyle: { color: [G, C, A, P][i] },
                  })),
                  label: { color: "#94a3b8", fontSize: 10 },
                },
              ],
            },
          },
          {
            title: "مبيعات حسب طريقة الدفع",
            subtitle: "شهري — د.أ",
            height: "280px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              legend: {
                data: ["نقدي", "فيزا", "محفظة"],
                top: 0,
                textStyle: { color: "#64748b", fontSize: 9 },
              },
              grid: grid(),
              xAxis: axX(months),
              yAxis: axY(),
              series: [
                {
                  name: "نقدي",
                  type: "bar",
                  stack: "s",
                  barMaxWidth: 32,
                  data: [
                    118, 105, 158, 142, 168, 128, 98, 190, 158, 134, 208, 232,
                  ].map((v) => ({ value: v * 1000, itemStyle: { color: G } })),
                },
                {
                  name: "فيزa",
                  type: "bar",
                  stack: "s",
                  data: [
                    90, 80, 122, 108, 128, 98, 74, 148, 120, 104, 158, 178,
                  ].map((v) => ({ value: v * 1000, itemStyle: { color: C } })),
                },
                {
                  name: "محفظة",
                  type: "bar",
                  stack: "s",
                  data: [68, 60, 92, 82, 96, 74, 56, 112, 90, 78, 120, 134].map(
                    (v) => ({ value: v * 1000, itemStyle: { color: A } }),
                  ),
                },
              ],
            },
          },
        ],
      };

    // 11 ── التنبؤ الذكي ──────────────────────────────────────────────
    case "ai-forecast":
      return {
        icon: Brain,
        color: P,
        kpis: [
          { label: "دقة النموذج", value: "94.6%", color: G },
          { label: "توقع الشهر القادم", value: "1.28M", color: P },
          { label: "النمو المتوقع", value: "+8.4%", color: G },
          { label: "نموذج AI", value: "LSTM+XGB", color: C },
        ],
        charts: [
          {
            title: "تنبؤ المبيعات — 6 أشهر قادمة",
            subtitle: "القيم الفعلية + التنبؤ AI المعتمد",
            height: "290px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              legend: {
                data: ["فعلي", "تنبؤ", "نطاق الثقة"],
                top: 0,
                textStyle: { color: "#64748b", fontSize: 9 },
              },
              grid: grid(),
              xAxis: axX([
                "أكتوبر",
                "نوفمبر",
                "ديسمبر",
                "يناير",
                "فبراير",
                "مارس",
                "أبريل",
                "مايو",
                "يونيو",
              ]),
              yAxis: axY(),
              series: [
                {
                  name: "فعلي",
                  type: "line",
                  data: [380, 478, 571, null, null, null, null, null, null].map(
                    (v) => (v !== null ? v * 1000 : null),
                  ),
                  lineStyle: { color: G, width: 2.5 },
                  itemStyle: { color: G },
                  smooth: true,
                  showSymbol: true,
                  symbolSize: 7,
                },
                {
                  name: "تنبؤ",
                  type: "line",
                  data: [null, null, 571, 618, 665, 702, 748, 795, 842].map(
                    (v) => (v !== null ? v * 1000 : null),
                  ),
                  lineStyle: { color: P, width: 2.5, type: "dashed" as const },
                  itemStyle: { color: P },
                  smooth: true,
                  showSymbol: true,
                  symbolSize: 7,
                },
              ],
            },
          },
          {
            title: "دقة النموذج — خطأ التنبؤ",
            subtitle: "MAPE % بالشهر",
            height: "290px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: grid(),
              xAxis: axX(months.slice(0, 9)),
              yAxis: axY((v: number) => `${v}%`),
              series: [
                {
                  type: "bar",
                  barMaxWidth: 30,
                  data: [4.2, 3.8, 5.1, 4.6, 4.0, 3.5, 4.8, 3.2, 4.1].map(
                    (v) => ({
                      value: v,
                      itemStyle: {
                        color: v < 4 ? G : v < 5 ? A : R,
                        borderRadius: [4, 4, 0, 0],
                      },
                    }),
                  ),
                },
              ],
            },
          },
        ],
      };

    // 12 ── سلة السوق AI ─────────────────────────────────────────────
    case "ai-basket":
      return {
        icon: Brain,
        color: C,
        kpis: [
          { label: "متوسط حجم السلة", value: "4.2 منتج", color: C },
          { label: "أعلى ارتباط", value: "أرز + زيت", color: G },
          { label: "معدل الاقتراح", value: "78.3%", color: A },
          { label: "نمو متوسط الفاتورة", value: "+12.4%", color: G },
        ],
        charts: [
          {
            title: "أكثر المنتجات اقترانً",
            subtitle: "Basket Association Rules — Support %",
            height: "300px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: { ...grid(), left: "30%" },
              xAxis: axY((v: number) => `${v}%`),
              yAxis: {
                type: "category" as const,
                data: [
                  "أرز + زيت",
                  "أرز + سكر",
                  "شاي + سكر",
                  "خبز + جبن",
                  "حليب + اسفنج",
                  "دجاج + أرز",
                ].reverse(),
                axisLabel: { fontSize: 9, color: "#94a3b8" },
                axisTick: { show: false },
              },
              series: [
                {
                  type: "bar",
                  barMaxWidth: 24,
                  data: [68, 54, 48, 42, 38, 32].reverse().map((v, i) => ({
                    value: v,
                    itemStyle: {
                      color: [G, C, A, P, B, R][i],
                      borderRadius: [0, 4, 4, 0],
                    },
                  })),
                  label: {
                    show: true,
                    position: "right" as const,
                    fontSize: 9,
                    color: "#94a3b8",
                    formatter: "{c}%",
                  },
                },
              ],
            },
          },
          {
            title: "متوسط حجم السلة شهرياً",
            subtitle: "عدد المنتجات في الفاتورة",
            height: "300px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: grid(),
              xAxis: axX(months),
              yAxis: axY((v: number) => `${v}`),
              series: [
                {
                  type: "line",
                  smooth: true,
                  showSymbol: true,
                  symbolSize: 7,
                  data: [
                    3.8, 3.6, 4.2, 4.0, 4.4, 4.1, 3.7, 4.6, 4.3, 4.1, 4.8, 5.2,
                  ],
                  lineStyle: { color: C, width: 2.5 },
                  itemStyle: { color: C },
                  areaStyle: {
                    color: {
                      type: "linear" as const,
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: "rgba(0,212,255,0.2)" },
                        { offset: 1, color: "rgba(0,212,255,0.02)" },
                      ],
                    },
                  },
                },
              ],
            },
          },
        ],
      };

    // 13 ── المقارنة الزمنية ─────────────────────────────────────────
    case "time-compare":
      return {
        icon: Clock,
        color: A,
        kpis: [
          { label: "نمو المبيعات", value: "+11.4%", color: G },
          { label: "نمو الأرباح", value: "+13.0%", color: G },
          { label: "نمو العملاء", value: "+7.8%", color: C },
          { label: "نمو الطلبات", value: "+9.2%", color: A },
        ],
        charts: [
          {
            title: "مقارنة شاملة بين السنتين",
            subtitle: "2024 vs 2025 — المبيعات والأرباح والعملاء",
            height: "280px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              legend: {
                data: ["2024", "2025"],
                top: 0,
                textStyle: { color: "#64748b", fontSize: 9 },
              },
              grid: grid(),
              xAxis: axX(months),
              yAxis: axY(),
              series: [
                {
                  name: "2024",
                  type: "line",
                  showSymbol: false,
                  smooth: true,
                  data: [
                    280, 254, 374, 346, 400, 328, 258, 466, 390, 338, 490, 556,
                  ].map((v) => v * 1000),
                  lineStyle: { color: "rgba(0,229,160,0.4)", width: 2 },
                },
                {
                  name: "2025",
                  type: "line",
                  showSymbol: false,
                  smooth: true,
                  data: [
                    310, 280, 420, 390, 450, 370, 290, 520, 440, 380, 560, 620,
                  ].map((v) => v * 1000),
                  lineStyle: { color: G, width: 2.5 },
                },
              ],
            },
          },
          {
            title: "نمو % شهرياً",
            subtitle: "نسبة التغيير عن الشهر المقابل",
            height: "280px",
            option: {
              tooltip: { ...tt, trigger: "axis" as const },
              grid: grid(),
              xAxis: axX(months),
              yAxis: axY((v: number) => `${v}%`),
              series: [
                {
                  type: "bar",
                  barMaxWidth: 28,
                  data: [
                    10.7, 10.2, 12.3, 12.7, 12.5, 12.8, 12.4, 11.5, 12.8, 12.4,
                    14.3, 11.5,
                  ].map((v) => ({
                    value: v,
                    itemStyle: {
                      color: v > 13 ? G : v > 11 ? C : A,
                      borderRadius: [4, 4, 0, 0],
                    },
                  })),
                },
              ],
            },
          },
        ],
      };

    default:
      return { icon: FileBarChart, color: G, kpis: [], charts: [] };
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ReportPreviewModal({
  type,
  reportName,
  filters,
  onClose,
}: ReportPreviewModalProps) {
  if (!type) return null;

  const cfg = getReportConfig(type);
  const Icon = cfg.icon;
  const today = new Date().toLocaleDateString("ar-JO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="report-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(5,9,18,0.9)",
          backdropFilter: "blur(8px)",
          overflowY: "auto",
          padding: "0",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── Header bar ── */}
          <div
            style={{
              background: "var(--bg-panel)",
              borderBottom: "1px solid var(--border-subtle)",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "sticky",
              top: 0,
              zIndex: 10,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${cfg.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${cfg.color}30`,
                }}
              >
                <Icon size={18} style={{ color: cfg.color }} />
              </div>
              <div>
                <h2
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    fontSize: 15,
                    margin: 0,
                  }}
                >
                  {reportName}
                </h2>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 10,
                    margin: 0,
                  }}
                >
                  تقرير مُنشأ — {today}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {activeFilters.length > 0 &&
                activeFilters.map(([k, v]) => (
                  <span
                    key={k}
                    style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: `${cfg.color}12`,
                      color: cfg.color,
                      border: `1px solid ${cfg.color}30`,
                    }}
                  >
                    {v}
                  </span>
                ))}
              <button
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "var(--btn-primary-bg)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Download size={13} /> تصدير PDF
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "24px", flex: 1 }}>
            {/* KPIs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {cfg.kpis.map((kpi) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 12,
                    background: "var(--bg-panel)",
                    border: `1px solid var(--border-subtle)`,
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      margin: "0 0 6px",
                    }}
                  >
                    {kpi.label}
                  </p>
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: kpi.color,
                      margin: 0,
                    }}
                    dir="ltr"
                  >
                    {kpi.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Charts grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  cfg.charts.length === 1
                    ? "1fr"
                    : cfg.charts.length >= 3
                      ? "repeat(2, 1fr)"
                      : "1fr 1fr",
                gap: 16,
              }}
            >
              {cfg.charts.map((chart, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  style={{
                    gridColumn:
                      cfg.charts.length === 3 && idx === 2
                        ? "1 / -1"
                        : undefined,
                  }}
                >
                  <ChartCard
                    title={chart.title}
                    subtitle={chart.subtitle}
                    option={chart.option}
                    height={chart.height || "280px"}
                  />
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: 20,
                padding: "12px 16px",
                borderRadius: 10,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <p
                style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}
              >
                تاريخ الإنشاء: {today} — المؤسسة الاستهلاكية العسكرية
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                {["PDF", "XLSX", "CSV"].map((f) => (
                  <button
                    key={f}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 7,
                      background: "var(--bg-panel)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-secondary)",
                      fontSize: 10,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Download size={11} /> {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
