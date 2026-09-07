import React from 'react';
import Image from 'next/image';

interface RateRowProps {
  name: string;
  displayName: string;
  price?: number;
  imageUrl?: string | null;
  isLoading?: boolean;
  onCopy: (value: string, label: string) => void;
}

export default function RateRow({
  displayName,
  price,
  imageUrl,
  isLoading = false,
  onCopy,
}: RateRowProps) {
  const hasPrice = !isLoading && typeof price === 'number' && price > 0;
  const formattedPrice = hasPrice
    ? price.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0,00';
  const copyValue = hasPrice ? price.toFixed(2) : '0';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (hasPrice) {
          onCopy(copyValue, `${displayName}: ${formattedPrice} Bs`);
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && hasPrice) {
          e.preventDefault();
          onCopy(copyValue, `${displayName}: ${formattedPrice} Bs`);
        }
      }}
      className="w-full flex items-center justify-between py-4 px-3 rounded-2xl hover:bg-white/[0.04] active:bg-white/[0.08] active:scale-[0.99] transition-all duration-75 ease-out cursor-pointer select-none border border-transparent hover:border-white/5"
      title="Toca para copiar monto"
    >
      {/* Left: Avatar + Title */}
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

        <span className="font-bold text-base text-white tracking-tight truncate">
          {displayName}
        </span>
      </div>

      {/* Right: Price */}
      <div className="text-right shrink-0 ml-3">
        {hasPrice ? (
          <div className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums">
            {formattedPrice} <span className="text-xs font-normal text-gray-400">Bs</span>
          </div>
        ) : (
          <div className="w-28 h-8 rounded-lg bg-white/10 animate-pulse" />
        )}
      </div>
    </div>
  );
}
