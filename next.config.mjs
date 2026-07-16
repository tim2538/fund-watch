import withPWAInit from "@ducanh2912/next-pwa";

// On a GitHub Pages *project* site the app is served from a sub-path
// (https://<user>.github.io/<repo>). Set NEXT_PUBLIC_BASE_PATH=/<repo> in the
// deploy workflow. Left empty for local dev so everything lives at "/".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const withPWA = withPWAInit({
  dest: "public",
  // Service worker is disabled in dev so it doesn't cache while you code.
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static HTML export -> writes to ./out (works on any static host incl. GitHub Pages).
  output: "export",
  basePath,
  // No Node server on a static host, so skip Next image optimization.
  images: { unoptimized: true },
  // Emit /path/index.html so GitHub Pages resolves routes without a server.
  trailingSlash: true,
};

export default withPWA(nextConfig);
