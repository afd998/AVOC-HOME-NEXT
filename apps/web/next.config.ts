/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";
import path from "path";
import * as dotenv from "dotenv";

// Load .env.local from workspace root (two directories up from apps/web/)
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
  },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  transpilePackages: ["shared"],
  typescript: { ignoreBuildErrors: true },
  // @ts-expect-error: eslint is not in the type definition but is supported at runtime
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
