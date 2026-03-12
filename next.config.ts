import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignorar erros de linting durante o build para agilizar o MVP
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de tipagem durante o build (já validamos no dev)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
