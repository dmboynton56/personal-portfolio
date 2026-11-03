/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/chat': ['./docs/**/*', './public/data/rag_embeddings.json'],
    },
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    optimizePackageImports: ['lucide-react', 'react-icons', 'framer-motion'],
  },
  trailingSlash: true,
}

export default nextConfig
