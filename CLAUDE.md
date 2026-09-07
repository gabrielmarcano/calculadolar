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
- **Cron**: Triggered externally via [cron-job.org](https://cron-job.org/) calling the update endpoints with `Authorization: Bearer CRON_SECRET` header.
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

## Principios de Ingeniería

- **Robustez y calidad antes que rapidez**: Queda estrictamente prohibido realizar implementaciones apresuradas, adivinando requerimientos o asumiendo comportamientos sin contexto suficiente.
- **Investigación previa obligatoria**: Si una tarea presenta incógnitas técnicas, dependencias complejas o carece de un plan de ejecución validado, debe investigarse a fondo antes de escribir código. Si no se cuenta con la certeza y contexto necesario, la tarea no se ejecuta hasta completar dicha investigación.

## Guía de Estilo para TODO.md

El archivo `TODO.md` mantiene el backlog del proyecto de forma plana y objetiva. Toda modificación o nueva tarea debe seguir estas reglas:

1. **Sin emojis**: Queda estrictamente prohibido el uso de emojis en cualquier sección de `TODO.md`.
2. **Estructura basada en checkboxes**:
   - Tareas pendientes: `- [ ]`
   - Tareas finalizadas: `- [x]`
3. **División de secciones**:
   - `## Tareas Completadas`
   - `## Tareas Pendientes`
4. **Plantilla estándar obligatoria por tarea**:
   ```markdown
   - [ ] **Título conciso y formal de la tarea**
     - **Descripcion**: Explicación objetiva del propósito y justificación del cambio.
     - **Alcance**:
       - Entregable técnico o criterio de aceptación verificable 1.
       - Entregable técnico o criterio de aceptación verificable 2.
     - **Investigacion previa**: (Incluir siempre que existan incógnitas técnicas, limitaciones de plataforma o riesgos) Detalle explícito de lo que se debe investigar y validar antes de iniciar la codificación.
   ```
5. **Tono y redacción**: Redacción homogénea, técnica, concisa y en tercera persona.

## Reglas y Habilidades (.agents/)

El proyecto cuenta con reglas y habilidades estandarizadas en `.agents/`:
- **Reglas**: `.agents/rules/mobile-first-ergonomics.md` (Apple HIG / Material Design 3) y `.agents/rules/clean-architecture.md` (React 19 / Next.js 16 Clean Architecture).
- **Habilidades**: `.agents/skills/mobile-ux-audit/` (Auditoría UX móvil), `.agents/skills/component-decomposition/` (Descomposición de monolitos) y `.agents/skills/pwa-offline-audit/` (Resiliencia PWA offline).
- Ver detalle completo en `AGENTS.md`.
