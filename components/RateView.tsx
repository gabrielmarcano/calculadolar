import { ChangeEvent } from 'react';

interface RateViewProps {
    rates: Record<string, { price: number; displayName: string }>;
    targetCurrency: string;
    onCurrencyChange: (currency: string) => void;
}

export default function RateView({ rates, targetCurrency, onCurrencyChange }: RateViewProps) {
    const currentRate = rates[targetCurrency]?.price || 0;
    const currentDisplayName = rates[targetCurrency]?.displayName || targetCurrency;

    const handleCurrencyChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onCurrencyChange(e.target.value);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-300">
            <div className="text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Today's Rate
                </p>
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-gray-400">
                        1 USD =
                    </span>
                </div>

                {/* Big Price Display */}
                <div className="text-6xl font-black text-gray-900 tracking-tight">
                    {currentRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="mt-2 text-xl font-bold text-blue-600">
                    {currentDisplayName}
                </div>
            </div>

            {/* Simple Selector for Price View */}
            <div className="w-full pt-6 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase text-center">
                    Change Currency
                </label>
                <select
                    value={targetCurrency}
                    onChange={handleCurrencyChange}
                    className="w-full bg-gray-50 text-center font-bold text-gray-800 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all"
                >
                    {Object.keys(rates).map((currency) => (
                        <option key={currency} value={currency}>
                            {rates[currency].displayName}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
