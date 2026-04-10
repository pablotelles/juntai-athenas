import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@juntai/types"],
  webpack: (config) => {
    config.parallelism = 1;
    return config;
  },
};

export default nextConfig;
