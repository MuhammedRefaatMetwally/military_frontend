"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, Search, Loader2, X, Check } from "lucide-react";
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { PaginatedResponse } from "@/api/lookup/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface InfiniteOption {
  value: string;
  label: string;
}

interface BaseInfiniteDropdownProps {
  /** Lucide icon shown in the trigger */
  icon: LucideIcon;
  /** Placeholder / label text when nothing selected */
  label: string;
  /** Accent colour applied to selection highlights and the icon */
  accent?: string;
  /** Disable the whole control */
  disabled?: boolean;
  /**
   * The raw infinite-query result.  The component handles
   * isFetchingNextPage / hasNextPage / fetchNextPage internally.
   */
  queryResult: UseInfiniteQueryResult<
    InfiniteData<PaginatedResponse<{ id: number; name: string }>>,
    Error
  >;
  /**
   * Maps each API item to an { value, label } pair.
   * Defaults to  { value: String(item.id), label: item.name }
   */
  toOption?: (item: { id: number; name: string; [k: string]: unknown }) => InfiniteOption;
  /** Debounce delay (ms) for the search input. Default 300 */
  searchDebounce?: number;
  /** Called when the user types in the search box */
  onSearch?: (term: string) => void;
  /** Current search value (controlled from parent) */
  searchValue?: string;
}

export interface InfiniteMultiSelectProps extends BaseInfiniteDropdownProps {
  mode: "multi";
  selectedValues: string[];
  onChange: (values: string[]) => void;
  /** Label when ≥2 items selected, e.g. (n) => `${n} فروع` */
  manyLabel?: (count: number) => string;
}

export interface InfiniteSingleSelectProps extends BaseInfiniteDropdownProps {
  mode: "single";
  value: string;
  onChange: (value: string) => void;
}

export type InfiniteDropdownProps =
  | InfiniteMultiSelectProps
  | InfiniteSingleSelectProps;

// ─────────────────────────────────────────────────────────────────────────────
// InfiniteDropdown
// ─────────────────────────────────────────────────────────────────────────────

export function InfiniteDropdown(props: InfiniteDropdownProps) {
  const {
    icon: Icon,
    label,
    accent = "var(--accent-green)",
    disabled = false,
    queryResult,
    toOption,
    onSearch,
    searchValue = "",
  } = props;

  const {
    data,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isError,
  } = queryResult;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── flatten pages → options ────────────────────────────────────────────────
  const options: InfiniteOption[] = (data?.pages ?? []).flatMap((page) =>
    page.results.map((item) =>
      toOption
        ? toOption(item as { id: number; name: string; [k: string]: unknown })
        : { value: String(item.id), label: item.name },
    ),
  );

  // ── close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── infinite scroll sentinel ───────────────────────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !open) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: listRef.current, threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── selection helpers ──────────────────────────────────────────────────────
  const isSelected = useCallback(
    (val: string) => {
      if (props.mode === "multi") return props.selectedValues.includes(val);
      return props.value === val;
    },
    [props],
  );

  const toggle = useCallback(
    (val: string) => {
      if (props.mode === "multi") {
        const next = props.selectedValues.includes(val)
          ? props.selectedValues.filter((v) => v !== val)
          : [...props.selectedValues, val];
        props.onChange(next);
      } else {
        props.onChange(props.value === val ? "" : val);
        setOpen(false);
      }
    },
    [props],
  );

  // ── trigger label ──────────────────────────────────────────────────────────
  const triggerLabel = (() => {
    if (props.mode === "multi") {
      const sel = props.selectedValues.filter(Boolean);
      if (sel.length === 0) return label;
      if (sel.length === 1) {
        return options.find((o) => o.value === sel[0])?.label ?? label;
      }
      return props.manyLabel ? props.manyLabel(sel.length) : `${sel.length} محدد`;
    }
    if (!props.value) return label;
    return options.find((o) => o.value === props.value)?.label ?? label;
  })();

  const hasSelection =
    props.mode === "multi"
      ? props.selectedValues.filter(Boolean).length > 0
      : Boolean(props.value);

  const clearSelection = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (props.mode === "multi") props.onChange([]);
      else props.onChange("");
    },
    [props],
  );

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-flex" }}
    >
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 8px",
          borderRadius: 8,
          fontSize: 11,
          fontWeight: hasSelection ? 700 : 500,
          cursor: disabled ? "not-allowed" : "pointer",
          border: `1px solid ${hasSelection ? accent : "var(--border-subtle)"}`,
          background: hasSelection
            ? `color-mix(in srgb, ${accent} 12%, transparent)`
            : "transparent",
          color: hasSelection ? accent : "var(--text-secondary)",
          whiteSpace: "nowrap",
          transition: "all .15s",
          opacity: disabled ? 0.45 : 1,
        }}
      >
        <Icon size={11} color={hasSelection ? accent : "var(--text-muted)"} />
        <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>
          {triggerLabel}
        </span>

        {hasSelection ? (
          <X
            size={10}
            style={{ marginInlineStart: 2, opacity: 0.7 }}
            onClick={clearSelection}
          />
        ) : (
          <ChevronDown
            size={10}
            style={{
              marginInlineStart: 2,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform .15s",
            }}
          />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            insetInlineStart: 0,
            zIndex: 9999,
            minWidth: 200,
            maxWidth: 280,
            borderRadius: 10,
            background: "var(--bg-panel)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 8px 32px rgba(0,0,0,.35)",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search */}
          {onSearch !== undefined && (
            <div
              style={{
                padding: "8px 10px 6px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Search size={12} color="var(--text-muted)" />
              <input
                autoFocus
                type="text"
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="بحث..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 11,
                  color: "var(--text-primary)",
                  direction: "rtl",
                }}
              />
              {searchValue && (
                <X
                  size={10}
                  color="var(--text-muted)"
                  style={{ cursor: "pointer" }}
                  onClick={() => onSearch("")}
                />
              )}
            </div>
          )}

          {/* List */}
          <div
            ref={listRef}
            style={{
              maxHeight: 220,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "4px 0",
            }}
          >
            {isLoading && (
              <DropdownSkeleton />
            )}

            {isError && (
              <div style={{ padding: "12px 14px", fontSize: 11, color: "var(--accent-red)", textAlign: "center" }}>
                فشل تحميل البيانات
              </div>
            )}

            {!isLoading && options.length === 0 && (
              <div style={{ padding: "12px 14px", fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
                لا توجد نتائج
              </div>
            )}

            {options.map((opt) => {
              const selected = isSelected(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: selected ? 700 : 400,
                    color: selected ? accent : "var(--text-secondary)",
                    background: selected
                      ? `color-mix(in srgb, ${accent} 10%, transparent)`
                      : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "start",
                    direction: "rtl",
                    transition: "background .1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected)
                      (e.currentTarget as HTMLElement).style.background =
                        "var(--bg-hover, rgba(255,255,255,.05))";
                  }}
                  onMouseLeave={(e) => {
                    if (!selected)
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                  }}
                >
                  {props.mode === "multi" && (
                    <span
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: 3,
                        border: `1.5px solid ${selected ? accent : "var(--border-subtle)"}`,
                        background: selected
                          ? `color-mix(in srgb, ${accent} 20%, transparent)`
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all .1s",
                      }}
                    >
                      {selected && <Check size={9} color={accent} strokeWidth={3} />}
                    </span>
                  )}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {opt.label}
                  </span>
                </button>
              );
            })}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} style={{ height: 1 }} />

            {isFetchingNextPage && (
              <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
                <Loader2 size={14} color={accent} style={{ animation: "spin 1s linear infinite" }} />
              </div>
            )}
          </div>

          {/* Footer: count */}
          {data && (
            <div
              style={{
                padding: "5px 12px",
                borderTop: "1px solid var(--border-subtle)",
                fontSize: 10,
                color: "var(--text-muted)",
                display: "flex",
                justifyContent: "space-between",
                direction: "rtl",
              }}
            >
              <span>
                {options.length} / {data.pages[0]?.count ?? "—"}
              </span>
              {hasNextPage && (
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 10,
                    color: accent,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  تحميل المزيد
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────────────────────

function DropdownSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 12px",
          }}
        >
          <div
            style={{
              width: 13,
              height: 13,
              borderRadius: 3,
              background: "var(--border-subtle)",
              flexShrink: 0,
              animation: "pulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
          <div
            style={{
              height: 10,
              borderRadius: 4,
              background: "var(--border-subtle)",
              width: `${55 + (i % 3) * 20}%`,
              animation: "pulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: .4; }
          50% { opacity: .8; }
        }
      `}</style>
    </>
  );
}