/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg', '@supabase/supabase-js', 'nodemailer'],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'image.pollinations.ai' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
    ],
  },
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
};

export default nextConfig;
