"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-scatter";
import Header from "./components/header/Header";
import ProductsStats from "./components/productsStats/ProductsStats";
import NetSalesByCategory from "./components/net-sales-by-category/NetSalesByCategory";
import SalesVolumeVsProfitMargin from "./components/sales-volume-vs-profit-margin/SalesVolumeVsProfitMargin";
import Top10MostProfitableProducts from "./components/top-10-most-profitable-products/Top10MostProfitableProducts";
import Lowest10ProfitableProducts from "./components/lowest-10-profitable-products/Lowest10ProfitableProducts";
import SalesVolumeAndProfitsByProduct from "./components/sales-volume-and-profits-by-product/SalesVolumeAndProfitsByProduct";
import ReturnsByProduct from "./components/returns-by-product/ReturnsByProduct";
import ProductsCatalog from "./components/products-catalog/ProductsCatalog";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <Header />
      <ProductsStats />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <NetSalesByCategory />
        <SalesVolumeVsProfitMargin />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Top10MostProfitableProducts />
        <Lowest10ProfitableProducts />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SalesVolumeAndProfitsByProduct />
        <ReturnsByProduct />
      </div>
      <ProductsCatalog />
    </div>
  );
}
