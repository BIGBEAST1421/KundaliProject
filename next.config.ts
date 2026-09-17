import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native / data-heavy packages that must be loaded by Node at runtime, not bundled.
  serverExternalPackages: ["sweph", "geo-tz"],
};

export default nextConfig;
