'use client';

import React, { useCallback, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Star } from 'lucide-react';
import { ChartTitleFlagBadge } from './ChartTitleFlagBadge';

// ── بيانات الفروع مع إحداثيات جغرافية (Google Maps) ──
interface Branch {
    id: string;
    name: string;
    city: string;
    lat: number;
    lng: number;
    score: number;
    revenue: number;
    orders: number;
    growth: number;
    margin: number;
    avgBasket: number;
}

const branches: Branch[] = [
    { id: 'b1', name: 'سوق المنارة', city: 'عمّان', lat: 31.95, lng: 35.93, score: 59, revenue: 328505, orders: 2847, growth: 12.3, margin: 18.9, avgBasket: 18 },
    { id: 'b2', name: 'سوق سطح النجم', city: 'عمّان', lat: 31.85, lng: 35.88, score: 38, revenue: 97419, orders: 1204, growth: -3.1, margin: 25.1, avgBasket: 1 },
    { id: 'b3', name: 'سوق القويسمة', city: 'عمّان', lat: 31.97, lng: 36.01, score: 72, revenue: 214300, orders: 1980, growth: 18.7, margin: 21.8, avgBasket: 9 },
    { id: 'b4', name: 'سوق راس العين', city: 'عمّان', lat: 31.9, lng: 35.79, score: 55, revenue: 88600, orders: 980, growth: 5.4, margin: 19.4, avgBasket: 5 },
    { id: 'b5', name: 'سوق البقعة', city: 'البلقاء', lat: 32.06, lng: 35.87, score: 81, revenue: 298400, orders: 2540, growth: 24.5, margin: 23.1, avgBasket: 14 },
    { id: 'b6', name: 'سوق الدمام', city: 'إربد', lat: 32.55, lng: 35.85, score: 46, revenue: 158700, orders: 1430, growth: 2.1, margin: 17.6, avgBasket: 7 },
    { id: 'b7', name: 'سوق الخبر', city: 'الزرقاء', lat: 32.07, lng: 36.08, score: 75, revenue: 265700, orders: 2210, growth: 15.9, margin: 26.3, avgBasket: 12 },
    { id: 'b8', name: 'سوق جدة', city: 'الكرك', lat: 31.18, lng: 35.7, score: 35, revenue: 133500, orders: 1100, growth: -6.2, margin: 15.9, avgBasket: 4 },
];

const JORDAN_CENTER = { lat: 31.95, lng: 36.0 };
const DEFAULT_ZOOM = 7;

function getScoreColor(score: number) {
    if (score >= 70) return '#00e5a0';
    if (score >= 50) return '#f59e0b';
    if (score >= 35) return '#f97316';
    return '#ef4444';
}

function getScoreBg(score: number) {
    if (score >= 70) return 'rgba(0,229,160,0.08)';
    if (score >= 50) return 'rgba(245,158,11,0.08)';
    if (score >= 35) return 'rgba(249,115,22,0.08)';
    return 'rgba(239,68,68,0.08)';
}

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

function circleIconDataUrl(color: string, size: number): string {
    const cx = size / 2;
    const r = size / 2 - 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${cx}" cy="${cx}" r="${r}" fill="${color}" stroke="#ffffff" stroke-width="2"/></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function makeBranchIcon(color: string, selected: boolean): google.maps.Icon {
    const s = selected ? 28 : 22;
    return {
        url: circleIconDataUrl(color, s),
        scaledSize: new google.maps.Size(s, s),
        anchor: new google.maps.Point(s / 2, s / 2),
    };
}

type BranchGoogleMapProps = {
    apiKey: string;
    selectedId: string | null;
    onSelect: (b: Branch | null) => void;
};

function BranchGoogleMap({ apiKey, selectedId, onSelect }: BranchGoogleMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'branch-map-script',
        googleMapsApiKey: apiKey,
    });

    const onMapLoad = useCallback((map: google.maps.Map) => {
        const bounds = new google.maps.LatLngBounds();
        branches.forEach((b) => bounds.extend({ lat: b.lat, lng: b.lng }));
        map.fitBounds(bounds, { top: 48, right: 24, bottom: 48, left: 24 });
    }, []);

    if (loadError) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center" style={{ minHeight: 0 }}>
                <p className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>تعذّر تحميل خريطة Google</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    تحقق من صلاحية المفتاح وتفعيل واجهة Maps JavaScript API في Google Cloud.
                </p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex flex-1 items-center justify-center" style={{ minHeight: 0 }}>
                <div className="w-9 h-9 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--accent-blue)' }} />
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={JORDAN_CENTER}
            zoom={DEFAULT_ZOOM}
            onLoad={onMapLoad}
            options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                gestureHandling: 'greedy',
            }}
        >
            {branches.map((b) => {
                const color = getScoreColor(b.score);
                const selected = selectedId === b.id;
                return (
                    <Marker
                        key={b.id}
                        position={{ lat: b.lat, lng: b.lng }}
                        icon={makeBranchIcon(color, selected)}
                        onClick={() => onSelect(selected ? null : b)}
                        title={b.name}
                    />
                );
            })}
        </GoogleMap>
    );
}

function MapPlaceholder({ message }: { message: string }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center" style={{ minHeight: 0 }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{message}</p>
            <p className="text-[10px] max-w-sm" style={{ color: 'var(--text-muted)' }}>
                أضف المتغيّر <code className="text-[9px] px-1 rounded" style={{ background: 'var(--bg-elevated)' }}>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> في ملف <code className="text-[9px] px-1 rounded" style={{ background: 'var(--bg-elevated)' }}>.env.local</code> وفعّل Maps JavaScript API لمشروعك في Google Cloud.
            </p>
        </div>
    );
}

export default function BranchMap() {
    const [selected, setSelected] = useState<Branch | null>(null);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';

    return (
        <div className="glass-panel overflow-hidden" style={{ minHeight: '460px' }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                    <ChartTitleFlagBadge flag="green" size="sm" />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>خريطة الفروع التفاعلية</h3>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>اضغط على أي فرع لعرض تفاصيله</p>
                </div>

                <div className="relative flex" style={{ height: '420px' }} dir="ltr">
                    <div className="relative flex-1 overflow-hidden min-w-0">
                        {apiKey ? (
                            <BranchGoogleMap apiKey={apiKey} selectedId={selected?.id ?? null} onSelect={setSelected} />
                        ) : (
                            <MapPlaceholder message="مفتاح Google Maps غير مضبوط" />
                        )}
                    </div>

                    <AnimatePresence>
                        {selected && (
                            <motion.div
                                initial={{ opacity: 0, x: 40, width: 0 }}
                                animate={{ opacity: 1, x: 0, width: 260 }}
                                exit={{ opacity: 0, x: 40, width: 0 }}
                                className="shrink-0 border-s overflow-hidden"
                                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
                            >
                                <div style={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)', background: getScoreBg(selected.score) }}>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selected.name}</p>
                                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selected.city}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-center">
                                                <p className="text-lg font-bold" style={{ color: getScoreColor(selected.score) }} dir="ltr">{selected.score}%</p>
                                                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>الأداء</p>
                                            </div>
                                            <button type="button" onClick={() => setSelected(null)} style={{ color: 'var(--text-muted)' }} aria-label="إغلاق">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                                        <div className="flex items-center justify-between text-[9px] mb-1" style={{ color: 'var(--text-muted)' }}>
                                            <span>درجة الأداء</span><span dir="ltr">{selected.score}/100</span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${selected.score}%` }}
                                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                                className="h-full rounded-full"
                                                style={{ background: `linear-gradient(to right, ${getScoreColor(selected.score)}, ${getScoreColor(selected.score)}88)` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="px-4 py-3 space-y-3 overflow-y-auto flex-1">
                                        {[
                                            { icon: DollarSign, label: 'الإيرادات', value: `${fmt(selected.revenue)} د.أ`, color: 'var(--accent-green)' },
                                            { icon: ShoppingCart, label: 'عدد الطلبات', value: fmt(selected.orders), color: 'var(--accent-blue)' },
                                            { icon: selected.growth >= 0 ? TrendingUp : TrendingDown, label: 'نمو المبيعات', value: `${selected.growth > 0 ? '+' : ''}${selected.growth}%`, color: selected.growth >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
                                            { icon: Star, label: 'هامش الربح', value: `${selected.margin}%`, color: 'var(--accent-amber)' },
                                            { icon: ShoppingCart, label: 'متوسط السلة', value: `${selected.avgBasket} د.أ`, color: 'var(--accent-purple)' },
                                        ].map((m) => (
                                            <div key={m.label} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <m.icon size={12} style={{ color: m.color }} />
                                                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                </div>
                                                <span className="text-xs font-semibold" style={{ color: m.color }} dir="ltr">{m.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="px-4 py-2 border-t text-[10px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                                        {selected.growth >= 0
                                            ? `✅ الفرع يحقق نمواً إيجابياً بنسبة ${selected.growth}%`
                                            : `⚠️ الفرع يعاني تراجعاً بنسبة ${Math.abs(selected.growth)}%`}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="px-5 py-2 border-t flex flex-wrap items-center gap-4 text-[10px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    {[{ label: 'ممتاز ≥ 70%', color: '#22c55e' }, { label: 'جيد 50-70%', color: '#eab308' }, { label: 'متوسط 35-50%', color: '#f97316' }, { label: 'ضعيف < 35%', color: '#ef4444' }].map((l) => (
                        <div key={l.label} className="flex items-center gap-1.5">
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                            <span>{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            );
}
