# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

## Architecture

CalculaDolar is a **Next.js 16 (App Router)** PWA for Venezuelan currency exchange rate tracking and conversion. Spanish-localized, mobile-first, dark-themed.

### Data Flow
- `app/page.tsx` fetches rates from Supabase on mount, caches to localStorage (`calculadolar_rates_cache`), and passes data down to child components
- Three views toggled by state: `RateView` (rate display), `CalculatorView` (calculator with multi-currency conversion), and `HistoryView` (historic price chart)
- No global state library — props drilling from page to components

### Backend
- **BCV rate updater**: `app/api/cron/update-bcv-rates/route.ts` — scrapes BCV website (Cheerio/Axios) for USD/EUR→VES rates. Upserts `USD_BCV` and `EUR_BCV` to Supabase.
- **Binance rate updater**: `app/api/cron/update-binance-rates/route.ts` — fetches Binance P2P API for USDT/VES merchant ads. Upserts `USDT_BINANCE` to Supabase.
- Both endpoints are protected by `Authorization: Bearer CRON_SECRET` header.
- Both endpoints also INSERT into `rate_history` table for historic tracking (best-effort, non-fatal).
- **History API**: `app/api/history/route.ts` — public GET endpoint returning downsampled price history. Params: `rate_name`, `range` (7d/30d/90d/1y).
- **Cron**: 3 GitHub Actions workflows in `.github/workflows/`:
  - `update-rates.yml` — hourly at :00, calls both endpoints
  - `update-bcv-rates.yml` — hourly at :00, calls BCV only (redundant with update-rates.yml)
  - `update-binance-rates.yml` — hourly at :10, calls Binance only
- **DB tables**: `rates` (live prices, upserted on `name` column), `rate_history` (append-only, indexed on `rate_name, recorded_at DESC`)

### PWA / Service Worker
- Uses **Serwist** for service worker management
- SW source: `app/sw.ts`, served via dynamic route `app/serwist/[path]/route.ts`
- `SerwistProvider.tsx` wraps the app; `usePWAInstall` hook manages install prompt
- Stale-while-revalidate caching for navigation routes

### Config
- `next.config.ts` — `serverExternalPackages: ['esbuild-wasm']` for Serwist SW compilation
- Rate icons are served locally from `/public/` via `next/image` (BCV.png, BINANCE.png)

### Key Libraries
- **mathjs** — expression evaluation in the calculator
- **Cheerio + Axios** — HTML scraping for BCV rates
- **Supabase** — database (`rates` table for live prices, `rate_history` for historic data)
- **Recharts** — SVG line charts for historic price visualization
- **esbuild-wasm** — required by Serwist for on-the-fly SW compilation

## Conventions

- Functional components with TypeScript interfaces for props
- Dark theme colors: `#0a0a0a`, `#121212`, `#1e1e1e`
- Use `triggerHaptic()` from `@/lib/utils` for interactive calculator buttons
- Mobile-first: touch-friendly targets, prevent text selection on interactive elements
- Tailwind CSS 4 utility classes only
- Path alias: `@/*` maps to project root

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — client-side Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only, for rate upserts (never expose client-side)
- `CRON_SECRET` — authorizes rate update API calls
