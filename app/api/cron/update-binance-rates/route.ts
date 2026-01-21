import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

export const dynamic = "force-dynamic";

async function getBinanceAds(asset: string, fiat: string, tradeType: string) {
    try {
        const payload = {
            asset,
            fiat,
            tradeType,
            filterType: "tradable",
            classifies: ["mass", "profession", "fiat_trade"],
            countries: [],
            page: 1,
            rows: 5,
            payTypes: [],
            followed: false,
            publisherType: "merchant",
            proMerchantAds: false,
            tradeWith: false,
            shieldMerchantAds: false,
            additionalKycVerifyFilter: 0
        };

        const response = await axios.post("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
            payload, {
            headers: {
                'User-Agent':
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            }
        });

        const ads = response.data.data as {
            adv: { price: string },
            advertiser: object,
            privilegeDesc: string | null,
            privilegeType: number | null,
            privilegeTypeAdTotalCount: number | null
        }[];

        const firstNotPromotedAd = ads.find(ad => ad.privilegeDesc === null);
        return firstNotPromotedAd ? firstNotPromotedAd.adv.price : null;
    } catch (error) {
        console.error("Error fetching USDT/VES Ads:", error);
        return null;
    }
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const rawRateUSDT = await getBinanceAds("USDT", "VES", "BUY");
        if (!rawRateUSDT) throw new Error("Could not fetch Binance USDT rate");

        const parsedRateUSDT = parseFloat(rawRateUSDT.replace(",", "."));
        if (isNaN(parsedRateUSDT)) throw new Error(`Failed to parse raw USDT rate`);

        const roundedRateUSDT = Math.round((parsedRateUSDT + Number.EPSILON) * 100) / 100;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from("rates")
            .upsert(
                {
                    name: "USDT_BINANCE",
                    display_name: "USDT Binance",
                    price: roundedRateUSDT,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "name" }
            )
            .select();

        if (error) throw new Error(error.message);

        return NextResponse.json({
            success: true,
            rates: [
                { name: "USDT_BINANCE", price: roundedRateUSDT, data }
            ],
            error: null,
        });
    } catch (error: any) {
        console.error("Updating Binance rate failed:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}