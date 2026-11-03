import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        // TODO: For security, need configure in production deployment
        hostname: '*',
      },
    ],
  },
}

export default nextConfig
