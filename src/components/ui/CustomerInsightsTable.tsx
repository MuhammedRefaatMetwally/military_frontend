"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";

// ── هيكل بيانات العميل ──
interface Customer {
  name: string;
  totalSales: number;
  totalTransactions: number;
  /** متوسط عدد الزيارات السنوية */
  annualVisitsAvg: number;
  /** متوسط قيمة السلة */
  avgBasketValue: number;
  /** الاستفادة من الخصومات (٪) */
  discountUsagePct: number;
  segment: string;
}

// ── بيانات وهمية مأخوذة من السكرشوت + مزيد ──
const customers: Customer[] = [
  {
    name: "عبدالعزيز العدامات",
    totalSales: 27,
    totalTransactions: 11,
    annualVisitsAvg: 12,
    avgBasketValue: 18,
    discountUsagePct: 14,
    segment: "Low Recency, High Frequency",
  },
  {
    name: "عبدالحميد الشرفات",
    totalSales: 8,
    totalTransactions: 5,
    annualVisitsAvg: 7,
    avgBasketValue: 12,
    discountUsagePct: 9,
    segment: "Low Recency, High Frequency",
  },
  {
    name: "عبدالله البعيدة",
    totalSales: 198,
    totalTransactions: 90,
    annualVisitsAvg: 64,
    avgBasketValue: 46,
    discountUsagePct: 31,
    segment: "High Recency, High Frequency",
  },
  {
    name: "عبدالله الرفاعي",
    totalSales: 34,
    totalTransactions: 4,
    annualVisitsAvg: 9,
    avgBasketValue: 62,
    discountUsagePct: 6,
    segment: "High Recency, Low Frequency",
  },
  {
    name: "عبدالله العلانزة",
    totalSales: 19,
    totalTransactions: 5,
    annualVisitsAvg: 22,
    avgBasketValue: 25,
    discountUsagePct: 18,
    segment: "Low Recency, High Frequency",
  },
  {
    name: "عبدالله البنيان",
    totalSales: 13,
    totalTransactions: 4,
    annualVisitsAvg: 10,
    avgBasketValue: 19,
    discountUsagePct: 11,
    segment: "Low Recency, Low Frequency",
  },
  {
    name: "عبدالله المساعيد",
    totalSales: 62,
    totalTransactions: 16,
    annualVisitsAvg: 35,
    avgBasketValue: 28,
    discountUsagePct: 24,
    segment: "High Recency, High Frequency",
  },
  {
    name: "عبدالله المسارحة",
    totalSales: 69,
    totalTransactions: 22,
    annualVisitsAvg: 41,
    avgBasketValue: 33,
    discountUsagePct: 27,
    segment: "High Recency, Low Frequency",
  },
  {
    name: "عبدالله النمر",
    totalSales: 3,
    totalTransactions: 1,
    annualVisitsAvg: 2,
    avgBasketValue: 9,
    discountUsagePct: 2,
    segment: "Low Recency, Low Frequency",
  },
  {
    name: "عبدالله العمري",
    totalSales: 310,
    totalTransactions: 115,
    annualVisitsAvg: 78,
    avgBasketValue: 52,
    discountUsagePct: 33,
    segment: "High Recency, High Frequency",
  },
  {
    name: "عبدالله الرمثان",
    totalSales: 17,
    totalTransactions: 11,
    annualVisitsAvg: 14,
    avgBasketValue: 13,
    discountUsagePct: 10,
    segment: "High Recency, High Frequency",
  },
  {
    name: "عبدالله الشرفات",
    totalSales: 1195,
    totalTransactions: 446,
    annualVisitsAvg: 104,
    avgBasketValue: 61,
    discountUsagePct: 37,
    segment: "High Recency, High Frequency",
  },
  {
    name: "أحمد العواودة",
    totalSales: 540,
    totalTransactions: 210,
    annualVisitsAvg: 92,
    avgBasketValue: 58,
    discountUsagePct: 35,
    segment: "High Recency, High Frequency",
  },
  {
    name: "سامي الخليل",
    totalSales: 85,
    totalTransactions: 30,
    annualVisitsAvg: 44,
    avgBasketValue: 31,
    discountUsagePct: 22,
    segment: "High Recency, Low Frequency",
  },
  {
    name: "رنا المومني",
    totalSales: 420,
    totalTransactions: 160,
    annualVisitsAvg: 88,
    avgBasketValue: 56,
    discountUsagePct: 34,
    segment: "High Recency, High Frequency",
  },
  {
    name: "خالد الزعبي",
    totalSales: 22,
    totalTransactions: 8,
    annualVisitsAvg: 16,
    avgBasketValue: 17,
    discountUsagePct: 12,
    segment: "Low Recency, Low Frequency",
  },
  {
    name: "نور السلطي",
    totalSales: 148,
    totalTransactions: 55,
    annualVisitsAvg: 56,
    avgBasketValue: 41,
    discountUsagePct: 29,
    segment: "High Recency, High Frequency",
  },
  {
    name: "ليلى حداد",
    totalSales: 55,
    totalTransactions: 20,
    annualVisitsAvg: 28,
    avgBasketValue: 24,
    discountUsagePct: 19,
    segment: "Low Recency, High Frequency",
  },
  {
    name: "محمود الطراونة",
    totalSales: 780,
    totalTransactions: 290,
    annualVisitsAvg: 98,
    avgBasketValue: 63,
    discountUsagePct: 39,
    segment: "High Recency, High Frequency",
  },
  {
    name: "دينا العزام",
    totalSales: 11,
    totalTransactions: 4,
    annualVisitsAvg: 6,
    avgBasketValue: 11,
    discountUsagePct: 7,
    segment: "Low Recency, Low Frequency",
  },
];

const maxSales = Math.max(...customers.map((c) => c.totalSales));
const maxTrans = Math.max(...customers.map((c) => c.totalTransactions));
const maxVisits = Math.max(...customers.map((c) => c.annualVisitsAvg));
const maxBasketValue = Math.max(...customers.map((c) => c.avgBasketValue));
const maxDiscountUsage = Math.max(...customers.map((c) => c.discountUsagePct));

const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(n);

function segmentColor(seg: string) {
  const high = seg.includes("High Recency");
  const freq = seg.includes("High Frequency");
  if (high && freq) return "var(--accent-green)";
  if (high && !freq) return "var(--accent-cyan)";
  if (!high && freq) return "var(--accent-amber)";
  return "var(--text-muted)";
}

type ClvSegment = "High" | "Medium" | "Low";
function clvSegmentFor(c: Customer): ClvSegment {
  if (c.totalSales >= 300) return "High";
  if (c.totalSales >= 60) return "Medium";
  return "Low";
}
function clvColor(seg: ClvSegment) {
  if (seg === "High")
    return { text: "var(--accent-green)", bg: "var(--accent-green-dim)" };
  if (seg === "Medium")
    return { text: "var(--accent-amber)", bg: "rgba(245,158,11,0.1)" };
  return { text: "var(--text-muted)", bg: "var(--bg-elevated)" };
}

type SortKey =
  | "name"
  | "totalSales"
  | "totalTransactions"
  | "annualVisitsAvg"
  | "avgBasketValue"
  | "discountUsagePct";

export default function CustomerInsightsTable() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalSales");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...customers]
      .filter((c) => c.name.includes(q) || c.segment.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = a[sortKey],
          bv = b[sortKey];
        if (typeof av === "string" && typeof bv === "string")
          return sortDir === "asc"
            ? av.localeCompare(bv)
            : bv.localeCompare(av);
        return sortDir === "desc"
          ? (bv as number) - (av as number)
          : (av as number) - (bv as number);
      });
  }, [search, sortKey, sortDir]);

  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "desc" ? (
        <ChevronDown size={10} />
      ) : (
        <ChevronUp size={10} />
      )
    ) : (
      <ChevronDown size={10} style={{ opacity: 0.25 }} />
    );

  const sortHeaderLabel = (label: string, k?: SortKey) => (
    <div className="flex items-center gap-0.5 justify-center">
      {label}
      {k && <SortIcon k={k} />}
    </div>
  );

  return (
    <AnalyticsTableCard
      title="مصفوفة تحليل العملاء"
      flag="green"
      subtitles={
        <p
          className="text-[10px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          Customer Insights — {filtered.length} عميل
        </p>
      }
      headerExtra={
        <div
          className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            minWidth: 220,
          }}
        >
          <Search size={13} style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="بحث باسم العميل..."
            className="bg-transparent outline-none text-xs w-full"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      }
    >
      <AnalyticsTable
        headers={[
          { label: sortHeaderLabel("اسم العميل", "name"), align: "right" },
          {
            label: sortHeaderLabel("إجمالي المبيعات", "totalSales"),
            align: "center",
          },
          {
            label: sortHeaderLabel("عدد الفواتير", "totalTransactions"),
            align: "center",
          },
          {
            label: sortHeaderLabel(
              "متوسط عدد الزيارات السنوية",
              "annualVisitsAvg",
            ),
            align: "center",
          },
          {
            label: sortHeaderLabel("متوسط قيمة السلة", "avgBasketValue"),
            align: "center",
          },
          {
            label: sortHeaderLabel("الاستفادة من الخصومات", "discountUsagePct"),
            align: "center",
          },
          { label: "شريحة", align: "center" },
          { label: "شريحة العميل", align: "center" },
        ]}
      >
        {pageData.map((c, i) => {
          const clvSeg = clvSegmentFor(c);
          const clvStyle = clvColor(clvSeg);
          return (
            <motion.tr
              key={c.name}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="hover:bg-white/1.5 transition-colors"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <td
                style={{
                  ...analyticsTdBaseStyle("right"),
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {c.name}
              </td>

              <AnalyticsBarCell
                value={c.totalSales}
                max={maxSales}
                color="#3b82f6"
                text={fmtN(c.totalSales)}
              />
              <AnalyticsBarCell
                value={c.totalTransactions}
                max={maxTrans}
                color="#3b82f6"
                text={fmtN(c.totalTransactions)}
              />
              <AnalyticsBarCell
                value={c.annualVisitsAvg}
                max={maxVisits}
                color="#3b82f6"
                text={fmtN(c.annualVisitsAvg)}
              />
              <AnalyticsBarCell
                value={c.avgBasketValue}
                max={maxBasketValue}
                color="#3b82f6"
                text={fmtN(c.avgBasketValue)}
              />
              <AnalyticsBarCell
                value={c.discountUsagePct}
                max={maxDiscountUsage}
                color="var(--accent-green)"
                text={`${c.discountUsagePct.toFixed(0)}%`}
              />

              <td style={analyticsTdBaseStyle("center")}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: clvStyle.text,
                    background: clvStyle.bg,
                    padding: "2px 8px",
                    borderRadius: 9999,
                    border: "1px solid var(--border-subtle)",
                    display: "inline-block",
                    minWidth: 52,
                    textAlign: "center",
                  }}
                >
                  {clvSeg}
                </span>
              </td>

              <td style={analyticsTdBaseStyle("center")}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: segmentColor(c.segment),
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.segment}
                </span>
              </td>
            </motion.tr>
          );
        })}
      </AnalyticsTable>

      {/* Pagination */}
      <div
        className="px-5 py-3 border-t flex items-center justify-between"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {page * pageSize + 1}–
          {Math.min((page + 1) * pageSize, filtered.length)} من{" "}
          {filtered.length} عميل
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
    </AnalyticsTableCard>
  );
}
