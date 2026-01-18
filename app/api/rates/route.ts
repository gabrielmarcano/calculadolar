import { NextResponse } from 'next/server';
import { addRates, readRates, latestRate } from '../../../lib/rates';
import getSupabaseClient from '../../../lib/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latest = url.searchParams.get('latest');
  const supabase = getSupabaseClient();
  if (supabase) {
    // Note: The concept of 'latest' applies differently now that we store generic rates.
    // If storing history, we order by created_at.
    const { data, error } = await supabase
      .from('rates')
      .select('*')
      .order('created_at', { ascending: false }); // Changed fetched_at to created_at

    if (error) return new NextResponse(String(error.message), { status: 500 });

    // If 'latest=1', we might want just the most recent set? 
    // Since the table structure changed (row per currency), 'latest' logic is ambiguous.
    // For now, returning all rates is safe for the UI which filters by name.
    return NextResponse.json(data ?? []);
  }

  // Fallback to local file logic (legacy)
  if (latest === '1') {
    const one = await latestRate();
    return NextResponse.json(one ?? null);
  }
  const all = await readRates();
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.rates || !body.base) {
      return new NextResponse('Invalid payload, requires { base, rates }', {
        status: 400,
      });
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      // Transform generic payload to match 'rates' table schema
      const rows = Object.entries(body.rates).map(([name, price]) => ({
        name: name,
        price: Number(price),
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('rates')
        .insert(rows)
        .select();

      if (error)
        return new NextResponse(String(error.message), { status: 500 });
      return NextResponse.json(data ?? [], { status: 201 });
    }

    const entry = await addRates({
      base: body.base,
      rates: body.rates,
      source: body.source,
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    return new NextResponse(String(err), { status: 500 });
  }
}
