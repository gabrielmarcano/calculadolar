import React from 'react';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/utils';
import type { GestureBindingOptions } from '@/hooks/useLongPressCopy';

interface CalculatorRatesProps {
  rates: Record<string, { price: number; displayName: string; imageUrl: string | null }>;
  selectedRates: string[];
  numericResult: number;
  isReversed: boolean;
  onRateTap: (convertedStr: string) => void;
  bindDirectCopy: (
    value: string,
    label: string,
    options?: GestureBindingOptions
  ) => Record<string, unknown>;
}

export default function CalculatorRates({
  rates,
  selectedRates,
  numericResult,
  isReversed,
  onRateTap,
  bindDirectCopy,
}: CalculatorRatesProps) {
  const activeCurrencyKeys = Object.keys(rates).filter((k) => selectedRates.includes(k));
  // El scroll vertical se mantiene desactivado para 3 o menos tasas; se activa automáticamente si hay más de 3
  const canScroll = activeCurrencyKeys.length > 3;

  return (
    <div
      className={`w-full h-[116px] min-h-[116px] max-h-[116px] space-y-1 overflow-x-hidden flex-shrink-0 pt-1.5 border-t border-gray-800/50 scrollbar-hide select-none ${
        canScroll ? 'overflow-y-auto touch-pan-y' : 'overflow-y-hidden'
      }`}
    >
      {selectedRates.length > 0 && activeCurrencyKeys.length > 0 ? (
        activeCurrencyKeys.map((currency) => {
          const rate = rates[currency]?.price || 0;
          const displayName = rates[currency]?.displayName || currency;
          const imageUrl = rates[currency]?.imageUrl;
          const converted = isReversed
            ? rate > 0
              ? numericResult / rate
              : 0
            : numericResult * rate;
          const isZero = numericResult === 0 || converted === 0;
          const currencySymbol = currency.toLowerCase().includes('eur') ? '€' : '$';
          const suffix = isReversed ? ` ${currencySymbol}` : ' Bs';
          const convertedStr = isZero ? '0' : converted.toFixed(2);
          const formattedValue = isZero
            ? '0'
            : converted.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              });
          const copyValue = isZero ? '0' : converted.toFixed(2);

          return (
            <div
              key={currency}
              {...bindDirectCopy(copyValue, `${displayName}: ${copyValue}`, {
                onTap: () => {
                  triggerHaptic();
                  onRateTap(convertedStr);
                },
                touchAction: canScroll ? 'pan-y' : undefined,
              })}
              className="w-full flex justify-between items-center text-sm text-gray-400 py-0.5 rounded-lg px-1 min-h-[34px] cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.98] active:bg-[#1e1e1e] transition-[transform,background-color] duration-75 ease-out will-change-transform overflow-hidden"
            >
              <div className="flex items-center gap-2 min-w-0 shrink-0">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="w-6 h-6 rounded-full object-contain shrink-0"
                    unoptimized
                    priority
                  />
                )}
                <span className="font-medium truncate max-w-[130px] sm:max-w-[150px] leading-tight">
                  {displayName}
                </span>
              </div>
              <span
                className="text-white font-mono tabular-nums text-lg leading-tight truncate min-w-0 text-right ml-2"
                title={`${formattedValue}${suffix}`}
              >
                {formattedValue}
                {suffix}
              </span>
            </div>
          );
        })
      ) : (
        [0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-full flex justify-between items-center py-0.5 rounded-lg px-1 min-h-[34px] overflow-hidden select-none"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
              <div className="w-20 h-3.5 bg-white/10 rounded-full animate-pulse" />
            </div>
            <div className="w-24 h-4 bg-white/10 rounded-full animate-pulse" />
          </div>
        ))
      )}
    </div>
  );
}

