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
  // API configuration to handle larger request bodies for chatbot file uploads
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Reasonable limit for resume/job posting uploads
    },
    responseLimit: false,
  },
  // For App Router API routes (which we're using)
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
};

module.exports = nextConfig;
