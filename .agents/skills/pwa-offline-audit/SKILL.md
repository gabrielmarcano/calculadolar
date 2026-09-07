---
name: pwa-offline-audit
description: >-
  Audita, valida y blinda la capacidad sin conexión (offline-first) y la resiliencia de la Progressive Web App (PWA),
  inspeccionando el Service Worker (Serwist), la caché de activos estáticos y la persistencia local de datos.
  Úsalo cuando se modifiquen rutas, imágenes estáticas, fuentes o la configuración del Service Worker en app/sw.ts.
---

# PWA Offline Resilience Audit (Serwist & Workbox Standards)

Esta habilidad proporciona un flujo estricto para asegurar que la aplicación móvil funcione al 100% de manera offline e instantánea, garantizando que el usuario pueda calcular conversiones y consultar las últimas tasas guardadas incluso sin red o en modo avión.

Para una guía detallada de las estrategias de Service Worker y políticas de caché, consulta [sw-strategies.md](./references/sw-strategies.md).

---

## Flujo de Auditoría Offline Paso a Paso

### Paso 1: Auditoría de Activos Estáticos Críticos (App Shell)
1. **Verificar precaché de recursos esenciales:**
   - Íconos de divisas (`/BCV.png`, `/BINANCE.png`).
   - Íconos de aplicación y manifest (`/favicon.ico`, `/apple-icon.png`, `/icon0.svg`, `/icon1.png`, `/manifest.json`).
   - Documento HTML base y chunks generados por Next.js (`/_next/static/...`).
2. **Bandera roja:** ¿Hay referencias a imágenes o scripts externos no cacheados que bloqueen la carga inicial?
   - Todo activo visual debe residir localmente en `public/` y estar cubierto por las reglas de Serwist.

### Paso 2: Auditoría de Estrategias en `app/sw.ts`
1. **Verificar correspondencia de rutas:**
   - **Navegación / Documentos:** Estrategia `NetworkFirst` o `StaleWhileRevalidate` con fallback a la última versión disponible.
   - **Estáticos (JS, CSS, Fuentes, Imágenes):** Estrategia `CacheFirst` con expiración prudente.
   - **APIs de fondo y Cron:** Deben ser `NetworkOnly` (los endpoints de actualización `/api/cron/*` nunca deben cachearse en el cliente).
2. **Verificar tamaño y expiración de caché:**
   - Asegurar límites razonables de entradas (`maxEntries`) para no saturar el almacenamiento de dispositivos móviles con memoria restringida.

### Paso 3: Auditoría de Resiliencia en el Almacenamiento Local
1. **Inspeccionar flujo de respaldo en cliente (`app/page.tsx` y componentes):**
   - Verificar que al montar la aplicación se lea inmediatamente de `localStorage` (`calculadolar_rates_cache`) antes de intentar cualquier llamada de red.
   - Si no hay conexión disponible (`!navigator.onLine` o fallo en Supabase), la interfaz debe renderizar inmediatamente los datos de la caché sin quedarse en pantalla de carga infinita.
2. **Indicador de estado sin conexión:**
   - Comprobar que se muestre un aviso sutil (`isOffline`) sin ocultar la calculadora ni interrumpir la operativa matemática.

### Paso 4: Protocolo de Prueba en Modo Avión
Para validar que la PWA es 100% resiliente:
1. Compilar el proyecto con `npm run build`.
2. Levantar el servidor con `npm run start` o probar en un navegador con Service Worker activo.
3. Desactivar la red en DevTools (modo *Offline*).
4. Recargar la página:
   - ✅ El visor y el teclado deben responder de inmediato.
   - ✅ Las tasas previas deben seguir visibles y funcionales.
   - ✅ El indicador de "Sin conexión" debe activarse discretamente.
