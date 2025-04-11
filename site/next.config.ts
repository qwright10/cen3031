import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  rewrites() {
    return Promise.resolve([
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ]);
  },
};

export default nextConfig;
