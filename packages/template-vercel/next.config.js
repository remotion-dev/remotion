/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Include the Remotion bundle in the API route
	outputFileTracingIncludes: {
		"/api/render": ["./.remotion/**/*"],
	},
};

module.exports = nextConfig;
