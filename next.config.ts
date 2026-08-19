import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output when not building on Vercel (e.g. in our Docker builds)
  ...(process.env.VERCEL !== "1" && { output: "standalone" }),
};

export default nextConfig;
