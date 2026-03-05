import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // esbuild-wasm is needed for Serwist to compile the SW on the fly
  serverExternalPackages: ['esbuild-wasm'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sptjftsocyxytuizjlzv.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
