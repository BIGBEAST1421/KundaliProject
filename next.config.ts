import type { NextConfig } from "next";

// Native / data-heavy packages loaded by Node at runtime, not bundled.
const externals = ["sweph", "geo-tz"];

// `sweph` picks its binary at runtime via node-gyp-build, so the file tracer cannot see
// `prebuilds/`. Include it explicitly for every route that computes a chart, or Vercel
// functions fail with "No native build was found".
const swephPrebuilds = [
  "./node_modules/sweph/prebuilds/**",
  "./node_modules/.pnpm/sweph@*/node_modules/sweph/prebuilds/**",
];

const nextConfig: NextConfig = {
  serverExternalPackages: externals,
  outputFileTracingIncludes: {
    "/api/reports": swephPrebuilds,
    "/api/match": swephPrebuilds,
    "/api/preview": swephPrebuilds,
  },
};

export default nextConfig;
