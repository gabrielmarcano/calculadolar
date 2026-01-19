/// <reference lib="dom" />
'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import RateView from '@/components/RateView';
import CalculatorView from '@/components/CalculatorView';
import { triggerHaptic } from '@/lib/utils';

type Rate = Database['public']['Tables']['rates']['Row'];

// Rate Caching
const CACHE_KEY = 'calculadolar_rates_cache';

export default function Home() {
  // --- VIEW STATE ---
  const [view, setView] = useState<'dashboard' | 'calculator'>('dashboard');

  // --- RATES STATE ---
  const [rates, setRates] = useState<Record<string, { price: number; displayName: string; lastUpdated: string; imageUrl: string | null }>>({});
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [targetCurrency, setTargetCurrency] = useState('EUR');

  const getRateIcon = (name: string) => {
      if (name.includes('BCV')) return 'https://sptjftsocyxytuizjlzv.supabase.co/storage/v1/object/public/logos/BCV.png';
      if (name.includes('BINANCE')) return 'https://sptjftsocyxytuizjlzv.supabase.co/storage/v1/object/public/logos/BINANCE.png';
      return null;
  };

  useEffect(() => {
    async function fetchRates() {
      // 1. Load from cache immediately
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setRates(parsed);
          // Infer target currency from cache if needed
          if (Object.keys(parsed).length > 0 && !parsed[targetCurrency] && !Object.keys(parsed).includes(targetCurrency)) {
            setTargetCurrency(Object.keys(parsed)[0]);
          }
          setIsLoadingRates(false);
        } catch (e) {
          console.error('Error parsing cache', e);
        }
      }

      // 2. Fetch fresh data
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (!cached) setFetchError('Supabase client not initialized');
        setIsLoadingRates(false);
        return;
      }

      const { data, error } = await supabase
        .from('rates')
        .select('*')
        .order('display_name', { ascending: true });

      if (error) {
        console.error('Error fetching rates:', error);
        if (!cached) setFetchError('Failed to fetch rates');
      } else if (data) {
        const ratesMap: Record<string, { price: number; displayName: string; lastUpdated: string; imageUrl: string | null }> = {};
        data.forEach((rate: Rate) => {
          if (rate.name && typeof rate.price === 'number') {
            ratesMap[rate.name] = {
              price: rate.price,
              displayName: rate.display_name || rate.name,
              lastUpdated: rate.updated_at || new Date().toISOString(),
              imageUrl: getRateIcon(rate.name),
            };
          }
        });

        setRates(ratesMap);
        localStorage.setItem(CACHE_KEY, JSON.stringify(ratesMap));

        if (data.length > 0 && data[0].name && !ratesMap[targetCurrency] && !Object.keys(ratesMap).includes(targetCurrency)) {
          setTargetCurrency(data[0].name);
        }
        setFetchError(null);
      }
      setIsLoadingRates(false);
    }

    fetchRates();
  }, []);

  return (
    <main className={`flex min-h-[100dvh] flex-col items-center bg-[#0a0a0a] select-none text-white ${view === 'calculator' ? 'p-0' : 'p-0'}`}>
      <div className={`w-full flex flex-col ${view === 'calculator' ? 'h-[100dvh] max-w-md mx-auto' : 'h-[100dvh] w-full'}`}>

        {view === 'dashboard' && (
            <div className="flex flex-col h-full relative">
                
                {/* 1. TOP NAV BAR */}
                <header className="flex-none h-16 flex items-center justify-center border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
                    <h1 className="text-xl font-black tracking-widest uppercase">
                        Calcula<span className="text-gray-400">dolar</span>
                    </h1>
                </header>

                {/* 2. MAIN CONTENT (Full Height, Centered Rates) */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
                     {(isLoadingRates && Object.keys(rates).length === 0) ? (
                        <div className="flex items-center justify-center h-full text-gray-400 font-bold animate-pulse">
                        Cargando precios...
                        </div>
                    ) : fetchError && Object.keys(rates).length === 0 ? (
                        <div className="flex items-center justify-center h-full text-red-500 font-bold px-8 text-center">
                        {fetchError}
                        </div>
                    ) : (
                        <RateView
                            rates={rates}
                            targetCurrency={targetCurrency}
                            onCurrencyChange={setTargetCurrency}
                        />
                    )}
                </div>

                <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none">
                    <button
                        onClick={() => {
                            triggerHaptic();
                            setView('calculator');
                        }}
                        className="pointer-events-auto bg-[#1e1e1e]/80 hover:bg-[#2d2d2d]/90 text-white border border-white/10 font-bold py-4 px-8 rounded-full text-lg shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all active:scale-95 flex items-center gap-3 active:shadow-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-300">
                          <path fillRule="evenodd" d="M3 4.5A2.25 2.25 0 0 1 5.25 2.25h13.5A2.25 2.25 0 0 1 21 4.5v15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 19.5v-15ZM10.5 7.5a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 0-1.5h-4.5a.75.75 0 0 0-.75.75Zm-3.75 3a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM10.5 10.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0-.75.75Zm.75 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm3.75-3.75a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0-.75.75Zm.75 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                        </svg>
                        <span className="tracking-wide">CALCULADORA</span>
                    </button>
                </div>
            </div>
        )}

        {view === 'calculator' && (
             <div className="h-full w-full">
                <CalculatorView rates={rates} onBack={() => setView('dashboard')} />
             </div>
        )}
      </div>
    </main>
  );
}
