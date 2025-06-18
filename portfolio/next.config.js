/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "lawrencehua.com" }],
        destination: "https://www.lawrencehua.com/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
