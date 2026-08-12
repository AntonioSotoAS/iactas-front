import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '172.17.78.66', // Tu IP actual
    '0.0.0.0'
  ],
};

export default nextConfig;
