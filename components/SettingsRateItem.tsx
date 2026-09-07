'use client';

import React from 'react';
import Image from 'next/image';

interface SettingsRateItemProps {
  currency: string;
  displayName: string;
  imageUrl: string | null;
  price: number;
  isSelected: boolean;
  isLocked: boolean;
  onToggle: (currency: string) => void;
}

export default function SettingsRateItem({
  currency,
  displayName,
  imageUrl,
  price,
  isSelected,
  isLocked,
  onToggle,
}: SettingsRateItemProps) {
  return (
    <button
      onClick={() => onToggle(currency)}
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all min-h-[48px] active:scale-[0.98] border cursor-pointer ${
        isSelected
          ? 'bg-white/10 text-white border-white/15 shadow-sm'
          : 'bg-transparent text-gray-400 border-transparent hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={displayName}
            width={56}
            height={56}
            className="w-7 h-7 rounded-full object-contain shrink-0"
            unoptimized
            priority
          />
        )}
        <div className="text-left truncate">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm font-semibold text-white truncate">{displayName}</span>
            {isLocked && (
              <span className="text-[10px] text-zinc-400 bg-white/10 px-1.5 py-0.5 rounded-full font-medium">
                Fija
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 font-mono tabular-nums">
            {price > 0
              ? `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`
              : 'Sin cotización'}
          </div>
        </div>
      </div>

      {/* Clean Monochromatic Toggle Switch */}
      <div
        className={`w-11 h-6 rounded-full transition-colors duration-150 relative flex items-center p-0.5 shrink-0 ${
          isSelected
            ? isLocked
              ? 'bg-white/20 opacity-80 cursor-not-allowed'
              : 'bg-white/30'
            : 'bg-[#2d2d30]'
        }`}
        title={isLocked ? 'Al menos una cotización debe permanecer activa' : undefined}
      >
        <div
          className={`w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 will-change-transform ${
            isSelected ? 'translate-x-5 bg-white' : 'translate-x-0 bg-gray-400'
          }`}
        />
      </div>
    </button>
  );
}
