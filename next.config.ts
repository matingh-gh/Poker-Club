import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // typescript.ignoreBuildErrors دیگه اینجا نیست
};

export default nextConfig;
