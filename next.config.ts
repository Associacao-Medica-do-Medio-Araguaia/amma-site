import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite testar o site pelo celular via IP local (ex. http://192.168.x.x:3000) sem que o
  // Next bloqueie os recursos de dev (hot reload) por serem de uma origem "estranha".
  allowedDevOrigins: ["192.168.3.20"],
};

export default nextConfig;
