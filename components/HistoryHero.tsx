import React from 'react';
import type { DataPoint } from '@/hooks/useHistoryData';

interface HistoryHeroProps {
  currentPrice: number;
  scrubbedPoint: DataPoint | null;
  priceChange: number | null;
  priceChangePercent: number | null;
  isPositive: boolean;
}

export default function HistoryHero({
  currentPrice,
  scrubbedPoint,
  priceChange,
  priceChangePercent,
  isPositive,
}: HistoryHeroProps) {
  const formattedPrice = currentPrice.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex-none px-5 pt-2 pb-2">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-white">
          {formattedPrice}
        </span>
        <span className="text-base font-normal text-gray-400">Bs</span>
      </div>

      {/* Change Badge or Scrubbing Timestamp */}
      <div className="h-6 mt-1.5 flex items-center">
        {scrubbedPoint ? (
          <span className="text-xs font-mono text-gray-400 tabular-nums">
            {new Date(scrubbedPoint.recorded_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        ) : priceChange !== null && priceChangePercent !== null ? (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums border ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 pointer-events-none shrink-0"
              aria-hidden="true"
            >
              {isPositive ? (
                <>
                  <path d="m5 12 7-7 7 7" />
                  <path d="M12 19V5" />
                </>
              ) : (
                <>
                  <path d="m19 12-7 7-7-7" />
                  <path d="M12 5v14" />
                </>
              )}
            </svg>
            <span>
              {isPositive ? '+' : ''}
              {priceChange.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
              {' '}
              ({isPositive ? '+' : ''}
              {priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
