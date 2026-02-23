const { BUILD_DIR } = require("./build-dir.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Include the Remotion bundle in the API route
  outputFileTracingIncludes: {
    "/api/render": [
      "./" + BUILD_DIR + "/**/*",
      "./render.ts",
      "./ensure-browser.ts",
    ],
  },
  webpack: (config) => {
    config.ignoreWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings.push({
      module: /@mediabunny\/ac3/,
    });

    return config;
  },
};

module.exports = nextConfig;
