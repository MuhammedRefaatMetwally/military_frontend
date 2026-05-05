import {
  AnalyticsBarCell,
  AnalyticsTable,
  AnalyticsTableHeader,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import SectionTitleWithFlag from "@/components/ui/SectionTitleWithFlag";
import { BranchBaseRow, branches } from "../../utils/branches";
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  expandedCats: Set<string>;
  toggleCat: (cat: string) => void;
}

const headers: AnalyticsTableHeader[] = [
  { label: "الفرع", align: "right" },
  { label: "الفواتير", align: "center" },
  { label: "ف. مخصومة", align: "center" },
  { label: "% الفواتير المخصومة", align: "center" },
  { label: "ف. بدون خصم", align: "center" },
  { label: "متوسط الخصم", align: "center" },
  { label: "مبيعات مخصومة", align: "center" },
  { label: "حجم مخصوم", align: "center" },
  { label: "صافي المبيعات", align: "center" },
  { label: "الخصومات المطبقة", align: "center" },
  { label: "% الاستخدام", align: "center" },
  { label: "متوسط % الخصم", align: "center" },
];

const DiscountPerformanceDetailsByBranch = ({
  expandedCats,
  toggleCat,
}: Props) => {
  return (
    <div className="glass-panel overflow-hidden">
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <SectionTitleWithFlag title="تفاصيل أداء الخصومات حسب الفرع" />
        <p
          className="text-[10px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          Branch Discount Performance Details
        </p>
      </div>
      <div className="overflow-x-auto">
        <AnalyticsTable headers={headers}>
          {branches.map((b) => {
            const isTotal = b.name === "الإجمالي";
            const hasSubs = Array.isArray(b.subs) && b.subs.length > 0;
            const brKey = `br_${b.name}`;
            const isBrOpen = expandedCats.has(brKey);

            const renderCells = (row: BranchBaseRow, isProd = false) => (
              <>
                <td style={analyticsTdBaseStyle("center")} dir="ltr">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row.invoices.toFixed(isProd ? 0 : 2)}
                  </span>
                </td>
                <td style={analyticsTdBaseStyle("center")} dir="ltr">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row.discInv}
                  </span>
                </td>
                <AnalyticsBarCell
                  value={row.discRate}
                  max={100}
                  color="#3b82f6"
                  text={`${row.discRate.toFixed(2)}%`}
                />
                <td style={analyticsTdBaseStyle("center")} dir="ltr">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row.noDiscInv}
                  </span>
                </td>
                <td style={analyticsTdBaseStyle("center")} dir="ltr">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row.avgDisc.toFixed(2)}
                  </span>
                </td>
                <td style={analyticsTdBaseStyle("center")} dir="ltr">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row.discSales.toFixed(2)}
                  </span>
                </td>
                <td style={analyticsTdBaseStyle("center")} dir="ltr">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row.discVol}
                  </span>
                </td>
                <td style={analyticsTdBaseStyle("center")} dir="ltr">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row.netSales.toFixed(2)}
                  </span>
                </td>
                <td style={analyticsTdBaseStyle("center")} dir="ltr">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row.appDisc.toFixed(2)}
                  </span>
                </td>
                <td style={analyticsTdBaseStyle("center")} dir="ltr">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row.utilRate.toFixed(2)}%
                  </span>
                </td>
                <td style={analyticsTdBaseStyle("center")} dir="ltr">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row.avgDiscRate.toFixed(2)}%
                  </span>
                </td>
              </>
            );

            return (
              <React.Fragment key={b.name}>
                {/* صف الفرع */}
                <tr
                  onClick={() => (hasSubs ? toggleCat(brKey) : undefined)}
                  className={
                    isTotal ? "" : "hover:bg-white/1.5 transition-colors"
                  }
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    background: isTotal
                      ? "var(--accent-green-dim)"
                      : isBrOpen
                        ? "rgba(4,120,87,0.04)"
                        : "transparent",
                    fontWeight: isTotal ? 700 : 400,
                    cursor: hasSubs ? "pointer" : "default",
                  }}
                >
                  <td
                    style={{
                      ...analyticsTdBaseStyle("right"),
                      fontSize: 11,
                      fontWeight: isTotal ? 700 : 600,
                      color: isTotal
                        ? "var(--accent-green)"
                        : "var(--text-primary)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {hasSubs && (
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
                      )}
                      {b.name}
                      {hasSubs && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{
                            background: "var(--bg-elevated)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {b.subs?.length ?? 0}
                        </span>
                      )}
                    </div>
                  </td>
                  {renderCells(b)}
                </tr>

                {/* صفوف الفئات (sub) */}
                <AnimatePresence initial={false}>
                  {isBrOpen &&
                    hasSubs &&
                    b.subs!.map((sub, si: number) => {
                      const subKey = `brs_${b.name}_${sub.name}`;
                      const isSubOpen = expandedCats.has(subKey);
                      return (
                        <React.Fragment key={sub.name}>
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18, delay: si * 0.03 }}
                            onClick={() => toggleCat(subKey)}
                            className="cursor-pointer hover:bg-white/1.5 transition-colors"
                            style={{
                              borderBottom: "1px solid var(--border-subtle)",
                              background: isSubOpen
                                ? "rgba(8,145,178,0.04)"
                                : "rgba(4,120,87,0.02)",
                            }}
                          >
                            <td
                              style={{
                                ...analyticsTdBaseStyle("right"),
                                padding: "6px 10px 6px 28px",
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
                            {renderCells(sub, true)}
                          </motion.tr>

                          {/* صفوف المنتجات (sub al sub) */}
                          <AnimatePresence initial={false}>
                            {isSubOpen &&
                              sub.products.map((prod, pi: number) => (
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
                                      ...analyticsTdBaseStyle("right"),
                                      padding: "5px 10px 5px 48px",
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
                                  {renderCells(prod, true)}
                                </motion.tr>
                              ))}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
        </AnalyticsTable>
      </div>
    </div>
  );
};

export default DiscountPerformanceDetailsByBranch;
