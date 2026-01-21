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

        const { data: html } = await axios.get(url, {
            httpsAgent: agent,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        return html;
    } catch (error) {
        console.error("Error fetching HTML:", error);
        return null;
    }
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const html = await getHTML("https://www.bcv.org.ve/");
        if (!html) throw new Error("Failed to fetch BCV HTML");

        const $ = cheerio.load(html);
        const rawRateUSD = $("#dolar strong").text().trim();
        const rawRateEUR = $("#euro strong").text().trim();

        if (!rawRateUSD || !rawRateEUR) {
            throw new Error("Could not find raw rates");
        }

        // Parse Number (36,50 -> 36.50)
        const parsedRateUSD = parseFloat(rawRateUSD.replace(",", "."));
        const parsedRateEUR = parseFloat(rawRateEUR.replace(",", "."));

        if (isNaN(parsedRateUSD) || isNaN(parsedRateEUR)) {
            throw new Error(`Failed to parse rate: ${rawRateUSD} or ${rawRateEUR}`);
        }

        // Round to 2 decimals
        const roundedRateUSD = Math.round((parsedRateUSD + Number.EPSILON) * 100) / 100;
        const roundedRateEUR = Math.round((parsedRateEUR + Number.EPSILON) * 100) / 100;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // BCV USD
        const { data: usdData, error: usdError } = await supabase
            .from("rates")
            .upsert(
                {
                    name: "USD_BCV",
                    display_name: "Dólar BCV",
                    price: roundedRateUSD,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "name" }
            )
            .select();

        if (usdError) throw new Error(usdError.message);

        // BCV EUR
        const { data: eurData, error: eurError } = await supabase
            .from("rates")
            .upsert(
                {
                    name: "EUR_BCV",
                    display_name: "Euro BCV",
                    price: roundedRateEUR,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "name" }
            )
            .select();

        if (eurError) throw new Error(eurError.message);

        return NextResponse.json({
            success: true,
            rates: [
                { name: "USD_BCV", price: roundedRateUSD, data: usdData },
                { name: "EUR_BCV", price: roundedRateEUR, data: eurData },
            ],
            error: null,
        });
    } catch (error: any) {
        console.error("Updating BCV rates failed:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}