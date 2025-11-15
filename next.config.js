/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy disabled - using backend CORS instead
  // rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://127.0.0.1:8001/:path*',
  //     },
  //   ];
  // },

  // Image optimization configuration
  images: {
    remotePatterns: [
      // TBO Holidays images
      {
        protocol: "https",
        hostname: "www.tboholidays.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.tboholidays.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "www.tboholidays.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**.tboholidays.com",
        pathname: "/**",
      },
      // Booking.com images (bstatic.com CDN)
      {
        protocol: "https",
        hostname: "**.bstatic.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**.bstatic.com",
        pathname: "/**",
      },
      // Common hotel image CDNs
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.imgix.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
      // Allow any HTTPS image source (for flexibility with hotel providers)
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      // Allow any HTTP image source (for flexibility with hotel providers)
      {
        protocol: "http",
        hostname: "**",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
