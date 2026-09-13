import { NextResponse } from 'next/server';
import { updateBinanceRate, updateBcvRates, UpdateRateItem } from '@/lib/rate-updaters';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const errors: string[] = [];
  const rates: UpdateRateItem[] = [];

  try {
    const binanceResult = await updateBinanceRate();
    rates.push(...binanceResult.rates);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown Binance error';
    console.error('Updating Binance rate failed in unified cron:', msg);
    errors.push(`Binance: ${msg}`);
  }

  try {
    const bcvResult = await updateBcvRates();
    rates.push(...bcvResult.rates);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown BCV error';
    console.error('Updating BCV rates failed in unified cron:', msg);
    errors.push(`BCV: ${msg}`);
  }

  const success = errors.length === 0;
  return NextResponse.json(
    {
      success,
      rates,
      errors: errors.length > 0 ? errors : null,
    },
    { status: success ? 200 : 500 }
  );
}
