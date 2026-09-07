import React, { useCallback } from 'react';
import RateRow from '@/components/RateRow';
import Toast from '@/components/Toast';
import { useLongPressCopy } from '@/hooks/useLongPressCopy';
import { copyToClipboard } from '@/lib/clipboard';
import { triggerHaptic } from '@/lib/utils';

interface RateItem {
  price: number;
  displayName: string;
  lastUpdated: string;
  imageUrl: string | null;
}

interface RateViewProps {
  rates: Record<string, RateItem>;
  isLoading?: boolean;
  onViewHistory: (rateName: string) => void;
}

interface KnownRateConfig {
  key: string;
  defaultName: string;
  defaultImage: string;
}

const KNOWN_RATES: KnownRateConfig[] = [
  { key: 'USD_BCV', defaultName: 'Dólar BCV', defaultImage: '/bcv.svg' },
  { key: 'USDT_BINANCE', defaultName: 'Dólar Paralelo', defaultImage: '/binance.svg' },
  { key: 'EUR_BCV', defaultName: 'Euro BCV', defaultImage: '/bcv.svg' },
];

export default function RateView({
  rates,
  isLoading = false,
  onViewHistory,
}: RateViewProps) {
  const { showToast, toastProps } = useLongPressCopy();

  const handleCopy = useCallback((value: string, label: string) => {
    triggerHaptic();
    copyToClipboard(value).then(() => {
      showToast(`${label} copiado`);
    });
  }, [showToast]);

  // Unified single timestamp across all rates
  const latestTimestamp = Object.values(rates).reduce<string | null>((latest, item) => {
    if (!item?.lastUpdated) return latest;
    if (!latest) return item.lastUpdated;
    return new Date(item.lastUpdated) > new Date(latest) ? item.lastUpdated : latest;
  }, null);

  const targetDate = latestTimestamp ? new Date(latestTimestamp) : new Date();

  // Prominent Spanish date string: "Lunes, 7 de septiembre de 2026"
  const formattedDate = targetDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = latestTimestamp
    ? targetDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  const extraRateKeys = Object.keys(rates).filter(
    (k) => !KNOWN_RATES.some((kr) => kr.key === k)
  );

  return (
    <div className="w-full max-w-md mx-auto select-none pt-1">
      {/* Prominent Date Header */}
      <div className="px-2 pb-4 mb-3 border-b border-white/10">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white capitalize">
          {formattedDate}
        </h2>
        <div className="h-5 mt-1.5 flex items-center">
          {formattedTime && !isLoading ? (
            <p className="text-xs font-mono text-gray-400 tabular-nums">
              Actualizado {formattedTime}
            </p>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
              <span>Actualizado</span>
              <span className="inline-block w-16 h-3.5 rounded bg-white/10 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Clean Edge-to-Edge List */}
      <div className="divide-y divide-white/5">
        {KNOWN_RATES.map((config) => {
          const item = rates[config.key];
          const hasRate = Boolean(item && item.price > 0);

          return (
            <RateRow
              key={config.key}
              name={config.key}
              displayName={item?.displayName || config.defaultName}
              price={item?.price}
              imageUrl={item?.imageUrl || config.defaultImage}
              isLoading={isLoading || !hasRate}
              onCopy={handleCopy}
            />
          );
        })}

        {/* Dynamic Extra Rates */}
        {extraRateKeys.map((key) => {
          const item = rates[key];
          if (!item) return null;

          return (
            <RateRow
              key={key}
              name={key}
              displayName={item.displayName || key}
              price={item.price}
              imageUrl={item.imageUrl}
              isLoading={isLoading}
              onCopy={handleCopy}
            />
          );
        })}
      </div>

      {/* Dedicated Separate Chart Button */}
      <div className="mt-5 px-1">
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onViewHistory('USD_BCV');
          }}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.09] active:scale-[0.99] border border-white/5 transition-all duration-75 ease-out cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-300 shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 pointer-events-none"
                aria-hidden="true"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <div className="text-left">
              <span className="font-semibold text-sm text-white block">
                Ver gráficos históricos
              </span>
              <span className="text-xs text-gray-400 block mt-0.5">
                Tendencias y evolución de precios
              </span>
            </div>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-gray-500 shrink-0 pointer-events-none"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Toast Notification Portal */}
      <Toast {...toastProps} />
    </div>
  );
}
