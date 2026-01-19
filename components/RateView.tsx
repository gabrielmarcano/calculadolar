import { useState } from 'react';
import { triggerHaptic } from '@/lib/utils';

interface RateViewProps {
    rates: Record<string, { price: number; displayName: string; lastUpdated: string; imageUrl: string | null }>;
    targetCurrency: string;
    onCurrencyChange: (currency: string) => void;
}

export default function RateView({ rates, targetCurrency, onCurrencyChange }: RateViewProps) {
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    const currentRate = rates[targetCurrency]?.price || 0;
    const currentDisplayName = rates[targetCurrency]?.displayName || targetCurrency;
    const lastUpdated = rates[targetCurrency]?.lastUpdated || new Date().toISOString();
    const currentImage = rates[targetCurrency]?.imageUrl;

    // Format date: "20 de enero de 2026"
    const formattedDate = new Date(lastUpdated).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const handleSelect = (currency: string) => {
        triggerHaptic();
        onCurrencyChange(currency);
        setIsSelectorOpen(false);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-white space-y-8 animate-in fade-in duration-300 relative">
            
            {/* Title */}
            <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                EL <span className="text-white font-extrabold">DÓLAR</span> ESTÁ EN
            </h2>

            {/* Price Display */}
            <div className="text-center">
                <div className="text-7xl font-bold tracking-tighter">
                    {currentRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-2xl text-gray-400 mt-2 font-medium">
                    bolívares
                </div>
            </div>

            {/* Custom Selector */}
            <div className="relative z-50">
                <button 
                    onClick={() => {
                        triggerHaptic();
                        setIsSelectorOpen(!isSelectorOpen);
                    }}
                    className="flex items-center gap-3 bg-[#1e1e1e] hover:bg-[#2d2d2d] px-6 py-3 rounded-full transition-all border border-gray-800 shadow-lg"
                >
                    {/* Icon */}
                    {currentImage ? (
                        <img src={currentImage} alt={currentDisplayName} className="w-8 h-8 rounded-full bg-white object-contain p-0.5" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/20">
                            {currentDisplayName.charAt(0)}
                        </div>
                    )}
                    
                    <span className="font-bold text-lg tracking-wide">{currentDisplayName}</span>
                    <span className={`text-gray-500 transform transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {/* Dropdown */}
                {isSelectorOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsSelectorOpen(false)} />
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-[#1e1e1e] border border-gray-800 rounded-2xl shadow-2xl p-2 z-20 max-h-60 overflow-y-auto">
                            {Object.keys(rates).map((currency) => {
                                const rate = rates[currency];
                                return (
                                    <button
                                        key={currency}
                                        onClick={() => handleSelect(currency)}
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                                            currency === targetCurrency 
                                            ? 'bg-white/10 text-white' 
                                            : 'hover:bg-[#2d2d2d] text-gray-300'
                                        }`}
                                    >
                                        {rate.imageUrl ? (
                                            <img src={rate.imageUrl} alt={rate.displayName} className="w-6 h-6 rounded-full bg-white object-contain p-0.5" />
                                        ) : (
                                            <div className={`w-2 h-2 rounded-full ${currency === targetCurrency ? 'bg-white' : 'bg-gray-600'}`} />
                                        )}
                                        <span className="font-medium">{rate.displayName}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Date */}
            <div className="text-gray-500 text-sm font-medium">
                {formattedDate}
            </div>

        </div>
    );
}
