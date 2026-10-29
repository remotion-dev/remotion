import type * as RspackCore from '@rspack/core';

export const getRspack = (): typeof RspackCore => {
	if (typeof Bun === 'undefined') {
		const [major, minor] = process.versions.node.split('.').map(Number);
		if (
			!(
				(major === 20 && minor >= 19) ||
				(major === 22 && minor >= 12) ||
				major > 22
			)
		) {
			throw new Error(
				`Rspack requires Node.js 20.19 or newer in the 20.x release line, or Node.js 22.12 or newer. You are using ${process.version}. Upgrade Node.js or disable Rspack to use Webpack.`,
			);
		}
	}

	// Rspack is ESM-only and must not be loaded when using Webpack on older Node.js versions.
	return require('@rspack/core');
};
