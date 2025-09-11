import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Prevent optional dev-only dependency from breaking the bundle
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    delete (config.resolve.alias as any)["pino-pretty"]; // we install it now; let it resolve
    return config;
  },
};

export default nextConfig;
