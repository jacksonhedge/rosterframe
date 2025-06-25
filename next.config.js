/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  webpack: (config, { isServer }) => {
    // Suppress the warning from @supabase/realtime-js
    config.module.exprContextCritical = false;
    
    return config;
  },
}

module.exports = nextConfig