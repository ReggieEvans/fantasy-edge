import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['rvzexiodhivvlucjusgs.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
      },
    ],
  },
}

export default nextConfig
