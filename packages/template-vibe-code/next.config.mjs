// The browser bundler compiles your Remotion project inside a Web Worker using
// WebAssembly with shared memory. That requires the page to be cross-origin
// isolated, which is why COOP/COEP headers are set on every route that hosts
// the editor, the preview iframe and the compiler assets.
// See: https://www.remotion.dev/docs/browser-bundler

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  agentRules: false,
  // The starter project in src/remotion is read from disk at request time.
  outputFileTracingIncludes: {
    "/": ["./src/remotion/**/*"],
    "/api/project": ["./src/remotion/**/*"],
  },
  async headers() {
    return [
      "/",
      "/preview.html",
      "/preview.js",
      "/compiler/:path*",
      "/_next/:path*",
    ].map((source) => ({
      source,
      headers: [
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
      ],
    }));
  },
};

export default nextConfig;
