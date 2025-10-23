/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@mediapipe/tasks-vision']
  }
};
export default nextConfig;
