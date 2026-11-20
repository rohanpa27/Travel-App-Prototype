import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static prototype: no server, no API routes, no image service.
  output: "export",
  images: { unoptimized: true },
  // Set NEXT_PUBLIC_BASE_PATH=/Travel-App-Prototype when building for GitHub Pages. Empty for local use.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
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
