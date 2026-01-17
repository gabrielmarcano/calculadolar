import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Conversion Calculator',
    short_name: 'Conversion',
    description: 'A simple calculator PWA built with Next.js 16',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        // purpose: 'maskable',
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
