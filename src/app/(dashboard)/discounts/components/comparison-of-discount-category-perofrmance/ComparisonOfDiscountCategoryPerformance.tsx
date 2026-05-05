import { motion, AnimatePresence } from "framer-motion";

import {
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import SectionTitleWithFlag from "@/components/ui/SectionTitleWithFlag";
import { categories } from "../../utils/categories";
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { fmt2 } from "../../utils/data";

type Props = {
  expandedCats: Set<string>;
  toggleCat: (cat: string) => void;
};

const ComparisonOfDiscountCategoryPerformance = ({
  expandedCats,
  toggleCat,
}: Props) => {
  return (
    <div className="glass-panel overflow-hidden">
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <SectionTitleWithFlag title="مقارنة أداء فئات الخصم" />
        <p
          className="text-[10px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          Discount Category Comparison — مع/بدون خصومات
        </p>
      </div>
      <div className="overflow-x-auto">
        <AnalyticsTable
          headers={[]}
          thead={
            <>
              <tr
                style={{
                  background: "var(--bg-elevated)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <th
                  style={{
                    padding: "9px 12px",
                    textAlign: "right",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    minWidth: 150,
                    whiteSpace: "nowrap",
                  }}
                >
                  فئة الخصم
                </th>
                <th
                  colSpan={2}
                  style={{
                    padding: "9px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    borderLeft: "1px solid var(--border-subtle)",
                    whiteSpace: "nowrap",
                  }}
                >
                  مع خصومات
                </th>
                <th
                  colSpan={2}
                  style={{
                    padding: "9px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    borderLeft: "1px solid var(--border-subtle)",
                    whiteSpace: "nowrap",
                  }}
                >
                  بدون خصومات
                </th>
              </tr>
              <tr
                style={{
                  background: "var(--bg-elevated)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <th
                  style={{
                    padding: "7px 12px",
                    textAlign: "right",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                />
                <th
                  style={{
                    padding: "7px 12px",
                    textAlign: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    borderLeft: "1px solid var(--border-subtle)",
                    whiteSpace: "nowrap",
                  }}
                >
                  % هامش الربح
                </th>
                <th
                  style={{
                    padding: "7px 12px",
                    textAlign: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  % مساهمة المبيعات
                </th>
                <th
                  style={{
                    padding: "7px 12px",
                    textAlign: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    borderLeft: "1px solid var(--border-subtle)",
                    whiteSpace: "nowrap",
                  }}
                >
                  % هامش الربح
                </th>
                <th
                  style={{
                    padding: "7px 12px",
                    textAlign: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  % مساهمة المبيعات
                </th>
              </tr>
            </>
          }
        >
          {categories.map((c) => {
            const isOpen = expandedCats.has(c.name);
            return (
              <React.Fragment key={c.name}>
                {/* صف الفئة */}
                <tr
                  onClick={() => toggleCat(c.name)}
                  className="transition-colors cursor-pointer"
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    background: isOpen ? "rgba(0,229,160,0.04)" : "transparent",
                  }}
                >
                  <td
                    style={{
                      ...analyticsTdBaseStyle("right"),
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
                          transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                        }}
                      >
                        <ChevronDown size={13} />
                      </span>
                      {c.name}
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {c.products.length}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      ...analyticsTdBaseStyle("center"),
                      padding: "8px 12px",
                      borderLeft: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color:
                          c.withMargin > 50
                            ? "var(--accent-green)"
                            : c.withMargin > 30
                              ? "var(--accent-amber)"
                              : "var(--accent-red)",
                      }}
                      dir="ltr"
                    >
                      {fmt2(c.withMargin)}%
                    </span>
                  </td>
                  <td
                    style={{
                      ...analyticsTdBaseStyle("center"),
                      padding: "8px 12px",
                    }}
                  >
                    <span
                      style={{ fontSize: 10, color: "var(--text-secondary)" }}
                      dir="ltr"
                    >
                      {fmt2(c.withSales)}%
                    </span>
                  </td>
                  <td
                    style={{
                      ...analyticsTdBaseStyle("center"),
                      padding: "8px 12px",
                      borderLeft: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color:
                          c.noMargin > 50
                            ? "var(--accent-green)"
                            : c.noMargin > 30
                              ? "var(--accent-amber)"
                              : "var(--text-muted)",
                      }}
                      dir="ltr"
                    >
                      {fmt2(c.noMargin)}%
                    </span>
                  </td>
                  <td
                    style={{
                      ...analyticsTdBaseStyle("center"),
                      padding: "8px 12px",
                    }}
                  >
                    <span
                      style={{ fontSize: 10, color: "var(--text-muted)" }}
                      dir="ltr"
                    >
                      {fmt2(c.noSales)}%
                    </span>
                  </td>
                </tr>

                {/* صفوف المنتجات */}
                <AnimatePresence initial={false}>
                  {isOpen &&
                    c.products.map((p, pi) => (
                      <motion.tr
                        key={p.name}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18, delay: pi * 0.03 }}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          background: "rgba(0,229,160,0.02)",
                        }}
                      >
                        <td
                          style={{
                            ...analyticsTdBaseStyle("right"),
                            padding: "6px 12px 6px 30px",
                            fontSize: 10,
                            color: "var(--text-secondary)",
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <ChevronRight
                              size={10}
                              style={{
                                color: "var(--accent-green)",
                                opacity: 0.5,
                              }}
                            />
                            {p.name}
                          </div>
                        </td>
                        <td
                          style={{
                            ...analyticsTdBaseStyle("center"),
                            padding: "6px 12px",
                            borderLeft: "1px solid var(--border-subtle)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 600,
                              color:
                                p.withMargin > 50
                                  ? "var(--accent-green)"
                                  : p.withMargin > 30
                                    ? "var(--accent-amber)"
                                    : "var(--accent-red)",
                            }}
                            dir="ltr"
                          >
                            {fmt2(p.withMargin)}%
                          </span>
                        </td>
                        <td
                          style={{
                            ...analyticsTdBaseStyle("center"),
                            padding: "6px 12px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9.5,
                              color: "var(--text-muted)",
                            }}
                            dir="ltr"
                          >
                            {fmt2(p.withSales)}%
                          </span>
                        </td>
                        <td
                          style={{
                            ...analyticsTdBaseStyle("center"),
                            padding: "6px 12px",
                            borderLeft: "1px solid var(--border-subtle)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 600,
                              color:
                                p.noMargin > 50
                                  ? "var(--accent-green)"
                                  : p.noMargin > 30
                                    ? "var(--accent-amber)"
                                    : "var(--text-muted)",
                            }}
                            dir="ltr"
                          >
                            {fmt2(p.noMargin)}%
                          </span>
                        </td>
                        <td
                          style={{
                            ...analyticsTdBaseStyle("center"),
                            padding: "6px 12px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9.5,
                              color: "var(--text-muted)",
                            }}
                            dir="ltr"
                          >
                            {fmt2(p.noSales)}%
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
        </AnalyticsTable>
      </div>
    </div>
  );
};

export default ComparisonOfDiscountCategoryPerformance;
