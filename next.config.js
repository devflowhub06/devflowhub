const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Temporarily disabled Sentry to fix webpack issues
// const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'framer-motion', 'recharts'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Performance improvements
    serverComponentsExternalPackages: ['@prisma/client', 'stripe'],
    // Optimize server components
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Performance optimizations
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
  generateEtags: false,
  images: {
    domains: ['lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    POSTHOG_HOST: process.env.POSTHOG_HOST,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // Environment-specific configurations
  ...(process.env.NODE_ENV === 'staging' && {
    assetPrefix: '/staging',
    basePath: '/staging',
  }),
}

// Temporarily disabled Sentry to fix webpack issues
// const sentryWebpackPluginOptions = {
//   silent: true,
//   org: "devflowhub",
//   project: "devflowhub",
// };

// module.exports = withSentryConfig(
//   withBundleAnalyzer(nextConfig),
//   sentryWebpackPluginOptions
// );

module.exports = withBundleAnalyzer(nextConfig);