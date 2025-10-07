import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Only enable static export for production builds (Netlify deployment)
  ...(isDev ? {} : {
    output: 'export',
    distDir: 'out',
  }),
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features for static export
  experimental: {
    // Disable features that require server-side rendering
  }
};

export default nextConfig;
