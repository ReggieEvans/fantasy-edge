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
    ],
  },
}

export default nextConfig
