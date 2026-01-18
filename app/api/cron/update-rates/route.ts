import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";
import axios from "axios";
import https from "https";

// Force dynamic since we are scraping live data
export const dynamic = "force-dynamic";

async function getHTML(url: string) {
    try {
        // Create SSL Agent to bypass "UnknownIssuer" or cert errors
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        const { data: html } = await axios.get(
            url,
            {
                httpsAgent: agent,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            },
        );

        return html;
    } catch (error) {
        console.error("Error fetching HTML:", error);
        return null;
    }
}

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
        }

        const response = await axios.post("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
            payload, {
            headers: {
                'User-Agent':
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            }
        });

        console.log(response.data)

        const ads = response.data.data as {
            adv: { price: string }, // and more properties
            advertiser: object,
            privilegeDesc: string | null,
            privilegeType: number | null,
            privilegeTypeAdTotalCount: number | null
        }[];

        const firstNotPromotedAd = ads.find(ad => ad.privilegeDesc === null); // Filter out promoted ads

        return firstNotPromotedAd ? firstNotPromotedAd.adv.price : null;
    } catch (error) {
        console.error("Error fetching USDT/VES Ads:", error);
        return null;
    }

}

export async function GET() {
    try {
        const html = await getHTML("https://www.bcv.org.ve/glosario/cambio-oficial");

        const $ = cheerio.load(html);
        const rawRateUSD = $("#dolar strong").text().trim();
        const rawRateEUR = $("#euro strong").text().trim();
        const rawRateUSDT = await getBinanceAds("USDT", "VES", "BUY");

        if (!rawRateUSD || !rawRateEUR || !rawRateUSDT) {
            throw new Error("Could not find raw rates");
        }

        // Parse Number (36,50 -> 36.50)
        const parsedRateUSD = parseFloat(rawRateUSD.replace(",", "."));
        const parsedRateEUR = parseFloat(rawRateEUR.replace(",", "."));
        const parsedRateUSDT = parseFloat(rawRateUSDT.replace(",", "."));

        if (isNaN(parsedRateUSD) || isNaN(parsedRateEUR)) {
            throw new Error(`Failed to parse rate: ${rawRateUSD} or ${rawRateEUR}`);
        }

        // Round to 2 decimals
        const roundedRateUSD = Math.round((parsedRateUSD + Number.EPSILON) * 100) / 100;
        const roundedRateEUR = Math.round((parsedRateEUR + Number.EPSILON) * 100) / 100;
        const roundedRateUSDT = Math.round((parsedRateUSDT + Number.EPSILON) * 100) / 100;

        // Using service role key for backend updates
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        // Initialize Supabase Client with Service Role Key to bypass RLS
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Create response object
        const response: { success: boolean; rate: number[]; data: any[]; error: string | null } = {
            success: true,
            rate: [roundedRateUSD, roundedRateEUR, roundedRateUSDT],
            data: [],
            error: null,
        };

        // Update USD_BCV rate
        try {
            const { data, error } = await supabase
                .from("rates")
                .upsert(
                    {
                        name: "USD_BCV",
                        display_name: "Dólar BCV",
                        price: roundedRateUSD,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "name" },
                )
                .select();

            if (error) throw new Error(error.message);

            response.data.push(data);

        } catch (error: any) {
            response.success = false;
            response.error = error.message;
            return NextResponse.json(response, { status: 500 });
        }

        // Update EUR_BCV rate
        try {
            const { data, error } = await supabase
                .from("rates")
                .upsert(
                    {
                        name: "EUR_BCV",
                        display_name: "Euro BCV",
                        price: roundedRateEUR,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "name" },
                )
                .select();

            if (error) throw new Error(error.message);

            response.data.push(data);

        } catch (error: any) {
            response.success = false;
            response.error = error.message;
            return NextResponse.json(response, { status: 500 });
        }

        // Update USDT rate
        try {
            const { data, error } = await supabase
                .from("rates")
                .upsert(
                    {
                        name: "USDT_BINANCE",
                        display_name: "USDT Binance",
                        price: roundedRateUSDT,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "name" },
                )
                .select();

            if (error) throw new Error(error.message);


            response.data.push(data);

        } catch (error: any) {
            response.success = false;
            response.error = error.message;
            return NextResponse.json(response, { status: 500 });
        }

        return NextResponse.json(response);
    } catch (error: any) {
        console.error("Updating rates failed:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
