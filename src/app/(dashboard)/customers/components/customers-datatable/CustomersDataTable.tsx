"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronLeft, Search } from "lucide-react";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import {
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import type { CustomerInvoice, CustomerRow } from "./rows";
import { rows } from "./rows";

const CUSTOMER_HEADERS = [
  { label: "الاسم", align: "right" as const, width: "200px" },
  { label: "الرقم الوطني", align: "center" as const, width: "120px" },
  { label: "رقم الهاتف", align: "center" as const, width: "120px" },
  { label: "رقم البطاقة", align: "center" as const, width: "120px" },
  { label: "تاريخ انشاء البطاقة", align: "center" as const, width: "130px" },
];

const INVOICE_HEADERS = [
  { label: "رقم الفاتورة", align: "right" as const, width: "140px" },
  {
    label: "تاريخ الفاتورة ووقت الفاتورة",
    align: "center" as const,
    width: "150px",
  },
  { label: "قيمة الفاتورة", align: "center" as const, width: "110px" },
  { label: "السوق", align: "center" as const, width: "140px" },
  { label: "الخصم", align: "center" as const, width: "90px" },
  { label: "طريقة الدفع", align: "center" as const, width: "100px" },
  { label: "عدد المواد", align: "center" as const, width: "90px" },
];

const LINE_HEADERS = [
  { label: "اسم المادة", align: "right" as const, width: "220px" },
  { label: "تكرار المادة", align: "center" as const, width: "100px" },
  { label: "السعر", align: "center" as const, width: "100px" },
  { label: "الخصم", align: "center" as const, width: "90px" },
];

function fmtMoney(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function invoiceKey(cardNumber: string, inv: CustomerInvoice) {
  return `${cardNumber}::${inv.invoiceNumber}`;
}

export default function CustomersDataTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [expandedCustomer, setExpandedCustomer] = useState<
    Record<string, boolean>
  >({});
  const [expandedInvoice, setExpandedInvoice] = useState<
    Record<string, boolean>
  >({});

  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const invHay = r.invoices
        .flatMap((inv) => [
          inv.invoiceNumber,
          inv.market,
          inv.paymentMethod,
          ...inv.lines.map((l) => l.materialName),
        ])
        .join(" ")
        .toLowerCase();
      const hay =
        `${r.name} ${r.nationalId} ${r.phone} ${r.cardNumber} ${invHay}`.toLowerCase();
      return hay.includes(q);
    });
  }, [search]);

  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const toggleCustomer = (cardNumber: string) => {
    setExpandedCustomer((prev) => ({
      ...prev,
      [cardNumber]: !prev[cardNumber],
    }));
  };

  const toggleInvoice = (key: string) => {
    setExpandedInvoice((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderInvoiceBlock = (c: CustomerRow) => (
    <div
      className="py-2 pr-2 pl-1"
      style={{
        borderRight: "3px solid rgba(0,229,160,0.25)",
        background: "rgba(4,120,87,0.03)",
      }}
    >
      <p
        className="text-[10px] font-bold mb-2 px-1"
        style={{ color: "var(--accent-green)" }}
      >
        المستوى الثاني — جميع الفواتير
      </p>
      <AnalyticsTable minWidth="1040px" headers={INVOICE_HEADERS}>
        {c.invoices.flatMap((inv, ii) => {
          const ikey = invoiceKey(c.cardNumber, inv);
          const open = expandedInvoice[ikey] === true;
          const hasLines = inv.lines.length > 0;
          const rowsOut: ReactNode[] = [
            <tr
              key={ikey}
              className={
                hasLines
                  ? "cursor-pointer hover:bg-white/1.5 transition-colors"
                  : undefined
              }
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                background: open
                  ? "rgba(8,145,178,0.05)"
                  : "rgba(8,145,178,0.02)",
              }}
              onClick={() => hasLines && toggleInvoice(ikey)}
            >
              <td style={analyticsTdBaseStyle("right")}>
                <div className="flex items-center gap-1.5 justify-end">
                  {hasLines ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: open
                          ? "rgba(8,145,178,0.15)"
                          : "var(--bg-elevated)",
                      }}
                    >
                      {open ? (
                        <ChevronDown
                          size={11}
                          style={{ color: "var(--accent-cyan)" }}
                        />
                      ) : (
                        <ChevronLeft
                          size={11}
                          style={{ color: "var(--text-muted)" }}
                        />
                      )}
                    </span>
                  ) : (
                    <span style={{ width: 16, display: "inline-block" }} />
                  )}
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--accent-cyan)" }}
                    dir="ltr"
                  >
                    {inv.invoiceNumber}
                  </span>
                </div>
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("center"),
                  color: "var(--text-secondary)",
                  fontSize: 10,
                }}
                dir="ltr"
              >
                {inv.invoiceDateTime}
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("center"),
                  fontWeight: 700,
                  fontSize: 10,
                  color: "var(--text-primary)",
                }}
                dir="ltr"
              >
                {fmtMoney(inv.invoiceValue)}
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("center"),
                  fontSize: 10,
                  color: "var(--text-secondary)",
                }}
              >
                {inv.market}
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("center"),
                  fontSize: 10,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                {fmtMoney(inv.discount)}
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("center"),
                  fontSize: 10,
                  color: "var(--text-secondary)",
                }}
              >
                {inv.paymentMethod}
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("center"),
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--accent-blue)",
                }}
                dir="ltr"
              >
                {inv.itemCount}
              </td>
            </tr>,
          ];
          if (hasLines && open) {
            rowsOut.push(
              <tr key={`${ikey}-lines`}>
                <td colSpan={7} style={{ padding: 0, border: "none" }}>
                  <div
                    className="py-2 pr-3 pl-2"
                    style={{
                      borderRight: "3px solid rgba(59,130,246,0.28)",
                      background: "rgba(59,130,246,0.04)",
                    }}
                  >
                    <p
                      className="text-[10px] font-bold mb-2 px-1"
                      style={{ color: "var(--accent-blue)" }}
                    >
                      المستوى الثالث — تفاصيل المواد داخل الفاتورة
                    </p>
                    <AnalyticsTable minWidth="640px" headers={LINE_HEADERS}>
                      {inv.lines.map((line, li) => (
                        <tr
                          key={`${ikey}-L${li}`}
                          style={{
                            borderBottom: "1px solid var(--border-subtle)",
                          }}
                        >
                          <td
                            style={{
                              ...analyticsTdBaseStyle("right"),
                              color: "var(--text-primary)",
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {line.materialName}
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              fontSize: 10,
                              color: "var(--text-secondary)",
                            }}
                            dir="ltr"
                          >
                            {line.repeatCount}
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              fontSize: 10,
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                            dir="ltr"
                          >
                            {fmtMoney(line.price)}
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              fontSize: 10,
                              color: "var(--text-secondary)",
                            }}
                            dir="ltr"
                          >
                            {fmtMoney(line.discount)}
                          </td>
                        </tr>
                      ))}
                    </AnalyticsTable>
                  </div>
                </td>
              </tr>,
            );
          }
          return rowsOut;
        })}
      </AnalyticsTable>
    </div>
  );

  return (
    <AnalyticsTableCard
      title="بيانات العميل"
      flag="green"
      subtitles={
        <>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            المستوى الأول: بيانات العميل — المستوى الثاني: الفواتير — المستوى
            الثالث: المواد داخل كل فاتورة
          </p>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            اضغط على صف العميل لعرض الفواتير • اضغط على صف الفاتورة لعرض موادها
            • تتغير عناوين الأعمدة حسب المستوى
          </p>
        </>
      }
      headerExtra={
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg shrink-0"
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
            placeholder="بحث بالاسم / الوطني / الهاتف / رقم فاتورة..."
            className="bg-transparent outline-none text-xs w-full"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      }
      footer={
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
            من {filtered.length} عميل
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, pi) => (
              <button
                key={pi}
                type="button"
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
                    pi === page
                      ? "rgba(0,229,160,0.25)"
                      : "var(--border-subtle)",
                }}
              >
                {pi + 1}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <AnalyticsTable minWidth="920px" headers={CUSTOMER_HEADERS}>
        {pageData.flatMap((c, i) => {
          const open = expandedCustomer[c.cardNumber] === true;
          const hasInv = c.invoices.length > 0;
          const out: ReactNode[] = [
            <motion.tr
              key={c.cardNumber}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className={
                hasInv
                  ? "cursor-pointer hover:bg-white/1.5 transition-colors"
                  : undefined
              }
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                background: open
                  ? "rgba(4,120,87,0.06)"
                  : "rgba(4,120,87,0.02)",
              }}
              onClick={() => hasInv && toggleCustomer(c.cardNumber)}
            >
              <td style={analyticsTdBaseStyle("right")}>
                <div className="flex items-center gap-1.5">
                  {hasInv ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: open
                          ? "rgba(0,229,160,0.11)"
                          : "var(--bg-elevated)",
                      }}
                    >
                      {open ? (
                        <ChevronDown
                          size={11}
                          style={{ color: "var(--accent-green)" }}
                        />
                      ) : (
                        <ChevronLeft
                          size={11}
                          style={{ color: "var(--text-muted)" }}
                        />
                      )}
                    </span>
                  ) : (
                    <span style={{ width: 16, display: "inline-block" }} />
                  )}
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {c.name}
                  </span>
                </div>
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("center"),
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--accent-blue)",
                }}
                dir="ltr"
              >
                {c.nationalId}
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("center"),
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                {c.phone}
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("center"),
                  fontSize: 10,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                }}
                dir="ltr"
              >
                {c.cardNumber}
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("center"),
                  fontSize: 10,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                {c.cardCreatedAt}
              </td>
            </motion.tr>,
          ];
          if (open && hasInv) {
            out.push(
              <tr key={`${c.cardNumber}-inv-wrap`}>
                <td colSpan={5} style={{ padding: 0, border: "none" }}>
                  {renderInvoiceBlock(c)}
                </td>
              </tr>,
            );
          }
          return out;
        })}
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
}
