/** @type {import('next').NextConfig} */
// Static export (out/) served by the Cloudflare Worker in wrangler.jsonc.
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
