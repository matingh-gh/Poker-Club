import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // باعث می‌شود خطاهای ESLint بیلد را در Vercel متوقف نکنند
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
