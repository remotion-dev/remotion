// Adapted from @swc/core package

function isMusl() {
	// @ts-expect-error no types
	const {glibcVersionRuntime} = process.report.getReport().header;
	return !glibcVersionRuntime;
}

export const getExecutablePath = () => {
	switch (process.platform) {
		case 'win32':
			switch (process.arch) {
				case 'x64':
					return require('@remotion/compositor-win32-x64-msvc').binaryPath;
				default:
					throw new Error(
						`Unsupported architecture on Windows: ${process.arch}`
					);
			}

		case 'darwin':
			switch (process.arch) {
				case 'x64':
					return require('@remotion/compositor-darwin-x64').binaryPath;
				case 'arm64':
					return require('@remotion/compositor-darwin-arm64').binaryPath;
				default:
					throw new Error(`Unsupported architecture on macOS: ${process.arch}`);
			}

		case 'linux':
			switch (process.arch) {
				case 'x64':
					if (isMusl()) {
						return require('@remotion/compositor-linux-x64-musl').binaryPath;
					}

					return require('@remotion/compositor-linux-x64-gnu').binaryPath;
				case 'arm64':
					if (isMusl()) {
						return require('@remotion/compositor-linux-arm64-musl').binaryPath;
					}

					return require('@remotion/compositor-linux-arm64-gnu').binaryPath;

				default:
					throw new Error(`Unsupported architecture on Linux: ${process.arch}`);
			}

		default:
			throw new Error(
				`Unsupported OS: ${process.platform}, architecture: ${process.arch}`
			);
	}
};
