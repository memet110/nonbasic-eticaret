import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["iyzipay"],
  outputFileTracingIncludes: {
    '/api/iyzico/**/*': ['./node_modules/iyzipay/**/*'],
  },
};

export default nextConfig;
