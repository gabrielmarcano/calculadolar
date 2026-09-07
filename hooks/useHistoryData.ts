'use client';

import { useState, useEffect, useRef } from 'react';

export type HistoryRange = '7d' | '30d' | '90d' | '1y';

export interface DataPoint {
  price: number;
  recorded_at: string;
}

const HISTORY_CACHE_PREFIX = 'calculadolar_history_';

function loadCachedHistory(key: string): DataPoint[] | null {
  try {
    const raw = localStorage.getItem(HISTORY_CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCachedHistory(key: string, data: DataPoint[]) {
  try {
    localStorage.setItem(HISTORY_CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    // storage full — ignore
  }
}

export function useHistoryData(initialRateName: string) {
  const [selectedRate, setSelectedRate] = useState(initialRateName);
  const [selectedRange, setSelectedRange] = useState<HistoryRange>('7d');
  const [data, setData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const memCache = useRef<Map<string, DataPoint[]>>(new Map());

  useEffect(() => {
    const cacheKey = `${selectedRate}_${selectedRange}`;

    // 1. Try in-memory cache first
    const memCached = memCache.current.get(cacheKey);
    if (memCached) {
      setData(memCached);
      setIsLoading(false);
      setIsOffline(false);
      return;
    }

    // 2. Show localStorage cache immediately while fetching
    const localCached = loadCachedHistory(cacheKey);
    if (localCached) {
      setData(localCached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    // 3. Fetch fresh data
    fetch(`/api/history?rate_name=${selectedRate}&range=${selectedRange}`)
      .then((res) => res.json())
      .then((json) => {
        const points: DataPoint[] = json.data || [];
        memCache.current.set(cacheKey, points);
        saveCachedHistory(cacheKey, points);
        setData(points);
        setIsOffline(false);
      })
      .catch(() => {
        if (!localCached) setData([]);
        setIsOffline(true);
      })
      .finally(() => setIsLoading(false));
  }, [selectedRate, selectedRange]);

  return {
    selectedRate,
    setSelectedRate,
    selectedRange,
    setSelectedRange,
    data,
    isLoading,
    isOffline,
  };
}
