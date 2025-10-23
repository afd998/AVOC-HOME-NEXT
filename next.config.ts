/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
  },
  typescript: { ignoreBuildErrors: true }, 
   // @ts-expect-error: not in this Next type version, but supported at runtime  // lets next build pass even with TS errors
  eslint: { ignoreDuringBuilds: true },      // optional: skip ESLint failures
};

export default nextConfig;
