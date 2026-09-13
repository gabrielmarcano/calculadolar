import { NextResponse } from 'next/server';
import { updateBinanceRate } from '@/lib/rate-updaters';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await updateBinanceRate();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Updating Binance rate failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}