import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: false, // ✅ Prevents unnecessary double renders in development
  experimental: {
    turbo: {
      rules: {}, // ✅ Ensures Turbopack is active
    },
  },
  env: {
    NEXT_DISABLE_FAST_REFRESH: "true", // ✅ Explicitly disables Fast Refresh
  },
};

export default nextConfig;
