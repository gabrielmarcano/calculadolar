/// <reference lib="dom" />
'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import RateView from '@/components/RateView';
import CalculatorView from '@/components/CalculatorView';

type Rate = Database['public']['Tables']['rates']['Row'];

// Rate Caching
const CACHE_KEY = 'calculadolar_rates_cache';

export default function Home() {
  // --- TAB STATE ---
  const [activeTab, setActiveTab] = useState<'price' | 'calculator'>('price');

  // --- RATES STATE ---
  const [rates, setRates] = useState<Record<string, { price: number; displayName: string; lastUpdated: string }>>({});
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [targetCurrency, setTargetCurrency] = useState('EUR');

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

      const { data, error } = await supabase.from('rates').select('*');

      if (error) {
        console.error('Error fetching rates:', error);
        if (!cached) setFetchError('Failed to fetch rates');
      } else if (data) {
        const ratesMap: Record<string, { price: number; displayName: string; lastUpdated: string }> = {};
        data.forEach((rate: Rate) => {
          if (rate.name && typeof rate.price === 'number') {
            ratesMap[rate.name] = {
              price: rate.price,
              displayName: rate.display_name || rate.name,
              lastUpdated: rate.updated_at || new Date().toISOString(),
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
    <main className={`flex min-h-screen flex-col items-center bg-[#0a0a0a] select-none ${activeTab === 'calculator' ? 'p-0' : 'p-4'}`}>
      <div className={`w-full flex flex-col gap-4 ${activeTab === 'calculator' ? 'h-screen max-w-md' : 'max-w-sm h-[85vh]'}`}>

        {/* --- TABS --- */}
        <div className={`grid grid-cols-2 rounded-xl bg-[#1e1e1e] p-1 shadow-md flex-shrink-0 ${activeTab === 'calculator' ? 'mx-4 mt-4 mb-2' : ''}`}>
          <button
            onClick={() => setActiveTab('price')}
            className={`rounded-lg py-2.5 text-sm font-bold transition-all
              ${activeTab === 'price'
                ? 'bg-[#333] text-white shadow-sm'
                : 'text-gray-500 hover:bg-[#2d2d2d]'
              }`}
          >
            RATE
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`rounded-lg py-2.5 text-sm font-bold transition-all
              ${activeTab === 'calculator'
                ? 'bg-[#333] text-white shadow-sm'
                : 'text-gray-500 hover:bg-[#2d2d2d]'
              }`}
          >
            CALCULATOR
          </button>
        </div>

        {/* --- CONTENT --- */}
        <div className={`flex-1 relative overflow-hidden transition-all duration-300
            ${activeTab === 'calculator' ? 'bg-[#121212] p-0 rounded-none' : 'bg-[#121212] p-2 rounded-3xl shadow-none'}
        `}>
          {(isLoadingRates && Object.keys(rates).length === 0) ? (
            <div className="flex items-center justify-center h-full text-gray-400 font-bold animate-pulse">
              Loading rates...
            </div>
          ) : fetchError && Object.keys(rates).length === 0 ? (
            <div className="flex items-center justify-center h-full text-red-500 font-bold px-8 text-center">
              {fetchError}
            </div>
          ) : (
            <div className={`h-full ${activeTab === 'calculator' ? 'p-0' : 'p-4'}`}>
              {activeTab === 'price' && (
                <RateView
                  rates={rates}
                  targetCurrency={targetCurrency}
                  onCurrencyChange={setTargetCurrency}
                />
              )}
              {activeTab === 'calculator' && (
                <CalculatorView rates={rates} />
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
