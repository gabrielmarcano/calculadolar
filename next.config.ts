import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // esbuild-wasm is needed for Serwist to compile the SW on the fly
  serverExternalPackages: ['esbuild-wasm'],
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:all*(png|jpg|jpeg|svg|webp|ico|json)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
