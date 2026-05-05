"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import SectionTitleWithFlag from "@/components/ui/SectionTitleWithFlag";

type ItemRow = {
  itemName: string;
  itemCount: number;
  price: number;
  discountPct: number;
};

const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(n);

const items: ItemRow[] = [
  { itemName: "سكر أبيض 2كجم", itemCount: 184, price: 2.15, discountPct: 0 },
  { itemName: "أرز عنبر 5كجم", itemCount: 132, price: 5.75, discountPct: 5 },
  { itemName: "زيت نباتي 1.8L", itemCount: 98, price: 3.4, discountPct: 2 },
  { itemName: "شامبو هيد آند شولدرز", itemCount: 76, price: 4.25, discountPct: 10 },
  { itemName: "مياه معدنية", itemCount: 245, price: 0.5, discountPct: 0 },
];

export default function InvoiceItemsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => r.itemName.toLowerCase().includes(q));
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
            <SectionTitleWithFlag title="تفاصيل المواد داخل الفواتير" />
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Invoice Items Details — {filtered.length} مادة
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              minWidth: 240,
            }}
          >
            <Search size={13} style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="بحث باسم المادة..."
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
              {["اسم المادة", "تكرار المادة", "السعر", "الخصم"].map((h, i) => (
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
              const maxCount = Math.max(...filtered.map((r) => r.itemCount), 1);
              const maxPrice = Math.max(...filtered.map((r) => r.price), 1);
              const barCell = (val: number, max: number, color: string, text: string) => (
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
                  key={r.itemName}
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
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {r.itemName}
                  </td>
                  {barCell(r.itemCount, maxCount, "#3b82f6", fmtN(r.itemCount))}
                  {barCell(r.price, maxPrice, "#3b82f6", r.price.toFixed(2))}
                  <td style={{ padding: "7px 12px", textAlign: "center" }} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: r.discountPct > 0 ? "var(--accent-red)" : "var(--text-muted)",
                      }}
                    >
                      {r.discountPct.toFixed(0)}%
                    </span>
                  </td>
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
          من {filtered.length} مادة
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, pi) => (
            <button
              key={pi}
              onClick={() => setPage(pi)}
              className="w-6 h-6 rounded text-[10px] font-semibold transition-all"
              style={{
                background:
                  pi === page ? "var(--accent-green-dim)" : "var(--bg-elevated)",
                color: pi === page ? "var(--accent-green)" : "var(--text-muted)",
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

