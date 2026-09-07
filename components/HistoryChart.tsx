'use client';

import React, { useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface HistoryChartProps {
  data: { price: number; recorded_at: string }[];
  range: string;
  isPositive: boolean;
  onHoverPoint?: (point: { price: number; recorded_at: string } | null) => void;
}

function formatXAxis(value: string, range: string) {
  const d = new Date(value);
  if (range === '7d') {
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  }
  if (range === '30d' || range === '90d') {
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
  return d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
}

function CustomTooltip({
  active,
  payload,
  onHoverPoint,
}: {
  active?: boolean;
  payload?: { value: number; payload: { price: number; recorded_at: string } }[];
  onHoverPoint?: (point: { price: number; recorded_at: string } | null) => void;
}) {
  useEffect(() => {
    if (active && payload && payload.length > 0) {
      onHoverPoint?.(payload[0].payload);
    } else {
      onHoverPoint?.(null);
    }
  }, [active, payload, onHoverPoint]);

  if (!active || !payload?.length) return null;
  const point = payload[0];
  const date = new Date(point.payload.recorded_at);

  return (
    <div className="bg-[#181818]/95 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl pointer-events-none select-none">
      <div className="font-mono font-bold text-white tabular-nums">
        {point.value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
      </div>
      <div className="text-[11px] text-gray-400 mt-0.5 font-mono">
        {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        {' · '}
        {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
      </div>
    </div>
  );
}

export default function HistoryChart({
  data,
  range,
  isPositive,
  onHoverPoint,
}: HistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8 text-gray-600 pointer-events-none"
          aria-hidden="true"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
        <span>Sin datos para este período</span>
      </div>
    );
  }

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const padding = (max - min) * 0.12 || 0.5;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';

  return (
    <div className="w-full h-full outline-none focus:outline-none focus:ring-0 [&_*]:outline-none [&_*]:focus:outline-none [&_*]:focus-visible:outline-none [&_svg]:outline-none select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          tabIndex={-1}
          style={{ outline: 'none' }}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          onMouseLeave={() => onHoverPoint?.(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="recorded_at"
            tickFormatter={(v) => formatXAxis(v, range)}
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#ffffff10' }}
            tickLine={false}
            minTickGap={45}
          />
          <YAxis
            domain={[min - padding, max + padding]}
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(2)}
            width={48}
            orientation="right"
          />
          <Tooltip content={<CustomTooltip onHoverPoint={onHoverPoint} />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2.5}
            fill="url(#areaGradient)"
            dot={false}
            activeDot={{
              r: 5,
              fill: strokeColor,
              stroke: '#ffffff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
