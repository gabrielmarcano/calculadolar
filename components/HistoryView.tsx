'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/utils';
import HistoryChart from '@/components/HistoryChart';

type HistoryRange = '7d' | '30d' | '90d' | '1y';

const RANGES: { label: string; value: HistoryRange }[] = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1A', value: '1y' },
];

const HISTORY_CACHE_PREFIX = 'calculadolar_history_';

interface HistoryViewProps {
    rates: Record<string, { price: number; displayName: string; imageUrl: string | null }>;
    initialRateName: string;
    onBack: () => void;
}

interface DataPoint {
    price: number;
    recorded_at: string;
}

function loadCachedHistory(key: string): DataPoint[] | null {
    try {
        const raw = localStorage.getItem(HISTORY_CACHE_PREFIX + key);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch { return null; }
}

function saveCachedHistory(key: string, data: DataPoint[]) {
    try {
        localStorage.setItem(HISTORY_CACHE_PREFIX + key, JSON.stringify(data));
    } catch { /* storage full — ignore */ }
}

export default function HistoryView({ rates, initialRateName, onBack }: HistoryViewProps) {
    const [selectedRate, setSelectedRate] = useState(initialRateName);
    const [selectedRange, setSelectedRange] = useState<HistoryRange>('7d');
    const [data, setData] = useState<DataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const memCache = useRef<Map<string, DataPoint[]>>(new Map());

    useEffect(() => {
        const cacheKey = `${selectedRate}_${selectedRange}`;

        // 1. Try in-memory cache first
        const memCached = memCache.current.get(cacheKey);
        if (memCached) {
            setData(memCached);
            setIsLoading(false);
            setIsOffline(false);
            return;
        }

        // 2. Show localStorage cache immediately while fetching
        const localCached = loadCachedHistory(cacheKey);
        if (localCached) {
            setData(localCached);
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }

        // 3. Fetch fresh data
        fetch(`/api/history?rate_name=${selectedRate}&range=${selectedRange}`)
            .then(res => res.json())
            .then(json => {
                const points: DataPoint[] = json.data || [];
                memCache.current.set(cacheKey, points);
                saveCachedHistory(cacheKey, points);
                setData(points);
                setIsOffline(false);
            })
            .catch(() => {
                // Offline or fetch failed — keep showing cached data if we have it
                if (!localCached) setData([]);
                setIsOffline(true);
            })
            .finally(() => setIsLoading(false));
    }, [selectedRate, selectedRange]);

    const currentRate = rates[selectedRate];
    const rateKeys = Object.keys(rates);

    // Calculate price change from history data
    const priceChange = data.length >= 2
        ? data[data.length - 1].price - data[0].price
        : null;
    const priceChangePercent = priceChange !== null && data[0].price > 0
        ? (priceChange / data[0].price) * 100
        : null;

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] text-white">

            {/* Top Bar */}
            <div className="flex-none flex items-center justify-between p-4">
                <button
                    onClick={() => { triggerHaptic(); onBack(); }}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-300 transition-colors active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Historial</h2>
                <div className="w-10" />
            </div>

            {/* Offline Indicator */}
            {isOffline && data.length > 0 && (
                <div className="flex-none mx-4 mb-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-medium text-center">
                    Sin conexión — mostrando datos guardados
                </div>
            )}

            {/* Rate Selector */}
            <div className="flex-none flex gap-2 px-4 pb-4 overflow-x-auto">
                {rateKeys.map(key => {
                    const rate = rates[key];
                    const isActive = key === selectedRate;
                    return (
                        <button
                            key={key}
                            onClick={() => { triggerHaptic(); setSelectedRate(key); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                isActive
                                    ? 'bg-white/10 text-white border border-white/20'
                                    : 'bg-[#1e1e1e] text-gray-400 border border-transparent'
                            }`}
                        >
                            {rate.imageUrl && (
                                <Image src={rate.imageUrl} alt={rate.displayName} width={16} height={16} className="w-4 h-4 rounded-full bg-white object-contain p-[1px]" />
                            )}
                            {rate.displayName}
                        </button>
                    );
                })}
            </div>

            {/* Current Price + Change */}
            <div className="flex-none px-6 pb-4">
                <div className="text-4xl font-bold tracking-tight">
                    Bs {currentRate?.price.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </div>
                {priceChange !== null && priceChangePercent !== null && (
                    <div className={`text-sm font-medium mt-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                    </div>
                )}
            </div>

            {/* Range Selector */}
            <div className="flex-none flex gap-1 px-4 pb-4">
                {RANGES.map(r => (
                    <button
                        key={r.value}
                        onClick={() => { triggerHaptic(); setSelectedRange(r.value); }}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            r.value === selectedRange
                                ? 'bg-white/10 text-white'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0 px-2 pb-6">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-full h-48 mx-4 rounded-xl bg-[#1e1e1e] animate-pulse" />
                    </div>
                ) : (
                    <HistoryChart data={data} range={selectedRange} />
                )}
            </div>
        </div>
    );
}
