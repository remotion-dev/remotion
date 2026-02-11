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
};

module.exports = nextConfig;
