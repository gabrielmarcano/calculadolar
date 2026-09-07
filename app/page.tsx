/// <reference lib="dom" />
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getSupabaseClient } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import RateView from '@/components/RateView';
import CalculatorView from '@/components/CalculatorView';
import HistoryView from '@/components/HistoryView';
import { triggerHaptic } from '@/lib/utils';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import InstallPrompt from '@/components/InstallPrompt';

type Rate = Database['public']['Tables']['rates']['Row'];

// Rate Caching & Last View Persistence
const CACHE_KEY = 'calculadolar_rates_cache';
const LAST_VIEW_KEY = 'calculadolar_last_view';

export default function Home() {
  // --- MOUNT & VIEW STATE ---
  const [isReady, setIsReady] = useState(false);
  const [view, setView] = useState<'dashboard' | 'calculator' | 'history'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LAST_VIEW_KEY);
        if (saved === 'dashboard' || saved === 'calculator') return saved;
      } catch {}
    }
    return 'calculator';
  });
  const [historyRateName, setHistoryRateName] = useState('USD_BCV');

  // --- PWA INSTALL ---
  const { isInstallable, promptInstall } = usePWAInstall();

  // --- RATES STATE ---
  type RateItem = { price: number; displayName: string; lastUpdated: string; imageUrl: string | null };
  type RatesMap = Record<string, RateItem>;

  const [rates, setRates] = useState<RatesMap>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return !localStorage.getItem(CACHE_KEY);
    } catch {
      return true;
    }
  });
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [targetCurrency, setTargetCurrency] = useState<string>(() => {
    if (typeof window === 'undefined') return 'EUR';
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const keys = Object.keys(parsed);
        if (keys.length > 0) return keys[0];
      }
    } catch {}
    return 'EUR';
  });
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const handleNavigate = useCallback((nextView: 'dashboard' | 'calculator' | 'history') => {
    setView(nextView);
    if (nextView === 'dashboard' || nextView === 'calculator') {
      try {
        localStorage.setItem(LAST_VIEW_KEY, nextView);
      } catch {
        // ignore
      }
    }
  }, []);

  const { containerRef, trackRef, bindSwipe } = useSwipeNavigation({
    currentView: view === 'dashboard' ? 'dashboard' : 'calculator',
    onNavigate: handleNavigate,
    enabled: view !== 'history',
  });

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  const getRateIcon = (name: string) => {
    if (name.includes('BCV')) return '/bcv.svg';
    if (name.includes('BINANCE')) return '/binance.svg';
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
        if (!cached) setFetchError('Error al obtener las tasas');
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isReady) {
    return (
      <main className="flex h-[100dvh] overflow-hidden flex-col items-center justify-center bg-[#0a0a0a] select-none text-white p-0">
        <div className="flex flex-col items-center gap-5 animate-in fade-in duration-150">
          <div className="w-20 h-20 rounded-3xl bg-[#1e1e1e] border border-white/10 flex items-center justify-center p-3 shadow-2xl animate-pulse">
            <Image
              src="/web-app-manifest-192x192.png"
              alt="CalculaDolar"
              width={56}
              height={56}
              className="rounded-2xl object-contain"
              priority
              unoptimized
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-black tracking-widest uppercase">
              Calcula<span className="text-gray-400">dolar</span>
            </h1>
            <div className="w-6 h-1 rounded-full bg-blue-500/60 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[100dvh] overflow-hidden flex-col items-center bg-[#0a0a0a] select-none text-white p-0">
      <div
        ref={containerRef}
        {...bindSwipe}
        className="w-full flex-1 flex flex-col h-[100dvh] max-w-md mx-auto pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] overflow-hidden relative touch-pan-y select-none"
      >
        {/* Continuous 2-Screen Track for Dashboard & Calculator */}
        <div
          ref={trackRef}
          className="w-[200%] h-full flex will-change-transform"
          style={{
            transform: view === 'calculator' ? 'translate3d(-50%, 0, 0)' : 'translate3d(0%, 0, 0)',
          }}
        >
          {/* Screen 0: Dashboard (Tasas) */}
          <div className="w-1/2 h-full flex-shrink-0 relative overflow-hidden flex flex-col">
            {/* 1. TOP NAV BAR */}
            <header className="flex-none h-16 flex items-center justify-center border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
              <h1 className="text-xl font-black tracking-widest uppercase">
                Calcula<span className="text-gray-400">dolar</span>
              </h1>
            </header>

            {/* OFFLINE INDICATOR */}
            {isOffline && Object.keys(rates).length > 0 && (
              <div className="flex-none mx-4 mt-3 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-medium text-center">
                Sin conexión — mostrando última actualización
              </div>
            )}

            {/* INSTALL PROMPT */}
            {isInstallable && (
              <div className="pt-4 flex-none">
                <InstallPrompt onInstall={promptInstall} />
              </div>
            )}

            {/* 2. MAIN CONTENT (Full Height, Centered Rates) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32 overflow-y-auto">
              {isLoadingRates && Object.keys(rates).length === 0 ? (
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
                  onViewHistory={(name) => {
                    setHistoryRateName(name);
                    handleNavigate('history');
                  }}
                />
              )}
            </div>

            {/* Floating button to jump to Calculator */}
            <div className="fixed bottom-[max(2rem,calc(env(safe-area-inset-bottom,0px)+1rem))] left-0 right-0 flex justify-center z-50 px-4 pointer-events-none max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  handleNavigate('calculator');
                }}
                className="pointer-events-auto bg-[#1e1e1e]/80 hover:bg-[#2d2d2d]/90 text-white border border-white/10 font-bold py-4 px-8 rounded-full text-lg shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all active:scale-95 flex items-center gap-3 active:shadow-none cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-300">
                  <path fillRule="evenodd" d="M3 4.5A2.25 2.25 0 0 1 5.25 2.25h13.5A2.25 2.25 0 0 1 21 4.5v15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 19.5v-15ZM10.5 7.5a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 0-1.5h-4.5a.75.75 0 0 0-.75.75Zm-3.75 3a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM10.5 10.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0-.75.75Zm.75 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm3.75-3.75a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0-.75.75Zm.75 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                </svg>
                <span className="tracking-wide">CALCULADORA</span>
              </button>
            </div>
          </div>

          {/* Screen 1: Calculator */}
          <div className="w-1/2 h-full flex-shrink-0 relative overflow-hidden flex flex-col">
            <CalculatorView
              rates={rates}
              isOffline={isOffline}
              onOpenRates={() => handleNavigate('dashboard')}
              onBack={() => handleNavigate('dashboard')}
            />
          </div>
        </div>

        {/* History View (Modal/Overlay) */}
        {view === 'history' && (
          <div className="absolute inset-0 z-50 bg-[#0a0a0a] animate-in fade-in duration-200">
            <HistoryView
              rates={rates}
              initialRateName={historyRateName}
              onBack={() => handleNavigate('dashboard')}
            />
          </div>
        )}
      </div>
    </main>
  );
}
