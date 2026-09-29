/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'img.magnific.com', 'drive.google.com', 'lh3.googleusercontent.com'],
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "img.magnific.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    scrollRestoration: true,
  },
  async redirects() {
    return [
      {
        source: "/request-coverage",
        destination: "/coverage",
        permanent: true,
      },
      {
        source: "/request-event-coverage",
        destination: "/coverage",
        permanent: true,
      },
      {
        source: "/event-coverage",
        destination: "/coverage",
        permanent: true,
      },
      {
        source: "/coverage-request",
        destination: "/coverage",
        permanent: true,
      },
      {
        source: "/request",
        destination: "/coverage",
        permanent: true,
      },
      {
        source: "/requesteventcoverage",
        destination: "/coverage",
        permanent: true,
      },
      {
        source: "/eventcoverage",
        destination: "/coverage",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
