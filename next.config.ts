import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist", "mammoth", "yauzl", "cities.json"],
  outputFileTracingIncludes: {
    "/api/jobs/match-resume": ["./features/jobs/server/resume-parser-worker.mjs", "./node_modules/pdfjs-dist/legacy/build/*.mjs", "./node_modules/mammoth/**/*", "./node_modules/yauzl/**/*"],
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
