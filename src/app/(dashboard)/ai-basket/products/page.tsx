"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-scatter";

import Header from "../components/header/Header";
import ProductsLinkNetwork from "../components/products-link-network/ProductsLinkNetwork";

export default function AIProductsNetworkPage() {
  return (
    <div className="space-y-6">
      <Header />
      <ProductsLinkNetwork />
    </div>
  );
}
