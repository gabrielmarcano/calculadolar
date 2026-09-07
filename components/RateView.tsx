import { useState } from 'react';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/utils';
import { useLongPressCopy } from '@/hooks/useLongPressCopy';
import Toast from '@/components/Toast';

interface RateViewProps {
    rates: Record<string, { price: number; displayName: string; lastUpdated: string; imageUrl: string | null }>;
    targetCurrency: string;
    onCurrencyChange: (currency: string) => void;
    onViewHistory: (rateName: string) => void;
}

export default function RateView({ rates, targetCurrency, onCurrencyChange, onViewHistory }: RateViewProps) {
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const { bindDirectCopy, toastProps } = useLongPressCopy();

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
        <div className="flex flex-col items-center justify-center h-full text-white space-y-8 relative">
            
            {/* Title */}
            <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                EL <span className="text-white font-extrabold">DÓLAR</span> ESTÁ EN
            </h2>

            {/* Price Display */}
            <div className="text-center">
                <div
                    {...bindDirectCopy(currentRate.toFixed(2), currentRate.toFixed(2))}
                    className="text-7xl font-bold tracking-tighter tabular-nums active:scale-[0.98] transition-transform duration-75 ease-out will-change-transform cursor-pointer"
                >
                    {currentRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-2xl text-gray-400 mt-2 font-medium">
                    bolívares
                </div>
            </div>

            {/* Custom Selector */}
            <div className="relative z-50">
                <button 
                    type="button"
                    onClick={() => {
                        triggerHaptic();
                        setIsSelectorOpen(!isSelectorOpen);
                    }}
                    className="flex items-center gap-3 bg-[#1e1e1e] hover:bg-[#2d2d2d] px-6 py-3 rounded-full transition-transform duration-75 ease-out active:scale-95 will-change-transform border border-gray-800 shadow-lg cursor-pointer"
                >
                    {/* Icon */}
                    {currentImage ? (
                        <Image src={currentImage} alt={currentDisplayName} width={72} height={72} className="w-9 h-9 rounded-full object-contain shrink-0" unoptimized priority />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/20">
                            {currentDisplayName.charAt(0)}
                        </div>
                    )}
                    
                    <span className="font-bold text-lg tracking-wide">{currentDisplayName}</span>
                    <span className={`text-gray-500 transform transition-transform duration-200 ${isSelectorOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {/* Dropdown */}
                {isSelectorOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsSelectorOpen(false)} />
                        <div
                            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-[#1e1e1e] border border-gray-800 rounded-2xl shadow-2xl p-2 z-20 max-h-60 overflow-y-auto animate-bubble-pop will-change-transform"
                        >
                            {Object.keys(rates).map((currency) => {
                                const rate = rates[currency];
                                return (
                                    <button
                                        key={currency}
                                        type="button"
                                        onClick={() => handleSelect(currency)}
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors duration-150 active:scale-98 cursor-pointer ${
                                            currency === targetCurrency 
                                            ? 'bg-white/10 text-white' 
                                            : 'hover:bg-[#2d2d2d] text-gray-300'
                                        }`}
                                    >
                                        {rate.imageUrl ? (
                                            <Image src={rate.imageUrl} alt={rate.displayName} width={56} height={56} className="w-7 h-7 rounded-full object-contain shrink-0" unoptimized priority />
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

            {/* History Link */}
            <button
                type="button"
                onClick={() => {
                    triggerHaptic();
                    onViewHistory(targetCurrency);
                }}
                className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors duration-150 active:scale-95 cursor-pointer"
            >
                Ver historial &rsaquo;
            </button>

            <Toast {...toastProps} />
        </div>
    );
}
