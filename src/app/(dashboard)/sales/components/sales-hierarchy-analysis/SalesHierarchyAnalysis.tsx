"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import { secondarySalesMetric } from "./utils/data";
import { treeData, type TreeNode } from "./utils/TreeNode";
import { TreeItem } from "./components/TreeItem";

type Level = { label: string; node: TreeNode };

const HIERARCHY_TITLES = [
  "الفرع",
  "المجموعة الاولي",
  "المجموعة الثانية",
  "المجموعة الثالثة",
  "المنتج",
] as const;

export default function SalesHierarchyAnalysis() {
  const [path, setPath] = useState<Level[]>([]);

  const columns: { title: string; titleAr: string; nodes: TreeNode[] }[] = [];

  const rootChildren = treeData.children || [];
  columns.push({
    title: HIERARCHY_TITLES[0],
    titleAr: HIERARCHY_TITLES[0],
    nodes: rootChildren,
  });

  for (let i = 0; i < path.length; i++) {
    const children = path[i].node.children;
    if (children && children.length > 0) {
      const nextTitle = HIERARCHY_TITLES[i + 1] || `المستوى ${i + 2}`;
      columns.push({
        title: nextTitle,
        titleAr: nextTitle,
        nodes: children,
      });
    }
  }

  const getMax = (nodes: TreeNode[]) => Math.max(...nodes.map((n) => n.value));
  const getMaxSecondary = (nodes: TreeNode[]) =>
    Math.max(1, ...nodes.map((n) => secondarySalesMetric(n)));

  const handleSelect = (colIdx: number, node: TreeNode) => {
    if (path[colIdx]?.node.id === node.id) {
      setPath(path.slice(0, colIdx));
    } else {
      setPath([
        ...path.slice(0, colIdx),
        { label: columns[colIdx].title, node },
      ]);
    }
  };

  const removeFilter = (idx: number) => {
    setPath(path.slice(0, idx));
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [path.length]);

  return (
    <div className="glass-panel overflow-hidden">
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <ChartTitleFlagBadge flag="green" flagNumber={3} size="sm" />
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            التحليل الهرمي للمبيعات
          </h3>
        </div>
        <p
          className="text-[11px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          اضغط على أي عنصر للتعمق • الشريط والرقم الأزرق: المبيعات • الأخضر:
          ربح تقديري • الفرع ← المجموعة الاولي ← المجموعة الثانية ← المجموعة
          الثالثة ← المنتج
        </p>
      </div>

      <AnimatePresence>
        {path.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-2 px-5 py-2 border-b flex-wrap"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {path.map((lvl, i) => (
              <span
                key={lvl.node.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{
                  background: "rgba(37,99,235,0.12)",
                  border: "1px solid rgba(37,99,235,0.3)",
                  color: "var(--accent-blue)",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                  {lvl.label}
                </span>
                <span style={{ color: "var(--accent-blue)" }}>
                  {lvl.node.label}
                </span>
                <button
                  onClick={() => removeFilter(i)}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {path.length > 0 && (
              <button
                onClick={() => setPath([])}
                className="text-[10px] underline"
                style={{ color: "var(--text-muted)" }}
              >
                مسح الكل
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={scrollRef} className="overflow-x-auto p-5">
        <div className="flex w-max me-auto ps-30 gap-2 items-stretch" dir="ltr">
          {columns.map((col, colIdx) => {
            const selectedNode = path[colIdx]?.node;
            const maxVal = getMax(col.nodes);
            const maxSecVal = getMaxSecondary(col.nodes);

            return (
              <React.Fragment key={`col-${colIdx}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: colIdx * 0.05 }}
                  className="shrink-0 self-stretch flex flex-col"
                  style={{ minWidth: "160px", maxWidth: "160px" }}
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {col.title}
                    </span>
                    {selectedNode && colIdx < path.length && (
                      <button
                        onClick={() => removeFilter(colIdx)}
                        className="p-0.5 rounded transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>

                  <div
                    className="space-y-0 overflow-y-auto flex-1 min-h-0"
                    style={{ maxHeight: "650px", paddingRight: "2px" }}
                  >
                    {col.nodes.map((node) => {
                      const isSel = selectedNode?.id === node.id;

                      return (
                        <TreeItem
                          key={node.id}
                          node={node}
                          max={maxVal}
                          maxSecondary={maxSecVal}
                          selected={isSel}
                          showLeadArrow={isSel}
                          onClick={() => handleSelect(colIdx, node)}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-4 pt-0">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span
              className="inline-block rounded-full"
              style={{
                width: 22,
                height: 6,
                background: "#2563eb",
              }}
            />
            <span style={{ color: "var(--text-muted)" }}>
              المبيعات (القيمة الأساسية)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="inline-block rounded-full"
              style={{
                width: 22,
                height: 6,
                background: "#16a34a",
              }}
            />
            <span style={{ color: "var(--text-muted)" }}>
              الربح التقديري (المقياس الثانوي)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
