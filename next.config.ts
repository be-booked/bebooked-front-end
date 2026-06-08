import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Patches the Node.js runtime to emulate Cloudflare Workers during `next dev`.
// Guard ensures this never runs during `next build` or `next start`.
if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
}
