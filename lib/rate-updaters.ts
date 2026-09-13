import https from 'https';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { withRetry } from '@/lib/retry';

export interface UpdateRateItem {
  name: string;
  price: number;
  data: unknown;
}

export interface UpdateRatesResult {
  success: boolean;
  rates: UpdateRateItem[];
  error: string | null;
}

interface BinanceAdItem {
  adv: { price: string };
  advertiser: object;
  privilegeDesc: string | null;
  privilegeType: number | null;
  privilegeTypeAdTotalCount: number | null;
}

async function fetchBinanceAdPrice(asset: string, fiat: string, tradeType: string): Promise<string | null> {
  const payload = {
    asset,
    fiat,
    tradeType,
    filterType: 'tradable',
    classifies: ['mass', 'profession', 'fiat_trade'],
    countries: [],
    page: 1,
    rows: 5,
    payTypes: [],
    followed: false,
    publisherType: 'merchant',
    proMerchantAds: false,
    tradeWith: false,
    shieldMerchantAds: false,
    additionalKycVerifyFilter: 0,
  };

  const response = await withRetry(
    async () => {
      return await axios.post<{ data: BinanceAdItem[] }>(
        'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
        payload,
        {
          timeout: 12000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        }
      );
    },
    { maxRetries: 2, initialDelayMs: 1000 }
  );

  const ads = response.data?.data;
  if (!Array.isArray(ads)) return null;

  const firstNotPromotedAd = ads.find((ad) => ad.privilegeDesc === null);
  return firstNotPromotedAd ? firstNotPromotedAd.adv.price : null;
}

export async function updateBinanceRate(): Promise<UpdateRatesResult> {
  const rawRateUSDT = await fetchBinanceAdPrice('USDT', 'VES', 'BUY');
  if (!rawRateUSDT) {
    throw new Error('Could not fetch Binance USDT rate');
  }

  const parsedRateUSDT = parseFloat(rawRateUSDT.replace(',', '.'));
  if (isNaN(parsedRateUSDT)) {
    throw new Error(`Failed to parse raw USDT rate: ${rawRateUSDT}`);
  }

  const roundedRateUSDT = Math.round((parsedRateUSDT + Number.EPSILON) * 100) / 100;
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase admin client not configured');
  }

  const now = new Date().toISOString();

  // Upsert live rate with retry
  const { data } = await withRetry(async () => {
    const res = await supabase
      .from('rates')
      .upsert(
        {
          name: 'USDT_BINANCE',
          display_name: 'USDT Binance',
          price: roundedRateUSDT,
          updated_at: now,
        },
        { onConflict: 'name' }
      )
      .select();

    if (res.error) {
      throw new Error(res.error.message);
    }
    return res;
  });

  // Record history (best effort, retried, does not break rate update)
  await withRetry(async () => {
    const res = await supabase.from('rate_history').insert({
      rate_name: 'USDT_BINANCE',
      price: roundedRateUSDT,
      recorded_at: now,
    });
    if (res.error) {
      throw new Error(res.error.message);
    }
    return res;
  }, { maxRetries: 2, initialDelayMs: 500 }).catch((histErr: unknown) => {
    const message = histErr instanceof Error ? histErr.message : String(histErr);
    console.error('USDT history insert failed after retries:', message);
  });

  return {
    success: true,
    rates: [{ name: 'USDT_BINANCE', price: roundedRateUSDT, data }],
    error: null,
  };
}

async function fetchBcvHtml(): Promise<string> {
  const agent = new https.Agent({ rejectUnauthorized: false });

  const response = await withRetry(
    async () => {
      return await axios.get<string>('https://www.bcv.org.ve/', {
        httpsAgent: agent,
        timeout: 20000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
    },
    { maxRetries: 2, initialDelayMs: 1500 }
  );

  return response.data;
}

export async function updateBcvRates(): Promise<UpdateRatesResult> {
  const html = await fetchBcvHtml();
  if (!html) {
    throw new Error('Failed to fetch BCV HTML');
  }

  const $ = cheerio.load(html);
  const rawRateUSD = $('#dolar strong').text().trim();
  const rawRateEUR = $('#euro strong').text().trim();

  if (!rawRateUSD || !rawRateEUR) {
    throw new Error('Could not find raw rates in BCV HTML');
  }

  const parsedRateUSD = parseFloat(rawRateUSD.replace(',', '.'));
  const parsedRateEUR = parseFloat(rawRateEUR.replace(',', '.'));

  if (isNaN(parsedRateUSD) || isNaN(parsedRateEUR)) {
    throw new Error(`Failed to parse BCV rates: USD="${rawRateUSD}", EUR="${rawRateEUR}"`);
  }

  const roundedRateUSD = Math.round((parsedRateUSD + Number.EPSILON) * 100) / 100;
  const roundedRateEUR = Math.round((parsedRateEUR + Number.EPSILON) * 100) / 100;

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase admin client not configured');
  }

  const now = new Date().toISOString();

  // Batch upsert USD and EUR in a single resilient query
  const { data: upsertData } = await withRetry(async () => {
    const res = await supabase
      .from('rates')
      .upsert(
        [
          {
            name: 'USD_BCV',
            display_name: 'Dólar BCV',
            price: roundedRateUSD,
            updated_at: now,
          },
          {
            name: 'EUR_BCV',
            display_name: 'Euro BCV',
            price: roundedRateEUR,
            updated_at: now,
          },
        ],
        { onConflict: 'name' }
      )
      .select();

    if (res.error) {
      throw new Error(res.error.message);
    }
    return res;
  });

  // Batch record history (best effort)
  await withRetry(async () => {
    const res = await supabase.from('rate_history').insert([
      {
        rate_name: 'USD_BCV',
        price: roundedRateUSD,
        recorded_at: now,
      },
      {
        rate_name: 'EUR_BCV',
        price: roundedRateEUR,
        recorded_at: now,
      },
    ]);
    if (res.error) {
      throw new Error(res.error.message);
    }
    return res;
  }, { maxRetries: 2, initialDelayMs: 500 }).catch((histErr: unknown) => {
    const message = histErr instanceof Error ? histErr.message : String(histErr);
    console.error('BCV history batch insert failed after retries:', message);
  });

  const usdRow = upsertData?.find((r) => r.name === 'USD_BCV');
  const eurRow = upsertData?.find((r) => r.name === 'EUR_BCV');

  return {
    success: true,
    rates: [
      { name: 'USD_BCV', price: roundedRateUSD, data: usdRow ? [usdRow] : null },
      { name: 'EUR_BCV', price: roundedRateEUR, data: eurRow ? [eurRow] : null },
    ],
    error: null,
  };
}
