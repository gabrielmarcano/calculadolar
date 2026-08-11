# CalculaDolar

📱 PWA para consultar y convertir tasas de cambio en Venezuela (BCV y Binance P2P) en tiempo real, con histórico de precios.

🔗 **[calculadolar-theta.vercel.app](https://calculadolar-theta.vercel.app)**

Aplicación móvil-first, en español y con modo oscuro, construida con Next.js.

## Características

- **Tasas en tiempo real** — USD/EUR del BCV (Banco Central de Venezuela) y USDT de Binance P2P.
- **Calculadora** — conversión entre monedas con evaluación de expresiones matemáticas (mathjs).
- **Histórico de precios** — gráficos de líneas con rangos de 7d, 30d, 90d y 1 año.
- **PWA instalable** — funciona offline gracias al service worker (Serwist).
- **Detalles móviles** — toques con vibración (haptic), mantener presionado para copiar valores y notificaciones tipo toast.

## Stack

| Área          | Tecnología                                              |
| ------------- | ------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org) (App Router), React 19 |
| Lenguaje      | TypeScript                                              |
| Estilos       | Tailwind CSS 4                                          |
| Base de datos | [Supabase](https://supabase.com)                        |
| Gráficos      | [Recharts](https://recharts.org)                        |
| Cálculo       | [mathjs](https://mathjs.org)                            |
| Scraping      | Cheerio + Axios                                         |
| PWA           | [Serwist](https://serwist.pages.dev)                    |

## Cómo empezar

```bash
npm install
npm run dev      # Servidor de desarrollo en http://localhost:3000
```

Otros comandos:

```bash
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Revisión con ESLint
```

## Variables de entorno

Crea un archivo `.env.local` con:

```bash
# Cliente (público)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=

# Servidor (nunca exponer en el cliente)
SUPABASE_SERVICE_ROLE_KEY=

# Autoriza las llamadas a los endpoints de actualización de tasas
CRON_SECRET=
```

## Arquitectura

### Flujo de datos

`app/page.tsx` obtiene las tasas desde Supabase al montar, las cachea en `localStorage` y las pasa a los componentes. La app alterna entre tres vistas: tasas (`RateView`), calculadora (`CalculatorView`) e histórico (`HistoryView`).

### Backend y actualización de tasas

Las tasas se actualizan mediante endpoints API protegidos con `Authorization: Bearer CRON_SECRET`, disparados por [cron-job.org](https://cron-job.org/) cada hora:

- `app/api/cron/update-bcv-rates/route.ts` — scrapea el sitio del BCV para USD/EUR→VES.
- `app/api/cron/update-binance-rates/route.ts` — consulta la API de Binance P2P para USDT/VES.
- `app/api/history/route.ts` — endpoint público que devuelve el histórico de precios (downsampled).

Cada actualización hace `upsert` en la tabla `rates` (precios actuales) e `insert` en `rate_history` (histórico).

## Despliegue

Desplegado en [Vercel](https://vercel.com).
