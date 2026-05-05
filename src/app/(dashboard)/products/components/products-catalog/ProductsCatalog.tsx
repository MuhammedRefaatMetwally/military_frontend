import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import { getProductData, ProductData } from "@/lib/mockData";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";

type CatalogRow = {
  name: string;
  categoryAr?: string;
  price?: number;
  netSalesValue: number;
  netSalesPct: number; // 0..100
  soldCount: number;
  marginPct?: number; // 0..100 (leaf: product margin)
  children?: CatalogRow[];
};

const products = getProductData();
const fmtCurrency = (v: number) => `${Number(v).toLocaleString("en-US")} د.أ`;
const fmtPct = (v: number) => `${v.toFixed(2)}%`;
const fmtInt = (v: number) => Math.round(v).toLocaleString("en-US");

const ProductsCatalog = () => {
  const [catalogExpanded, setCatalogExpanded] = useState<
    Record<string, boolean>
  >({});
  const catalogTableData: CatalogRow[] = useMemo(() => {
    const total = products.reduce((s, p) => s + Number(p.revenue ?? 0), 0);
    const toG3 = (trend: ProductData["trend"]) =>
      trend === "up" ? "مرتفع" : trend === "stable" ? "متوسط" : "منخفض";

    const g1Map = new Map<string, ProductData[]>();
    for (const p of products) {
      const g1 = String(p.categoryAr ?? "غير مصنف");
      const arr = g1Map.get(g1) ?? [];
      arr.push(p);
      g1Map.set(g1, arr);
    }

    const buildLeaf = (p: ProductData): CatalogRow => {
      const netSalesValue = Number(p.revenue ?? 0);
      const soldCount = Number(p.unitsSold ?? 0);
      const netSalesPct = total > 0 ? (netSalesValue / total) * 100 : 0;
      return {
        name: String(p.nameAr ?? p.name ?? "—"),
        categoryAr: String(p.categoryAr ?? "—"),
        price: Number(p.price ?? 0),
        netSalesValue,
        netSalesPct,
        soldCount,
        marginPct: Number(p.margin ?? 0),
      };
    };

    const buildParent = (
      name: string,
      children: CatalogRow[],
      meta?: { categoryAr?: string },
    ): CatalogRow => {
      const netSalesValue = children.reduce((s, r) => s + r.netSalesValue, 0);
      const soldCount = children.reduce((s, r) => s + r.soldCount, 0);
      const netSalesPct = total > 0 ? (netSalesValue / total) * 100 : 0;
      const marginPct =
        netSalesValue > 0
          ? children.reduce(
              (s, r) =>
                s + (r.marginPct ?? 0) * (r.netSalesValue / netSalesValue),
              0,
            )
          : 0;
      const price =
        soldCount > 0
          ? children.reduce(
              (s, r) => s + (r.price ?? 0) * (r.soldCount / soldCount),
              0,
            )
          : 0;
      return {
        name,
        categoryAr: meta?.categoryAr,
        price,
        netSalesValue,
        netSalesPct,
        soldCount,
        marginPct,
        children,
      };
    };

    const out: CatalogRow[] = [];
    for (const [g1, g1Products] of g1Map.entries()) {
      const g2Map = new Map<string, ProductData[]>();
      for (const p of g1Products) {
        const g2 = String(p.subcategory ?? "غير محدد");
        const arr = g2Map.get(g2) ?? [];
        arr.push(p);
        g2Map.set(g2, arr);
      }

      const g2Rows: CatalogRow[] = [];
      for (const [g2, g2Products] of g2Map.entries()) {
        const g3Map = new Map<string, ProductData[]>();
        for (const p of g2Products) {
          const g3 = toG3(p.trend);
          const arr = g3Map.get(g3) ?? [];
          arr.push(p);
          g3Map.set(g3, arr);
        }

        const g3Rows: CatalogRow[] = [];
        for (const [g3, g3Products] of g3Map.entries()) {
          const leaves = g3Products
            .slice()
            .sort((a, b) => Number(b.revenue ?? 0) - Number(a.revenue ?? 0))
            .map(buildLeaf);
          g3Rows.push(
            buildParent(`المجموعة الثالثة — ${g3}`, leaves, { categoryAr: g3 }),
          );
        }

        g3Rows.sort((a, b) => b.netSalesValue - a.netSalesValue);
        g2Rows.push(
          buildParent(`المجموعة الثانية — ${g2}`, g3Rows, { categoryAr: g2 }),
        );
      }

      g2Rows.sort((a, b) => b.netSalesValue - a.netSalesValue);
      out.push(
        buildParent(`المجموعة الأولى — ${g1}`, g2Rows, { categoryAr: g1 }),
      );
    }

    out.sort((a, b) => b.netSalesValue - a.netSalesValue);
    return out;
  }, []);
  const catalogMaxSoldCount = useMemo(() => {
    const all: CatalogRow[] = [];
    const walk = (r: CatalogRow) => {
      all.push(r);
      r.children?.forEach(walk);
    };
    catalogTableData.forEach(walk);
    return Math.max(1, ...all.map((r) => r.soldCount));
  }, [catalogTableData]);
  const catalogMaxMarginPct = useMemo(() => {
    const all: CatalogRow[] = [];
    const walk = (r: CatalogRow) => {
      all.push(r);
      r.children?.forEach(walk);
    };
    catalogTableData.forEach(walk);
    return Math.max(1, ...all.map((r) => r.marginPct ?? 0));
  }, [catalogTableData]);

  const catalogTotals = useMemo(() => {
    const walk = (rows: CatalogRow[]) => {
      let netSalesValue = 0;
      let soldCount = 0;
      for (const r of rows) {
        netSalesValue += r.netSalesValue;
        soldCount += r.soldCount;
      }
      return { netSalesValue, soldCount };
    };
    return walk(catalogTableData);
  }, [catalogTableData]);

  const renderCatalogRow = (
    row: CatalogRow,
    level: number,
    parentKey: string,
    idx: number,
  ) => {
    const key = `${parentKey}-${idx}`;
    const hasChildren = !!row.children?.length;
    const isOpen = catalogExpanded[key] === true;
    const indent = level * 24;

    const toggleCatalogRow = (rowKey: string) => {
      setCatalogExpanded((prev) => ({
        ...prev,
        [rowKey]: !(prev[rowKey] === true),
      }));
    };

    // Match DrillDownTable (/sales) colors/backgrounds
    const levelColors = [
      "var(--text-secondary)", // المجموعة الأولى
      "var(--accent-green)", // المجموعة الثانية
      "var(--accent-blue)", // المجموعة الثالثة
      "var(--text-secondary)", // المواد
    ];
    const chevronIconOpen = [
      "var(--accent-green)",
      "var(--accent-cyan)",
      "var(--accent-blue)",
    ];
    const colorIdx = Math.min(level, levelColors.length - 1);
    const chevronIdx = Math.min(level, chevronIconOpen.length - 1);

    const rowBgByLevel = [
      // المجموعة الأولى
      isOpen ? "rgba(4,120,87,0.04)" : "rgba(4,120,87,0.02)",
      // المجموعة الثانية
      isOpen ? "rgba(8,145,178,0.04)" : "rgba(8,145,178,0.02)",
      // المجموعة الثالثة
      "rgba(8,145,178,0.02)",
      // المواد
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
        onClick={() => hasChildren && toggleCatalogRow(key)}
      >
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

        <td style={analyticsTdBaseStyle("center")}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {row.categoryAr ?? "—"}
          </span>
        </td>
        <td style={analyticsTdBaseStyle("center")}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
            dir="ltr"
          >
            {fmtCurrency(row.price ?? 0)}
          </span>
        </td>
        <AnalyticsBarCell
          value={row.netSalesPct}
          max={100}
          color="#3b82f6"
          text={fmtPct(row.netSalesPct)}
        />
        <AnalyticsBarCell
          value={row.soldCount}
          max={catalogMaxSoldCount}
          color="#22c55e"
          text={fmtInt(row.soldCount)}
        />
        <AnalyticsBarCell
          value={row.marginPct ?? 0}
          max={catalogMaxMarginPct}
          color="#a855f7"
          text={fmtPct(row.marginPct ?? 0)}
        />
      </tr>,
    );

    if (hasChildren && isOpen) {
      row.children!.forEach((child, ci) => {
        rows.push(...renderCatalogRow(child, level + 1, key, ci));
      });
    }

    return rows;
  };

  return (
    <AnalyticsTableCard
      title="كتالوج المنتجات"
      flag="green"
      subtitles={
        <>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            الهرم: المجموعة الأولى — المجموعة الثانية — المجموعة الثالثة —
            المواد
          </p>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            صافي المبيعات هنا كنسبة من إجمالي صافي المبيعات • اضغط على أي صف
            للتوسّع
          </p>
        </>
      }
    >
      <AnalyticsTable
        minWidth="980px"
        headers={[
          { label: "المنتج", align: "right", width: "360px" },
          { label: "الفئة", align: "center", width: "160px" },
          { label: "السعر", align: "center", width: "140px" },
          { label: "صافي المبيعات", align: "center", width: "160px" },
          { label: "عدد المواد المباعة", align: "center", width: "160px" },
          { label: "الهامش", align: "center", width: "140px" },
        ]}
      >
        {catalogTableData.flatMap((r, i) => renderCatalogRow(r, 0, "cat", i))}

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
          <td style={analyticsTdBaseStyle("center")}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              —
            </span>
          </td>
          <td style={analyticsTdBaseStyle("center")}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
              dir="ltr"
            >
              —
            </span>
          </td>
          <td style={analyticsTdBaseStyle("center")}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
              dir="ltr"
            >
              {fmtPct(100)}
            </span>
          </td>
          <td style={analyticsTdBaseStyle("center")}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
              dir="ltr"
            >
              {fmtInt(catalogTotals.soldCount)}
            </span>
          </td>
          <td style={analyticsTdBaseStyle("center")}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
              dir="ltr"
            >
              —
            </span>
          </td>
        </tr>
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
};

export default ProductsCatalog;
