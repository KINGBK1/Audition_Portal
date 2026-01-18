// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Proxy API calls under /api/* to your backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://audition-portal-jj3t.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;