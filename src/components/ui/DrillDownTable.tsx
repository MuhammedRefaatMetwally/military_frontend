"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";

// ── Deterministic seeded random ──
let _s = 77;
const sr = () => {
  _s = (_s * 16807) % 2147483647;
  return (_s & 0x7fffffff) / 2147483647;
};

// ── Types ──
interface RowData {
  name: string;
  grossSales: number;
  netSales: number;
  invoiceCount: number;
  discountValue: number;
  discountPct: number;
  returns: number;
  returnedItemCount: number;
  productVolume: number;
  itemCount: number;
  soldMaterialsValue: number;
  avgPrice: number;
  avgDiscRate: number;
  children?: RowData[];
}

// ── Generate data ──
const PRODUCTS = [
  "أرز بسمتي ممتاز",
  "أرز حبة متوسطة",
  "زيت زيتون بكر",
  "زيت عباد شمس",
  "حليب طازج كامل",
  "لبن زبادي",
  "سكر أبيض 1كغ",
  "شاي أسود سيلاني",
  "معكرونة سباغيتي",
  "تونة معلبة",
  "فول مدمس",
  "حمص بالطحينة",
  "دجاج مجمد",
  "صدور دجاج",
  "لحمة مفرومة",
  "خبز عربي",
  "صابون غسيل",
  "منظف أرضيات",
  "شامبو ضد القشرة",
  "حفاضات أطفال",
  "مياه معدنية",
  "عصير برتقال",
  "مشروب غازي",
  "بسكويت شوكولاتة",
  "شيبس مملح",
  "مكسرات مشكلة",
  "بطاريات AA",
  "مناديل ورقية",
];

const CATEGORIES = [
  "منتجات غذائية",
  "مستلزمات منزلية",
  "العناية الشخصية",
  "مشروبات",
  "لحوم ودواجن",
  "حلويات وسناكات",
  "مستلزمات الأطفال",
  "منتجات ورقية",
];

const BRANCHES = [
  "سوق المنارة",
  "سوق سلاح الجو",
  "فرع عمّان الغربي",
  "فرع إربد",
  "فرع الزرقاء",
];

/** فرع واحد بإجمالي مرتجع منخفض (~٥–٨) للاختبار؛ يُوزَّع على صفوف المادة كوحدات ١ حتى تبقى المجاميع متسقة. */
const LOW_RETURNS_TEST_BRANCH_IDX = 0;

function mkRow(
  name: string,
  base: number,
  branchIdx: number = 0,
  lowReturnsBudget?: { n: number },
): Omit<RowData, "children"> {
  const gross = Math.round(base + sr() * base * 0.3);
  const net = Math.round(gross * (0.95 + sr() * 0.04));
  const tierBoost = [0, 0.012, 0.028, 0.05, 0.082][branchIdx % 5];
  let returns: number;
  if (lowReturnsBudget) {
    if (lowReturnsBudget.n > 0) {
      lowReturnsBudget.n -= 1;
      returns = 1;
    } else {
      returns = 0;
    }
  } else {
    returns = Math.round(
      gross * Math.min(0.125, 0.002 + sr() * 0.035 + tierBoost),
    );
  }
  const discountValue = Math.max(0, gross - net);
  const discountPct =
    gross > 0 ? Number(((discountValue / gross) * 100).toFixed(2)) : 0;
  const soldMaterialsValue = Math.max(0, gross - returns);
  const vol = Math.round(gross / (1.5 + sr() * 3));
  const returnedItemCount =
    returns <= 0
      ? 0
      : lowReturnsBudget !== undefined
        ? 1
        : Math.max(1, Math.min(vol, Math.round(1 + sr() * 5)));
  const invoiceCount = Math.max(1, Math.round(vol * (0.15 + sr() * 1.2)));
  const avgPrice = vol > 0 ? Number((gross / vol).toFixed(2)) : 0;
  const avgDiscRate =
    net > 0 ? Number(((discountValue / net) * 100).toFixed(2)) : 0;
  return {
    name,
    grossSales: gross,
    netSales: net,
    invoiceCount,
    discountValue,
    discountPct,
    returns,
    returnedItemCount,
    productVolume: vol,
    itemCount: 1,
    soldMaterialsValue,
    avgPrice,
    avgDiscRate,
  };
}

/** Aggregate metrics from child rows (سوق → مجموعات → مادة). */
function buildParent(name: string, children: RowData[]): RowData {
  const grossSales = children.reduce((s, r) => s + r.grossSales, 0);
  const netSales = children.reduce((s, r) => s + r.netSales, 0);
  const discountValue = children.reduce((s, r) => s + r.discountValue, 0);
  const returns = children.reduce((s, r) => s + r.returns, 0);
  const returnedItemCount = children.reduce(
    (s, r) => s + r.returnedItemCount,
    0,
  );
  const invoiceCount = children.reduce((s, r) => s + r.invoiceCount, 0);
  const productVolume = children.reduce((s, r) => s + r.productVolume, 0);
  const itemCount = children.reduce((s, r) => s + r.itemCount, 0);
  const soldMaterialsValue = children.reduce(
    (s, r) => s + r.soldMaterialsValue,
    0,
  );
  const discountPct =
    grossSales > 0
      ? Number(((discountValue / grossSales) * 100).toFixed(2))
      : 0;
  const avgPrice =
    productVolume > 0 ? Number((grossSales / productVolume).toFixed(2)) : 0;
  const avgDiscRate =
    netSales > 0 ? Number(((discountValue / netSales) * 100).toFixed(2)) : 0;
  return {
    name,
    grossSales,
    netSales,
    discountValue,
    discountPct,
    returns,
    returnedItemCount,
    invoiceCount,
    productVolume,
    itemCount,
    soldMaterialsValue,
    avgPrice,
    avgDiscRate,
    children,
  };
}

_s = 77;
/** التسلسل الهرمي: سوق → المجموعة الاولى → المجموعة الثانية → المجموعة الثالثة → المادة */
const tableData: RowData[] = BRANCHES.map((branch, bi) => {
  const lowReturnsBudget =
    bi === LOW_RETURNS_TEST_BRANCH_IDX
      ? { n: Math.round(5 + sr() * 3) }
      : undefined;
  const bBase = 40000 + sr() * 160000;
  const g1List: RowData[] = [];
  for (let g1 = 0; g1 < 2; g1++) {
    const g1Base = (bBase / 2) * (0.45 + sr() * 0.15);
    const g1Name = `المجموعة الاولى — ${CATEGORIES[(g1 * 3) % CATEGORIES.length]}`;
    const g2List: RowData[] = [];
    for (let g2 = 0; g2 < 2; g2++) {
      const g2Base = (g1Base / 2) * (0.45 + sr() * 0.15);
      const g2Name = `المجموعة الثانية — ${CATEGORIES[(g1 + g2 * 2) % CATEGORIES.length]}`;
      const g3List: RowData[] = [];
      for (let g3 = 0; g3 < 2; g3++) {
        const g3Base = (g2Base / 2) * (0.45 + sr() * 0.15);
        const g3Name = `المجموعة الثالثة — ${CATEGORIES[(g1 + g2 + g3) % CATEGORIES.length]}`;
        const prods: RowData[] = [];
        const pCount = 2 + Math.round(sr() * 3);
        for (let p = 0; p < pCount; p++) {
          prods.push(
            mkRow(
              PRODUCTS[Math.round(sr() * 1000) % PRODUCTS.length],
              (g3Base / pCount) * (0.4 + sr() * 0.3),
              bi,
              lowReturnsBudget,
            ),
          );
        }
        g3List.push(buildParent(g3Name, prods));
      }
      g2List.push(buildParent(g2Name, g3List));
    }
    g1List.push(buildParent(g1Name, g2List));
  }
  return buildParent(branch, g1List);
});

/** Keys of this row and every nested row (same pattern as `root-0-1-…` in render). */
function collectDescendantRowKeys(row: RowData, rowKey: string): string[] {
  const keys: string[] = [];
  if (!row.children?.length) return keys;
  row.children.forEach((child, ci) => {
    const childKey = `${rowKey}-${ci}`;
    keys.push(childKey, ...collectDescendantRowKeys(child, childKey));
  });
  return keys;
}

// ── Columns definition ──
const COLUMNS = [
  { key: "grossSales", label: "إجمالي المبيعات", labelEn: "Gross Sales" },
  { key: "netSales", label: "صافي المبيعات", labelEn: "Net Sales" },
  { key: "invoiceCount", label: "عدد الفواتير", labelEn: "Invoice count" },
  { key: "discountValue", label: "قيمة الخصم", labelEn: "Discount Value" },
  { key: "discountPct", label: "نسبة الخصم", labelEn: "Discount %" },
  { key: "returns", label: "المرتجع", labelEn: "Returns" },
  {
    key: "returnedItemCount",
    label: "عدد المواد المرتجعة",
    labelEn: "Returned SKUs",
  },
  { key: "productVolume", label: "الكمية", labelEn: "Quantity" },
  { key: "itemCount", label: "عدد المواد", labelEn: "SKU Count" },
  {
    key: "soldMaterialsValue",
    label: "سعر المواد المباعة",
    labelEn: "Sold Materials Value",
  },
  { key: "avgPrice", label: "متوسط السعر", labelEn: "Avg. Price" },
  { key: "avgDiscRate", label: "متوسط نسبة الخصم", labelEn: "Avg. Discount %" },
];

/** شرائح لون عمود المرتجع: نسبة المرتجع على الإجمالي (مرتجع / إجمالي × 100). */
const RETURNS_TIERS = [
  { maxExclusive: 1, color: "#0a0a0a", labelAr: "أقل من ١٪" },
  { maxExclusive: 3, color: "#ea580c", labelAr: "١٪ – أقل من ٣٪" },
  { maxExclusive: 5, color: "#fb7185", labelAr: "٣٪ – أقل من ٥٪" },
  { maxExclusive: 10, color: "#dc2626", labelAr: "٥٪ – أقل من ١٠٪" },
  { maxExclusive: Infinity, color: "#7f1d1d", labelAr: "١٠٪ فأكثر" },
] as const;

function returnsTextColor(grossSales: number, returns: number): string {
  if (grossSales <= 0) return RETURNS_TIERS[0].color;
  const rate = (returns / grossSales) * 100;
  for (const tier of RETURNS_TIERS) {
    if (rate < tier.maxExclusive) return tier.color;
  }
  return RETURNS_TIERS[RETURNS_TIERS.length - 1].color;
}

// ── Main Component ──
export default function DrillDownTable() {
  /** Only `true` means open; missing/`false` = closed (default closed for every row). */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (rowKey: string, row: RowData) => {
    setExpanded((prev) => {
      const isOpen = prev[rowKey] === true;
      if (isOpen) {
        const next: Record<string, boolean> = { ...prev };
        next[rowKey] = false;
        for (const d of collectDescendantRowKeys(row, rowKey)) {
          delete next[d];
        }
        return next;
      }
      return { ...prev, [rowKey]: true };
    });
  };

  // Compute totals (جمع ثم إعادة حساب النِسَب والمتوسطات المركّبة)
  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    COLUMNS.forEach((c) => {
      t[c.key] = 0;
    });
    const sumKeys = [
      "grossSales",
      "netSales",
      "invoiceCount",
      "discountValue",
      "returns",
      "returnedItemCount",
      "productVolume",
      "itemCount",
      "soldMaterialsValue",
    ] as const;
    tableData.forEach((b) => {
      sumKeys.forEach((k) => {
        t[k] += b[k];
      });
    });
    t.discountPct =
      t.grossSales > 0
        ? Number(((t.discountValue / t.grossSales) * 100).toFixed(2))
        : 0;
    t.avgPrice =
      t.productVolume > 0
        ? Number((t.grossSales / t.productVolume).toFixed(2))
        : 0;
    t.avgDiscRate =
      t.netSales > 0
        ? Number(((t.discountValue / t.netSales) * 100).toFixed(2))
        : 0;
    return t;
  }, []);

  const maxGross = useMemo(
    () => Math.max(...tableData.map((b) => b.grossSales)),
    [],
  );
  const maxByKey = useMemo(() => {
    const allRows: RowData[] = [];
    const walk = (r: RowData) => {
      allRows.push(r);
      r.children?.forEach(walk);
    };
    tableData.forEach(walk);
    const m: Record<string, number> = {};
    COLUMNS.forEach((c) => {
      m[c.key] = Math.max(
        1,
        ...allRows.map((r) => (r as any)[c.key] as number),
      );
    });
    return m;
  }, []);

  const fmt = (v: number, key: string) => {
    if (key === "avgPrice") return v.toFixed(2);
    if (key === "discountPct" || key === "avgDiscRate")
      return `${v.toFixed(2)}%`;
    if (
      key === "itemCount" ||
      key === "invoiceCount" ||
      key === "returnedItemCount"
    )
      return Math.round(v).toLocaleString("en-US");
    if (key === "returns") return v.toFixed(2);
    return v.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderRow = (
    row: RowData,
    level: number,
    parentKey: string,
    idx: number,
  ) => {
    const key = `${parentKey}-${idx}`;
    const hasChildren = row.children && row.children.length > 0;
    const isOpen = expanded[key] === true;
    const indent = level * 24;

    const levelColors = [
      "var(--text-primary)", // سوق
      "var(--accent-green)", // المجموعة الاولى
      "var(--accent-cyan)", // المجموعة الثانية
      "var(--accent-blue)", // المجموعة الثالثة
      "var(--text-secondary)", // المادة
    ];
    const chevronIconOpen = [
      "var(--accent-green)",
      "var(--accent-green)",
      "var(--accent-cyan)",
      "var(--accent-blue)",
    ];
    const colorIdx = Math.min(level, levelColors.length - 1);
    const chevronIdx = Math.min(level, chevronIconOpen.length - 1);

    const rowBgByLevel = [
      isOpen ? "rgba(4,120,87,0.04)" : "transparent",
      isOpen ? "rgba(8,145,178,0.04)" : "rgba(4,120,87,0.02)",
      "rgba(8,145,178,0.02)",
      "rgba(8,145,178,0.02)",
      "transparent",
    ];

    const rows: React.ReactNode[] = [];

    rows.push(
      <tr
        key={key}
        className={
          hasChildren
            ? "cursor-pointer hover:bg-white/1.5 transition-colors"
            : undefined
        }
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: rowBgByLevel[Math.min(level, rowBgByLevel.length - 1)],
        }}
        onClick={() => hasChildren && toggle(key, row)}
      >
        {/* Name column */}
        <td
          style={{
            ...analyticsTdBaseStyle("right"),
            paddingRight: `${indent + 12}px`,
          }}
        >
          <div className="flex items-center gap-1.5">
            {hasChildren ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "16px",
                  height: "16px",
                  borderRadius: "4px",
                  background: isOpen
                    ? "rgba(0,229,160,0.11)"
                    : "var(--bg-elevated)",
                  transition: "all 0.2s",
                }}
              >
                {isOpen ? (
                  <ChevronDown
                    size={11}
                    style={{ color: chevronIconOpen[chevronIdx] }}
                  />
                ) : (
                  <ChevronLeft
                    size={11}
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
              </span>
            ) : (
              <span style={{ width: "16px", display: "inline-block" }} />
            )}
            <span
              className="text-xs font-medium"
              style={{ color: levelColors[colorIdx] }}
            >
              {row.name}
            </span>
          </div>
        </td>

        {/* Data columns */}
        {COLUMNS.map((col) => {
          const val = (row as any)[col.key] as number;
          const isReturnsCol = col.key === "returns";
          const isDiscPct = col.key === "discountPct";
          const isAvgDisc = col.key === "avgDiscRate";

          if (isReturnsCol) {
            return (
              <td key={col.key} style={analyticsTdBaseStyle("center")}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: returnsTextColor(row.grossSales, row.returns),
                  }}
                  dir="ltr"
                >
                  {fmt(val, col.key)}
                </span>
              </td>
            );
          }

          if (isDiscPct || isAvgDisc) {
            return (
              <td key={col.key} style={analyticsTdBaseStyle("center")}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                  dir="ltr"
                >
                  {fmt(val, col.key)}
                </span>
              </td>
            );
          }

          return (
            <AnalyticsBarCell
              key={col.key}
              value={val}
              max={maxByKey[col.key] ?? maxGross}
              color={isReturnsCol ? "#ef4444" : "#3b82f6"}
              text={fmt(val, col.key)}
            />
          );
        })}
      </tr>,
    );

    // Render children
    if (hasChildren && isOpen) {
      row.children!.forEach((child, ci) => {
        rows.push(...renderRow(child, level + 1, key, ci));
      });
    }

    return rows;
  };

  return (
    <AnalyticsTableCard
      title="تحليل المبيعات التفصيلي — سوق / مجموعات / مادة"
      flag="green"
      titleFlagNumber={5}
      subtitles={
        <>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            التسلسل الهرمي: سوق — المجموعة الاولى — المجموعة الثانية — المجموعة
            الثالثة — المادة
          </p>
        </>
      }
      headerExtra={
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          <span
            className="font-medium shrink-0"
            style={{ color: "var(--text-secondary)" }}
          >
            ألوان المرتجع (نسبة المرتجع / الإجمالي):
          </span>
          {RETURNS_TIERS.map((tier) => (
            <span key={tier.labelAr} className="inline-flex items-center gap-1">
              <span
                className="inline-block rounded-sm shrink-0"
                style={{
                  width: 10,
                  height: 10,
                  background: tier.color,
                  border: "1px solid var(--border-subtle)",
                }}
              />
              <span>{tier.labelAr}</span>
            </span>
          ))}
        </div>
      }
    >
      <AnalyticsTable
        minWidth="1620px"
        headers={[
          { label: "الاسم", align: "right", width: "160px" },
          ...COLUMNS.map((c) => ({
            label: c.label,
            align: "center" as const,
            width: "110px" as const,
          })),
        ]}
      >
        {tableData.flatMap((branch, bi) => renderRow(branch, 0, "root", bi))}

        {/* Total row */}
        <tr
          style={{
            background: "var(--accent-green-dim)",
            borderTop: "2px solid rgba(0,229,160,0.3)",
          }}
        >
          <td style={analyticsTdBaseStyle("right")}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--accent-green)",
              }}
            >
              الإجمالي — Total
            </span>
          </td>
          {COLUMNS.map((col) => {
            const totalColor =
              col.key === "returns"
                ? returnsTextColor(totals.grossSales, totals.returns)
                : "var(--text-secondary)";
            return (
              <td key={col.key} style={analyticsTdBaseStyle("center")}>
                <span
                  style={{ fontSize: 10, fontWeight: 700, color: totalColor }}
                  dir="ltr"
                >
                  {fmt((totals as any)[col.key] as number, col.key)}
                </span>
              </td>
            );
          })}
        </tr>
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
}
