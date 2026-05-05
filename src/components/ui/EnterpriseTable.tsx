'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowUpDown, ArrowUp, ArrowDown,
    Download, Columns3, ChevronDown, ChevronRight,
} from 'lucide-react';
import { ChartTitleFlagBadge, type ChartCardTitleFlag } from '@/components/ui/ChartTitleFlagBadge';
import { analyticsTdBaseStyle, AnalyticsBarCellContent } from '@/components/ui/AnalyticsTable';

export interface TableColumn<T> {
    key: string;
    header: string;
    width?: string;
    sticky?: boolean;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
    render?: (value: unknown, row: T, index: number) => React.ReactNode;
    format?: 'number' | 'currency' | 'percent' | 'change';
    /** Same blue bar background as `AnalyticsTable` / DrillDown — for numeric columns only. */
    analyticsBar?: { max: number; color?: string };
}

interface EnterpriseTableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    title?: string;
    /** Colored flag next to the title. Defaults to blue when `title` is set. Pass `false` to hide. */
    titleFlag?: ChartCardTitleFlag | false;
    titleFlagNumber?: number;
    pageSize?: number;
    expandable?: boolean;
    renderExpandedRow?: (row: T) => React.ReactNode;
    onExport?: (format: 'csv' | 'xlsx') => void;
    className?: string;
}

type SortDir = 'asc' | 'desc' | null;

export default function EnterpriseTable<T extends Record<string, unknown>>({
    columns,
    data,
    title,
    titleFlag,
    titleFlagNumber,
    pageSize = 10,
    expandable = false,
    renderExpandedRow,
    onExport,
    className = '',
}: EnterpriseTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(columns.map((c) => c.key)));
    const [showColumnToggle, setShowColumnToggle] = useState(false);

    const sortedData = useMemo(() => {
        if (!sortKey || !sortDir) return data;
        return [...data].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return sortDir === 'asc'
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    }, [data, sortKey, sortDir]);

    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            if (sortDir === 'asc') setSortDir('desc');
            else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const toggleExpand = (idx: number) => {
        const next = new Set(expandedRows);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        setExpandedRows(next);
    };

    const toggleColumn = (key: string) => {
        const next = new Set(visibleColumns);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setVisibleColumns(next);
    };

    const formatValue = (value: unknown, format?: string) => {
        if (value === null || value === undefined) return '—';
        if (format === 'number') return Number(value).toLocaleString('en-US');
        if (format === 'currency') return `${Number(value).toLocaleString('en-US')} د.أ`;
        if (format === 'percent') return `${Number(value).toFixed(1)}%`;
        if (format === 'change') {
            const num = Number(value);
            const color = num >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
            return <span style={{ color }} dir="ltr">{num >= 0 ? '+' : ''}{num.toFixed(1)}%</span>;
        }
        return String(value);
    };

    const activeColumns = columns.filter((c) => visibleColumns.has(c.key));

    const resolvedFlag: ChartCardTitleFlag | null =
        titleFlag === false ? null : (titleFlag ?? (title ? 'blue' : null));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel overflow-hidden ${className}`}
        >
            {/* شريط الأدوات */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                    {title && (
                        <div className="flex items-center gap-2">
                            {resolvedFlag && (
                                <ChartTitleFlagBadge
                                    flag={resolvedFlag}
                                    flagNumber={titleFlagNumber}
                                    size="sm"
                                />
                            )}
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                        </div>
                    )}
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {data.length.toLocaleString('en-US')} سجل
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* تبديل الأعمدة */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnToggle(!showColumnToggle)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <Columns3 size={14} />
                        </button>
                        {showColumnToggle && (
                            <div
                                className="absolute right-0 top-10 w-48 py-2 rounded-lg z-50"
                                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-elevated)' }}
                            >
                                {columns.map((col) => (
                                    <button
                                        key={col.key}
                                        onClick={() => toggleColumn(col.key)}
                                        className="flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors"
                                        style={{ color: visibleColumns.has(col.key) ? 'var(--text-primary)' : 'var(--text-muted)' }}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-sm border"
                                            style={{
                                                borderColor: visibleColumns.has(col.key) ? 'var(--accent-green)' : 'var(--border-default)',
                                                background: visibleColumns.has(col.key) ? 'var(--accent-green-dim)' : 'transparent',
                                            }}
                                        />
                                        {col.header}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* تصدير */}
                    <button
                        onClick={() => onExport?.('csv')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                    >
                        <Download size={12} />
                        تصدير
                    </button>
                </div>
            </div>

            {/* الجدول */}
            <div className="overflow-x-auto">
                <table
                    dir="rtl"
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                    }}
                >
                    <thead>
                        <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                            {expandable && (
                                <th
                                    style={{
                                        padding: '9px 12px',
                                        textAlign: 'center',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: 'var(--text-muted)',
                                        whiteSpace: 'nowrap',
                                        width: 40,
                                    }}
                                />
                            )}
                            {activeColumns.map((col) => (
                                <th
                                    key={col.key}
                                    style={{
                                        padding: '9px 12px',
                                        textAlign: col.align || 'right',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: 'var(--text-muted)',
                                        whiteSpace: 'nowrap',
                                        width: col.width,
                                        cursor: col.sortable ? 'pointer' : 'default',
                                    }}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {col.sortable && (
                                            sortKey === col.key ? (
                                                sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                                            ) : (
                                                <ArrowUpDown size={12} className="opacity-30" />
                                            )
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, idx) => {
                            const globalIdx = currentPage * pageSize + idx;
                            const isExpanded = expandedRows.has(globalIdx);

                            return (
                                <React.Fragment key={globalIdx}>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        {expandable && (
                                            <td style={analyticsTdBaseStyle('center')}>
                                                <button
                                                    onClick={() => toggleExpand(globalIdx)}
                                                    className="p-1 rounded"
                                                    style={{ color: 'var(--text-muted)' }}
                                                >
                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>
                                            </td>
                                        )}
                                        {activeColumns.map((col) => {
                                            const align = col.analyticsBar ? 'center' : (col.align || 'right');
                                            const base = analyticsTdBaseStyle(align);
                                            const tdStyle = col.analyticsBar
                                                ? { ...base, position: 'relative' as const }
                                                : base;
                                            const barColor = col.analyticsBar?.color ?? '#3b82f6';
                                            return (
                                                <td key={col.key} style={tdStyle}>
                                                    {col.analyticsBar && typeof row[col.key] === 'number' ? (
                                                        <AnalyticsBarCellContent
                                                            value={row[col.key] as number}
                                                            max={col.analyticsBar.max}
                                                            color={barColor}
                                                            text={String(formatValue(row[col.key], col.format))}
                                                        />
                                                    ) : col.render ? (
                                                        col.render(row[col.key], row, globalIdx)
                                                    ) : (
                                                        formatValue(row[col.key], col.format)
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    {isExpanded && renderExpandedRow && (
                                        <tr>
                                            <td
                                                colSpan={activeColumns.length + (expandable ? 1 : 0)}
                                                style={{ padding: 0, background: 'var(--bg-input)', borderBottom: '1px solid var(--border-subtle)' }}
                                            >
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="p-4"
                                                >
                                                    {renderExpandedRow(row)}
                                                </motion.div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* الصفحات */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        صفحة {currentPage + 1} من {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                            const page = i;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className="w-8 h-8 rounded-md text-xs font-medium transition-colors"
                                    style={{
                                        background: currentPage === page ? 'var(--accent-green-dim)' : 'transparent',
                                        color: currentPage === page ? 'var(--accent-green)' : 'var(--text-muted)',
                                        border: `1px solid ${currentPage === page ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                                    }}
                                >
                                    {page + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
