import React from 'react';

interface HistoryStatsProps {
  minPrice: number;
  maxPrice: number;
  rangeLabel: string;
}

export default function HistoryStats({
  minPrice,
  maxPrice,
  rangeLabel,
}: HistoryStatsProps) {
  const formattedMin = minPrice > 0
    ? `${minPrice.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`
    : '—';

  const formattedMax = maxPrice > 0
    ? `${maxPrice.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`
    : '—';

  return (
    <div className="grid grid-cols-2 gap-2.5 px-4 pb-3 flex-none">
      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
          Mínimo ({rangeLabel})
        </span>
        <span className="font-mono text-sm font-bold text-gray-300 tabular-nums mt-0.5 block">
          {formattedMin}
        </span>
      </div>
      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
          Máximo ({rangeLabel})
        </span>
        <span className="font-mono text-sm font-bold text-gray-300 tabular-nums mt-0.5 block">
          {formattedMax}
        </span>
      </div>
    </div>
  );
}
