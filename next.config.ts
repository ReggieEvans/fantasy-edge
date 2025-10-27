import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['rvzexiodhivvlucjusgs.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
      },
      {
        protocol: 'http',
        hostname: 'a.espncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.draftkings.com',
      },
      {
        protocol: 'https',
        hostname: 'dkn.gs',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '64mb', // or '200mb' for huge DK CSVs
    },
  },
}

export default nextConfig
