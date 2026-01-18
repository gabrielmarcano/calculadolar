import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Calculadolar',
    short_name: 'Calculadolar',
    description: 'Calculadora de Dolar',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: '#000000',
    background_color: '#ffffff',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
  };
}
