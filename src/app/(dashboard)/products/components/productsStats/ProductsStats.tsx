import { motion } from "framer-motion";

import {
  BarChart3,
  DollarSign,
  Layers,
  Package,
  Percent,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

const categories = [
  { name: "منتجات غذائية", netSales: 248170, volume: 150240, margin: 38.2 },
  { name: "العناية الشخصية", netSales: 55880, volume: 64300, margin: 42.1 },
  { name: "غير مصنف", netSales: 46000, volume: 38000, margin: 30.5 },
  { name: "فرفاشية", netSales: 240, volume: 480, margin: 25.0 },
  { name: "مستلزمات الأطفال", netSales: 35010, volume: 22800, margin: 44.8 },
  { name: "مستلزمات منزلية", netSales: 10080, volume: 8900, margin: 35.6 },
  { name: "منتجات ورقية", netSales: 22220, volume: 18400, margin: 26.3 },
  { name: "مسطحات", netSales: 8340, volume: 5980, margin: 48.5 },
];

const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(2)}K` : String(n);
const totalNetSales = categories.reduce((a, c) => a + c.netSales, 0);
const totalProfitValue = Math.round(totalNetSales * 0.365);
const totalCostValue = totalNetSales - totalProfitValue;
const totalVolume = categories.reduce((a, c) => a + c.volume, 0);
const kpis = [
  {
    icon: DollarSign,
    label: "صافي المبيعات",
    sub: "Net Sales",
    value: fmtK(totalNetSales),
    color: "var(--accent-green)",
    dim: "rgba(4,120,87,0.1)",
  },
  {
    icon: TrendingUp,
    label: "قيمة الربح",
    sub: "Profit Value",
    value: fmtK(totalProfitValue),
    color: "var(--accent-cyan)",
    dim: "rgba(8,145,178,0.1)",
  },
  {
    icon: BarChart3,
    label: "قيمة التكلفة",
    sub: "Cost Value",
    value: fmtK(totalCostValue),
    color: "var(--accent-blue)",
    dim: "rgba(37,99,235,0.1)",
  },
  {
    icon: ShoppingCart,
    label: "متوسط قيمة المعاملة",
    sub: "Avg. Transaction Value (ATV)",
    value: "36.76",
    color: "var(--accent-amber)",
    dim: "rgba(217,119,6,0.1)",
  },
  {
    icon: Package,
    label: "متوسط حجم السلة",
    sub: "Average Basket Size",
    value: "27",
    color: "var(--accent-purple)",
    dim: "rgba(124,58,237,0.1)",
  },
  {
    icon: Layers,
    label: "حجم مبيعات المنتجات",
    sub: "Product Sales Volume",
    value: fmtK(totalVolume),
    color: "var(--accent-cyan)",
    dim: "rgba(8,145,178,0.1)",
  },
  {
    icon: Percent,
    label: "هامش الربح %",
    sub: "% Profit Margin",
    value: "36.51%",
    color: "var(--accent-green)",
    dim: "rgba(4,120,87,0.1)",
  },
];

const ProductsStats = () => {
  const [activeKpi, setActiveKpi] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
      {kpis.map((k, i) => (
        <motion.div
          key={k.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => setActiveKpi(activeKpi === i ? null : i)}
          className="glass-panel p-4 relative overflow-hidden cursor-pointer transition-all"
          style={{
            borderColor:
              activeKpi === i ? k.color + "55" : "var(--border-subtle)",
            boxShadow: activeKpi === i ? `0 0 18px ${k.color}22` : undefined,
          }}
        >
          <div
            className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl"
            style={{ background: k.color, opacity: 0.12 }}
          />
          <div className="relative">
            <div
              className="p-1.5 rounded-lg w-fit mb-2"
              style={{ background: k.dim }}
            >
              <k.icon size={12} style={{ color: k.color }} />
            </div>
            <p
              className="text-[15px] font-bold"
              style={{ color: k.color }}
              dir="ltr"
            >
              {k.value}
            </p>
            <p
              className="text-[9px] font-semibold mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {k.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductsStats;
