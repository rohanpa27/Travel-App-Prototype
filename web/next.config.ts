import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static prototype: no server, no API routes, no image service.
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
