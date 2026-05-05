import SectionTitleWithFlag from "@/components/ui/SectionTitleWithFlag";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { branchData } from "../../utils/data";
import React, { useState } from "react";
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
const totalNetSales = branchData.reduce((a, b) => a + b.netSales, 0);
const totalTransactions = branchData.reduce((a, b) => a + b.transactions, 0);
const totalInvoices = branchData.reduce((a, b) => a + b.invoices, 0);
const totalVoids = branchData.reduce((a, b) => a + b.voidCount, 0);

const TransactionDetailsByBranch = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };
  return (
    <div className="glass-panel overflow-hidden">
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <SectionTitleWithFlag title="تفاصيل المعاملات حسب الفرع" />
        <p
          className="text-[10px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          Branch Transaction Details — فرع → فئة → منتج
        </p>
      </div>
      <div className="overflow-x-auto">
        <table dir="rtl" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "var(--bg-elevated)",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              {[
                "الفرع / الفئة / المنتج",
                "صافي المبيعات",
                "عدد الفواتير",
                "عدد الفواتير",
                "عدد الفواتير المرتجعة",
                "متوسط قيمة الفاتورة",
              ].map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "9px 12px",
                    textAlign: i === 0 ? "right" : "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Calculate max values for bar scaling
              const allRows = branchData.flatMap((b) => [
                b,
                ...b.subs.flatMap((s) => [s, ...s.products]),
              ]);
              const maxNet = Math.max(...allRows.map((r) => r.netSales));
              const maxTx = Math.max(...allRows.map((r) => r.transactions));
              const maxInv = Math.max(...allRows.map((r) => r.invoices));
              const maxVoid = Math.max(
                ...allRows
                  .filter((r) => r.voidCount > 0)
                  .map((r) => r.voidCount),
                1,
              );

              const barCell = (
                val: number,
                max: number,
                color: string,
                isMoney = false,
              ) => (
                <td
                  style={{
                    padding: "7px 12px",
                    textAlign: "center",
                    position: "relative" as const,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 4,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: `${Math.max(2, (val / max) * 85)}%`,
                      height: 16,
                      background: color,
                      opacity: 0.25,
                      borderRadius: 3,
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                    dir="ltr"
                  >
                    {isMoney ? fmt(val) : fmt(val)}
                  </span>
                </td>
              );

              return branchData.map((branch) => {
                const brKey = `txb_${branch.name}`;
                const isBrOpen = expandedRows.has(brKey);

                return (
                  <React.Fragment key={branch.name}>
                    {/* صف الفرع */}
                    <tr
                      onClick={() => toggleRow(brKey)}
                      className="cursor-pointer hover:bg-white/1.5 transition-colors"
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        background: isBrOpen
                          ? "rgba(4,120,87,0.04)"
                          : "transparent",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              color: "var(--accent-green)",
                              transition: "transform 0.2s",
                              display: "inline-block",
                              transform: isBrOpen
                                ? "rotate(0deg)"
                                : "rotate(-90deg)",
                            }}
                          >
                            <ChevronDown size={13} />
                          </span>
                          {branch.name}
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{
                              background: "var(--bg-elevated)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {branch.subs.length}
                          </span>
                        </div>
                      </td>
                      {barCell(branch.netSales, maxNet, "#3b82f6", true)}
                      {barCell(branch.transactions, maxTx, "#3b82f6")}
                      {barCell(branch.invoices, maxInv, "#3b82f6")}
                      {barCell(branch.voidCount, maxVoid, "#ef4444")}
                      <td
                        style={{
                          padding: "7px 12px",
                          textAlign: "center",
                          fontSize: 10,
                          color: "var(--accent-blue)",
                        }}
                        dir="ltr"
                      >
                        {branch.atv.toFixed(2)}
                      </td>
                    </tr>

                    {/* صفوف الفئات (sub) */}
                    <AnimatePresence initial={false}>
                      {isBrOpen &&
                        branch.subs.map((sub, si) => {
                          const subKey = `txs_${branch.name}_${sub.name}`;
                          const isSubOpen = expandedRows.has(subKey);
                          return (
                            <React.Fragment key={sub.name}>
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{
                                  duration: 0.18,
                                  delay: si * 0.03,
                                }}
                                onClick={() => toggleRow(subKey)}
                                className="cursor-pointer hover:bg-white/1.5 transition-colors"
                                style={{
                                  borderBottom:
                                    "1px solid var(--border-subtle)",
                                  background: isSubOpen
                                    ? "rgba(8,145,178,0.04)"
                                    : "rgba(4,120,87,0.02)",
                                }}
                              >
                                <td
                                  style={{
                                    padding: "6px 12px 6px 30px",
                                    fontSize: 10,
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      style={{
                                        color: "var(--accent-cyan)",
                                        transition: "transform 0.2s",
                                        display: "inline-block",
                                        transform: isSubOpen
                                          ? "rotate(0deg)"
                                          : "rotate(-90deg)",
                                      }}
                                    >
                                      <ChevronDown size={11} />
                                    </span>
                                    {sub.name}
                                    <span
                                      className="text-[8px] px-1 py-0.5 rounded"
                                      style={{
                                        background: "var(--bg-elevated)",
                                        color: "var(--text-muted)",
                                      }}
                                    >
                                      {sub.products.length}
                                    </span>
                                  </div>
                                </td>
                                {barCell(sub.netSales, maxNet, "#3b82f6", true)}
                                {barCell(sub.transactions, maxTx, "#3b82f6")}
                                {barCell(sub.invoices, maxInv, "#3b82f6")}
                                {barCell(sub.voidCount, maxVoid, "#ef4444")}
                                <td
                                  style={{
                                    padding: "6px 12px",
                                    textAlign: "center",
                                    fontSize: 10,
                                    color: "var(--accent-blue)",
                                  }}
                                  dir="ltr"
                                >
                                  {sub.atv.toFixed(2)}
                                </td>
                              </motion.tr>

                              {/* صفوف المنتجات (sub al sub) */}
                              <AnimatePresence initial={false}>
                                {isSubOpen &&
                                  sub.products.map((prod, pi) => (
                                    <motion.tr
                                      key={prod.name}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{
                                        duration: 0.15,
                                        delay: pi * 0.03,
                                      }}
                                      style={{
                                        borderBottom:
                                          "1px solid var(--border-subtle)",
                                        background: "rgba(8,145,178,0.02)",
                                      }}
                                    >
                                      <td
                                        style={{
                                          padding: "5px 12px 5px 50px",
                                          fontSize: 9.5,
                                          color: "var(--text-muted)",
                                        }}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <ChevronRight
                                            size={9}
                                            style={{
                                              color: "var(--accent-amber)",
                                              opacity: 0.6,
                                            }}
                                          />
                                          {prod.name}
                                        </div>
                                      </td>
                                      {barCell(
                                        prod.netSales,
                                        maxNet,
                                        "#3b82f6",
                                        true,
                                      )}
                                      {barCell(
                                        prod.transactions,
                                        maxTx,
                                        "#3b82f6",
                                      )}
                                      {barCell(
                                        prod.invoices,
                                        maxInv,
                                        "#3b82f6",
                                      )}
                                      {barCell(
                                        prod.voidCount,
                                        maxVoid,
                                        "#ef4444",
                                      )}
                                      <td
                                        style={{
                                          padding: "5px 12px",
                                          textAlign: "center",
                                          fontSize: 9.5,
                                          color: "var(--accent-blue)",
                                        }}
                                        dir="ltr"
                                      >
                                        {prod.atv.toFixed(2)}
                                      </td>
                                    </motion.tr>
                                  ))}
                              </AnimatePresence>
                            </React.Fragment>
                          );
                        })}
                    </AnimatePresence>
                  </React.Fragment>
                );
              });
            })()}
            {/* صف الإجمالي */}
            <tr
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--accent-green-dim)",
                fontWeight: 700,
              }}
            >
              <td
                style={{
                  padding: "8px 12px",
                  fontSize: 11,
                  color: "var(--accent-green)",
                }}
              >
                الإجمالي
              </td>
              <td
                style={{
                  padding: "8px 12px",
                  textAlign: "center",
                  fontSize: 10,
                  color: "var(--accent-green)",
                }}
                dir="ltr"
              >
                {fmt(totalNetSales)}
              </td>
              <td
                style={{
                  padding: "8px 12px",
                  textAlign: "center",
                  fontSize: 10,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                {fmt(totalTransactions)}
              </td>
              <td
                style={{
                  padding: "8px 12px",
                  textAlign: "center",
                  fontSize: 10,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                {fmt(totalInvoices)}
              </td>
              <td
                style={{
                  padding: "8px 12px",
                  textAlign: "center",
                  fontSize: 10,
                  color: "var(--accent-red)",
                }}
                dir="ltr"
              >
                {totalVoids}
              </td>
              <td
                style={{
                  padding: "8px 12px",
                  textAlign: "center",
                  fontSize: 10,
                  color: "var(--accent-blue)",
                }}
                dir="ltr"
              >
                {(totalNetSales / totalTransactions).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionDetailsByBranch;
