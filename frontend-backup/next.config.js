/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Skip linting and type checking during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Modern optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'recharts',
      'date-fns'
    ],
    webVitalsAttribution: ['CLS', 'LCP'],
    serverComponentsExternalPackages: ['leaflet'],
  },

  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // API proxy to Spring Boot backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/ws/:path*',
        destination: 'http://localhost:8080/ws/:path*',
      },
    ];
  },

  // Environment variables
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8080',
    WS_URL: process.env.WS_URL || 'ws://localhost:8080',
  },

  // Image optimization
  images: {
    domains: ['localhost', 'your-api-domain.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle analyzer (enable with ANALYZE=true)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analyzer-report.html',
          })
        )
      }
      return config
    },
  }),

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              enforce: true,
            },
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 20,
            },
            ui: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 15,
            },
          },
        },
        usedExports: true,
        sideEffects: false,
      }
    }

    // Optimize imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    }

    // Performance optimizations
    if (!dev) {
      // Enable tree shaking for better bundle size
      config.optimization.providedExports = true
      config.optimization.usedExports = true

      // Minimize CSS
      config.optimization.minimizer = config.optimization.minimizer || []

      // Add compression
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production'),
        })
      )
    }

    // Development optimizations
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      }
    }

    return config;
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Output configuration for production
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;
