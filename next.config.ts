import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX || '' : '',
  basePath: process.env.NODE_ENV === 'production' ? process.env.BASE_PATH || '' : '',
};

export default nextConfig;
