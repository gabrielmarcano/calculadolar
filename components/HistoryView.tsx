'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/utils';
import HistoryChart from '@/components/HistoryChart';
import HistoryStats from '@/components/HistoryStats';
import HistoryHero from '@/components/HistoryHero';
import { useHistoryData, type HistoryRange, type DataPoint } from '@/hooks/useHistoryData';

const RANGES: { label: string; value: HistoryRange }[] = [
  { label: '7D', value: '7d' }, { label: '30D', value: '30d' }, { label: '90D', value: '90d' }, { label: '1A', value: '1y' },
];

const KNOWN_ORDER = ['USD_BCV', 'USDT_BINANCE', 'EUR_BCV'];

interface HistoryViewProps {
  rates: Record<string, { price: number; displayName: string; imageUrl: string | null }>;
  initialRateName: string;
  onBack: () => void;
}

export default function HistoryView({ rates, initialRateName, onBack }: HistoryViewProps) {
  const {
    selectedRate,
    setSelectedRate,
    selectedRange,
    setSelectedRange,
    data,
    isLoading,
    isOffline,
  } = useHistoryData(initialRateName);

  const [scrubbedPoint, setScrubbedPoint] = useState<DataPoint | null>(null);

  const currentRate = rates[selectedRate];
  const sortedRateKeys = useMemo(() => {
    return Object.keys(rates).sort((a, b) => {
      const idxA = KNOWN_ORDER.indexOf(a);
      const idxB = KNOWN_ORDER.indexOf(b);
      return idxA !== -1 && idxB !== -1 ? idxA - idxB : idxA !== -1 ? -1 : idxB !== -1 ? 1 : a.localeCompare(b);
    });
  }, [rates]);

  // Calculations
  const displayPoint = scrubbedPoint || (data.length > 0 ? data[data.length - 1] : null);
  const currentPrice = displayPoint?.price ?? currentRate?.price ?? 0;
  const firstPrice = data.length > 0 ? data[0].price : 0;
  const priceChange = data.length >= 2 ? currentPrice - firstPrice : null;
  const priceChangePercent = priceChange !== null && firstPrice > 0 ? (priceChange / firstPrice) * 100 : null;
  const isPositive = priceChange !== null ? priceChange >= 0 : true;

  const prices = useMemo(() => data.map((d) => d.price), [data]);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] overflow-hidden select-none">
      {/* Top Bar */}
      <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onBack();
          }}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-gray-300 hover:text-white border border-white/5 transition-all duration-75 cursor-pointer"
          aria-label="Volver"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 pointer-events-none"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-base font-bold text-white tracking-tight">
          Gráficos de Cotización
        </h2>
        <div className="w-11" />
      </div>

      {/* Offline Indicator */}
      {isOffline && data.length > 0 && (
        <div className="flex-none mx-4 mt-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-medium text-center">
          Sin conexión — mostrando datos guardados
        </div>
      )}

      {/* Rate Selector Pills */}
      <div className="flex-none flex gap-2 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide">
        {sortedRateKeys.map((key) => {
          const rate = rates[key];
          const isActive = key === selectedRate;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                triggerHaptic();
                setSelectedRate(key);
                setScrubbedPoint(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-75 ease-out active:scale-95 cursor-pointer whitespace-nowrap min-h-[44px] ${
                isActive
                  ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                  : 'bg-white/[0.03] text-gray-400 hover:text-gray-200 border border-white/5'
              }`}
            >
              {rate.imageUrl ? (
                <Image
                  src={rate.imageUrl}
                  alt={rate.displayName}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full object-contain shrink-0"
                  unoptimized
                  priority
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                  {rate.displayName.charAt(0)}
                </div>
              )}
              <span>{rate.displayName}</span>
            </button>
          );
        })}
      </div>

      {/* Price Hero Section */}
      <HistoryHero
        currentPrice={currentPrice}
        scrubbedPoint={scrubbedPoint}
        priceChange={priceChange}
        priceChangePercent={priceChangePercent}
        isPositive={isPositive}
      />

      {/* Stats (Mínimo / Máximo) */}
      <HistoryStats
        minPrice={minPrice}
        maxPrice={maxPrice}
        rangeLabel={RANGES.find((r) => r.value === selectedRange)?.label || selectedRange}
      />

      {/* Range Selector */}
      <div className="flex-none px-4 pb-2">
        <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/5 gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => {
                triggerHaptic();
                setSelectedRange(r.value);
                setScrubbedPoint(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-75 ease-out active:scale-95 cursor-pointer min-h-[44px] flex items-center justify-center ${
                r.value === selectedRange ? 'bg-white/15 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 min-h-0 px-2 pb-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse flex items-center justify-center">
              <div className="w-2/3 h-28 bg-white/5 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : (
          <HistoryChart
            data={data}
            range={selectedRange}
            isPositive={isPositive}
            onHoverPoint={setScrubbedPoint}
          />
        )}
      </div>
    </div>
  );
}
