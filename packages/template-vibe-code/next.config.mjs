// The browser bundler compiles your Remotion project inside a Web Worker using
// WebAssembly with shared memory. That requires the page to be cross-origin
// isolated, which is why COOP/COEP headers are set on every route that hosts
// the editor, the preview iframe and the compiler assets.
// See: https://www.remotion.dev/docs/browser-bundler

// Setting STATIC_EXPORT_BASE_PATH (for example "/" or "/editor") exports the
// editor as static files, with the starter project embedded at build time and
// saving disabled. Only the *.static.tsx routes take part in the export, so the
// page and the /api/project route that read the project from disk stay out.
// Serve the exported files with the COOP/COEP headers yourself.
const staticExportBasePath = process.env.STATIC_EXPORT_BASE_PATH;
const basePath =
  staticExportBasePath === undefined
    ? ""
    : staticExportBasePath.replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  agentRules: false,
  basePath,
  // Read by src/lib/base-path.ts to address public files and the API.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(staticExportBasePath === undefined
    ? {
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
      }
    : {
        output: "export",
        pageExtensions: ["static.tsx"],
      }),
};

export default nextConfig;
