"use client";

import "@/lib/echarts/register-bar-line-pie";
import InvoiceItemsTable from "@/components/ui/InvoiceItemsTable";
import Header from "./components/header/Header";
import TransactionsStats from "./components/transactions-stats/TransactionsStats";
import ImpactOfOutageOnTransactionVolume from "./components/impact-of-outage-on-transaction-volume/ImpactOfOutageOnTransactionVolume";
import NumberOfInvoicesByYearAndBranch from "./components/number-of-invoices-by-year-and-branch/NumberOfInvoicesByYearAndBranch";
import NetSalesProfitMarginAndAtvByNumberOfUnitsSold from "./components/net-sales-profit-margin-and-ATV-by-number-of-units-sold/NetSalesProfitMarginAndAtvByNumberOfUnitsSold";
import TransactionDetailsByBranch from "./components/transaction-details-by-branch/TransactionDetailsByBranch";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <Header />
      <TransactionsStats />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ImpactOfOutageOnTransactionVolume />
        <NumberOfInvoicesByYearAndBranch />
      </div>
      <NetSalesProfitMarginAndAtvByNumberOfUnitsSold />
      <TransactionDetailsByBranch />
      <InvoiceItemsTable />
    </div>
  );
}
