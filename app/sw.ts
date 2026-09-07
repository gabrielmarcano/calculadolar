/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/turbopack/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, ExpirationPlugin, StaleWhileRevalidate, Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request, url }) =>
        request.destination === 'image' ||
        /\.(?:png|jpg|jpeg|svg|webp|ico|gif)$/i.test(url.pathname),
      handler: new CacheFirst({
        cacheName: 'images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new StaleWhileRevalidate({
        cacheName: "pages",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
