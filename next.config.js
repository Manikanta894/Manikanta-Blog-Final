/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    // Allow missing fonts to fall back gracefully in offline builds
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
};

module.exports = nextConfig;