import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // Add this line to ignore ESLint errors during builds
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

