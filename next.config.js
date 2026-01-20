const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from network IP during development
  allowedDevOrigins: ["192.168.88.124"],

  // Webpack configuration for better chunk handling (only when not using Turbopack)
  webpack: (config, { dev, isServer }) => {
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    };

    // Only apply webpack config when not using Turbopack
    if (!process.env.TURBOPACK && !isServer) {
      // Improve chunk loading reliability
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Create more stable chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
          },
        },
      };
    }
    return config;
  },

  // Experimental features
  experimental: {
    // Optimize chunk loading
    optimizePackageImports: ["lucide-react"],
  },

  // Turbopack configuration (for when using --turbopack flag)
  turbopack: {
    rules: {
      // Configure Turbopack rules if needed
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

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

module.exports = withBundleAnalyzer(nextConfig);
