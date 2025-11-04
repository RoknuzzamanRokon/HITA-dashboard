import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy disabled - using backend CORS instead
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://127.0.0.1:8002/:path*',
  //     },
  //   ]
  // },
};

export default nextConfig;
