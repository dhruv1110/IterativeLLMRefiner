import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
    eslint: {
        ignoreDuringBuilds: true, // Skip ESLint errors during 'next build'
    },
};

export default nextConfig;
