'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface HistoryChartProps {
    data: { price: number; recorded_at: string }[];
    range: string;
}

function formatXAxis(value: string, range: string) {
    const d = new Date(value);
    if (range === '7d') {
        return d.toLocaleDateString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
    if (range === '30d' || range === '90d') {
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
    return d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { recorded_at: string } }[] }) {
    if (!active || !payload?.length) return null;
    const point = payload[0];
    const date = new Date(point.payload.recorded_at);
    return (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs shadow-xl">
            <div className="text-white font-bold">
                Bs {point.value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-gray-400 mt-0.5">
                {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' '}
                {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
}

export default function HistoryChart({ data, range }: HistoryChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Sin datos para este período
            </div>
        );
    }

    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1 || 0.5;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis
                    dataKey="recorded_at"
                    tickFormatter={(v) => formatXAxis(v, range)}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={{ stroke: '#1e1e1e' }}
                    tickLine={false}
                    minTickGap={40}
                />
                <YAxis
                    domain={[min - padding, max + padding]}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.toFixed(2)}
                    width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
