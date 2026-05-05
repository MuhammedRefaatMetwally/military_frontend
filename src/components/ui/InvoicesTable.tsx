"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import SectionTitleWithFlag from "@/components/ui/SectionTitleWithFlag";

type InvoiceRow = {
  invoiceNo: string;
  invoiceDateTime: string;
  invoiceValue: number;
  market: string;
  discountPct: number;
  paymentMethod: string;
  itemsCount: number;
};

const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(n);

const invoices: InvoiceRow[] = [
  {
    invoiceNo: "INV-00018422",
    invoiceDateTime: "2026-03-11 10:42",
    invoiceValue: 128.4,
    market: "سوق المنارة",
    discountPct: 5,
    paymentMethod: "فيزا",
    itemsCount: 14,
  },
  {
    invoiceNo: "INV-00018423",
    invoiceDateTime: "2026-03-11 10:48",
    invoiceValue: 42.75,
    market: "سوق المنارة",
    discountPct: 0,
    paymentMethod: "كاش",
    itemsCount: 6,
  },
  {
    invoiceNo: "INV-00019105",
    invoiceDateTime: "2026-03-18 16:09",
    invoiceValue: 256.1,
    market: "سوق إربد",
    discountPct: 10,
    paymentMethod: "طلبات",
    itemsCount: 21,
  },
  {
    invoiceNo: "INV-00020544",
    invoiceDateTime: "2026-03-22 12:33",
    invoiceValue: 89.0,
    market: "سوق الزرقاء",
    discountPct: 3,
    paymentMethod: "ذمم",
    itemsCount: 9,
  },
  {
    invoiceNo: "INV-00022018",
    invoiceDateTime: "2026-03-29 20:17",
    invoiceValue: 173.2,
    market: "سوق العقبة",
    discountPct: 0,
    paymentMethod: "كوبون",
    itemsCount: 18,
  },
];

export default function InvoicesTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((r) => {
      const hay =
        `${r.invoiceNo} ${r.invoiceDateTime} ${r.market} ${r.paymentMethod}`.toLowerCase();
      return hay.includes(q);
    });
  }, [search]);

  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div className="glass-panel overflow-hidden">
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <SectionTitleWithFlag title="جدول يبين جميع الفواتير" />
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Invoices Master Table — {filtered.length} فاتورة
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              minWidth: 260,
            }}
          >
            <Search size={13} style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="بحث برقم الفاتورة / السوق / طريقة الدفع..."
              className="bg-transparent outline-none text-xs w-full"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>
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
                "رقم الفاتورة",
                "تاريخ ووقت الفاتورة",
                "قيمة الفاتورة",
                "السوق",
                "الخصم",
                "طريقة الدفع",
                "عدد المواد",
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
              const maxValue = Math.max(
                ...filtered.map((r) => r.invoiceValue),
                1,
              );
              const maxItems = Math.max(
                ...filtered.map((r) => r.itemsCount),
                1,
              );
              const barCell = (
                val: number,
                max: number,
                color: string,
                text: string,
              ) => (
                <td
                  style={{
                    padding: "7px 12px",
                    textAlign: "center",
                    position: "relative" as const,
                  }}
                  dir="ltr"
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
                      opacity: 0.22,
                      borderRadius: 3,
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {text}
                  </span>
                </td>
              );

              return pageData.map((r, i) => (
                <motion.tr
                  key={r.invoiceNo}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-white/1.5 transition-colors"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "right",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                    }}
                    dir="ltr"
                  >
                    {r.invoiceNo}
                  </td>
                  <td
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      fontSize: 10,
                      color: "var(--text-secondary)",
                    }}
                    dir="ltr"
                  >
                    {r.invoiceDateTime}
                  </td>
                  {barCell(
                    r.invoiceValue,
                    maxValue,
                    "#3b82f6",
                    fmtN(r.invoiceValue),
                  )}
                  <td
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {r.market}
                  </td>
                  <td
                    style={{ padding: "7px 12px", textAlign: "center" }}
                    dir="ltr"
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color:
                          r.discountPct > 0
                            ? "var(--accent-red)"
                            : "var(--text-muted)",
                      }}
                    >
                      {r.discountPct.toFixed(0)}%
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--accent-blue)",
                    }}
                  >
                    {r.paymentMethod}
                  </td>
                  {barCell(
                    r.itemsCount,
                    maxItems,
                    "#3b82f6",
                    fmtN(r.itemsCount),
                  )}
                </motion.tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      <div
        className="px-5 py-3 border-t flex items-center justify-between"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {filtered.length === 0
            ? "0"
            : `${page * pageSize + 1}–${Math.min(
                (page + 1) * pageSize,
                filtered.length,
              )}`}{" "}
          من {filtered.length} فاتورة
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, pi) => (
            <button
              key={pi}
              onClick={() => setPage(pi)}
              className="w-6 h-6 rounded text-[10px] font-semibold transition-all"
              style={{
                background:
                  pi === page
                    ? "var(--accent-green-dim)"
                    : "var(--bg-elevated)",
                color:
                  pi === page ? "var(--accent-green)" : "var(--text-muted)",
                border: "1px solid",
                borderColor:
                  pi === page ? "rgba(0,229,160,0.25)" : "var(--border-subtle)",
              }}
            >
              {pi + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
