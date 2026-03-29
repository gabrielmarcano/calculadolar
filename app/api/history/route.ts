import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const VALID_RATES = ["USD_BCV", "EUR_BCV", "USDT_BINANCE"];
const RANGE_CONFIG: Record<string, { days: number; bucketMinutes: number }> = {
    "7d": { days: 7, bucketMinutes: 60 },        // hourly
    "30d": { days: 30, bucketMinutes: 360 },      // every 6h
    "90d": { days: 90, bucketMinutes: 1440 },     // daily
    "1y": { days: 365, bucketMinutes: 10080 },    // weekly
};

function downsample(rows: { price: number; recorded_at: string }[], bucketMinutes: number) {
    if (rows.length === 0) return [];

    const bucketMs = bucketMinutes * 60 * 1000;
    const result: { price: number; recorded_at: string }[] = [];
    let currentBucketStart = Math.floor(new Date(rows[0].recorded_at).getTime() / bucketMs) * bucketMs;
    let lastInBucket = rows[0];

    for (const row of rows) {
        const t = new Date(row.recorded_at).getTime();
        const bucket = Math.floor(t / bucketMs) * bucketMs;

        if (bucket !== currentBucketStart) {
            result.push(lastInBucket);
            currentBucketStart = bucket;
        }
        lastInBucket = row;
    }
    result.push(lastInBucket);

    return result;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rateName = searchParams.get("rate_name");
    const range = searchParams.get("range") || "7d";

    if (!rateName || !VALID_RATES.includes(rateName)) {
        return NextResponse.json({ error: "Invalid rate_name" }, { status: 400 });
    }
    if (!RANGE_CONFIG[range]) {
        return NextResponse.json({ error: "Invalid range" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 });
    }

    const { days, bucketMinutes } = RANGE_CONFIG[range];
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from("rate_history")
        .select("price, recorded_at")
        .eq("rate_name", rateName)
        .gte("recorded_at", from)
        .order("recorded_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const downsampled = downsample(data || [], bucketMinutes);

    const response = NextResponse.json({
        rate_name: rateName,
        range,
        data: downsampled,
    });

    response.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=1800");
    return response;
}
