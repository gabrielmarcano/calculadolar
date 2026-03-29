import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // esbuild-wasm is needed for Serwist to compile the SW on the fly
  serverExternalPackages: ['esbuild-wasm'],
};

export default nextConfig;
