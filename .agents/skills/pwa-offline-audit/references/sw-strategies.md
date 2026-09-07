# Estrategias de Service Worker y Caché Offline (Serwist / Workbox)

Este documento detalla los estándares de almacenamiento y gestión de red para aplicaciones PWA móviles de alta resiliencia.

---

## 1. Estrategias de Caché Recomendadas

| Tipo de Recurso | Estrategia Óptima | Justificación |
| :--- | :--- | :--- |
| **Navegación (`/`, `/dashboard`)** | `StaleWhileRevalidate` o `NetworkFirst` | Permite renderizado instantáneo usando la versión local mientras busca actualizaciones en segundo plano. |
| **Assets compilados (`/_next/static/*`)** | `CacheFirst` (Inmutable) | Los nombres de archivo incluyen hashes de contenido; si el hash no cambia, el archivo es idéntico. |
| **Imágenes de tasas (`/BCV.png`, `/BINANCE.png`)** | `CacheFirst` con expiración | Rara vez cambian y son vitales para la apariencia visual offline. |
| **Consultas a Supabase (REST)** | Fallback en capa de aplicación (`localStorage`) | Es más seguro y predecible sincronizar los datos de tasas vía `localStorage` en React que interceptar peticiones de Supabase en el Service Worker. |
| **Endpoints de Cron (`/api/cron/*`)** | `NetworkOnly` | Nunca deben responder desde caché bajo ninguna circunstancia. |

---

## 2. Buenas Prácticas para Dispositivos Móviles

1. **Cuotas de Almacenamiento:**
   - La API de `CacheStorage` y `localStorage` en iOS Safari se somete a restricciones severas (si el dispositivo tiene poco espacio, puede purgar cachés tras 7 días de inactividad).
   - Mantener los recursos precacheados ligeros y evitar almacenar históricos de cotizaciones de varios años en crudo.

2. **Detección de Red en Dos Niveles:**
   - **Nivel Navegador:** Eventos globales `window.addEventListener('online')` y `window.addEventListener('offline')`.
   - **Nivel Aplicación:** Si `navigator.onLine` es `true` pero la llamada a Supabase arroja un error de red (`FetchError` / timeout), tratar el estado como modo sin conexión inmediato utilizando los datos del caché sin interrumpir al usuario.
