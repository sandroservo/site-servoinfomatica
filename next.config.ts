import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos dos produtos sincronizados do ERP Hiper (bucket S3 do Hiper Gestão).
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.hiper.com.br" },
    ],
  },
};

export default nextConfig;
