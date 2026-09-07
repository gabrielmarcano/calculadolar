import React from 'react';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/utils';

interface RateRowProps {
  name: string;
  displayName: string;
  price?: number;
  imageUrl?: string | null;
  isLoading?: boolean;
  onViewHistory: (name: string) => void;
  onCopy: (value: string, label: string) => void;
}

export default function RateRow({
  name,
  displayName,
  price,
  imageUrl,
  isLoading = false,
  onViewHistory,
  onCopy,
}: RateRowProps) {
  const hasPrice = !isLoading && typeof price === 'number' && price > 0;
  const formattedPrice = hasPrice
    ? price.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0,00';
  const copyValue = hasPrice ? price.toFixed(2) : '0';

  return (
    <div
      onClick={() => {
        if (hasPrice) {
          onCopy(copyValue, `${displayName}: ${formattedPrice} Bs`);
        }
      }}
      className="w-full flex items-center justify-between py-4 px-3 rounded-2xl hover:bg-white/[0.04] active:bg-white/[0.08] active:scale-[0.99] transition-all duration-75 ease-out cursor-pointer select-none border border-transparent hover:border-white/5"
      title="Toca para copiar monto"
    >
      {/* Left: Avatar + Title + Hint */}
      <div className="flex items-center gap-3.5 min-w-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={displayName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-contain shrink-0 bg-white/5 p-1 border border-white/5"
            unoptimized
            priority
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {displayName.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <span className="font-bold text-base text-white tracking-tight truncate block">
            {displayName}
          </span>
          <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3 text-gray-500 pointer-events-none shrink-0"
              aria-hidden="true"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Toca para copiar
          </span>
        </div>
      </div>

      {/* Right: Price + Separate Chart Button */}
      <div className="flex items-center gap-2.5 shrink-0 ml-3">
        <div className="text-right">
          {hasPrice ? (
            <div className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums">
              {formattedPrice} <span className="text-xs font-normal text-gray-400">Bs</span>
            </div>
          ) : (
            <div className="w-28 h-8 rounded-lg bg-white/10 animate-pulse" />
          )}
        </div>

        {/* Separate Dedicated Chart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic();
            onViewHistory(name);
          }}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-gray-400 hover:text-white transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center border border-white/5 ml-1"
          aria-label={`Ver gráfico de ${displayName}`}
          title="Ver gráfico histórico"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 pointer-events-none"
            aria-hidden="true"
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
