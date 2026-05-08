"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-scatter";
import { motion } from "framer-motion";

import Header from "./components/header/Header";
import ProductsStats from "./components/productsStats/ProductsStats";
import NetSalesByCategory from "./components/net-sales-by-category/NetSalesByCategory";
import SalesVolumeVsProfitMargin from "./components/sales-volume-vs-profit-margin/SalesVolumeVsProfitMargin";
import Top10MostProfitableProducts from "./components/top-10-most-profitable-products/Top10MostProfitableProducts";
import Lowest10ProfitableProducts from "./components/lowest-10-profitable-products/Lowest10ProfitableProducts";
import SalesVolumeAndProfitsByProduct from "./components/sales-volume-and-profits-by-product/SalesVolumeAndProfitsByProduct";
import ReturnsByProduct from "./components/returns-by-product/ReturnsByProduct";
import ProductsCatalog from "./components/products-catalog/ProductsCatalog";

// ─── Easing ────────────────────────────────────────────────────────────────────
// Must be a const tuple [n,n,n,n] — plain number[] is not assignable to Easing

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Animation Variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

const staggerGrid = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const gridChild = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: EASE },
  },
};

// ─── Reusable animated wrappers ────────────────────────────────────────────────

function AnimatedSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="grid grid-cols-1 xl:grid-cols-2 gap-4"
      variants={staggerGrid}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

function GridCell({ children }: { children: React.ReactNode }) {
  return <motion.div variants={gridChild}>{children}</motion.div>;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  return (
    <div className="space-y-6">

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <Header />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: 0.08 }}
      >
        <ProductsStats />
      </motion.div>

      <AnimatedGrid>
        <GridCell><NetSalesByCategory /></GridCell>
        <GridCell><SalesVolumeVsProfitMargin /></GridCell>
      </AnimatedGrid>

      <AnimatedGrid>
        <GridCell><Top10MostProfitableProducts /></GridCell>
        <GridCell><Lowest10ProfitableProducts /></GridCell>
      </AnimatedGrid>

      <AnimatedGrid>
        <GridCell><SalesVolumeAndProfitsByProduct /></GridCell>
        <GridCell><ReturnsByProduct /></GridCell>
      </AnimatedGrid>

      <AnimatedSection>
        <ProductsCatalog />
      </AnimatedSection>

    </div>
  );
}