// Adapted from @swc/core package

function isMusl() {
	// @ts-expect-error no types
	const {glibcVersionRuntime} = process.report.getReport().header;
	return !glibcVersionRuntime;
}

export const getExecutablePath = (
	type: 'compositor' | 'ffmpeg' | 'ffprobe' | 'ffmpeg-cwd'
): string => {
	const key =
		type === 'compositor'
			? 'binaryPath'
			: type === 'ffmpeg'
			? 'ffmpegPath'
			: type === 'ffprobe'
			? 'ffprobePath'
			: 'ffmpegCwd';

	switch (process.platform) {
		case 'win32':
			switch (process.arch) {
				case 'x64':
					return require('@remotion/compositor-win32-x64-msvc')[key];
				default:
					throw new Error(
						`Unsupported architecture on Windows: ${process.arch}`
					);
			}

		case 'darwin':
			switch (process.arch) {
				case 'x64':
					return require('@remotion/compositor-darwin-x64')[key];
				case 'arm64':
					return require('@remotion/compositor-darwin-arm64')[key];
				default:
					throw new Error(`Unsupported architecture on macOS: ${process.arch}`);
			}

		case 'linux':
			switch (process.arch) {
				case 'x64':
					if (isMusl()) {
						return require('@remotion/compositor-linux-x64-musl')[key];
					}

					return require('@remotion/compositor-linux-x64-gnu')[key];
				case 'arm64':
					if (isMusl()) {
						return require('@remotion/compositor-linux-arm64-musl')[key];
					}

					return require('@remotion/compositor-linux-arm64-gnu')[key];

				default:
					throw new Error(`Unsupported architecture on Linux: ${process.arch}`);
			}

		default:
			throw new Error(
				`Unsupported OS: ${process.platform}, architecture: ${process.arch}`
			);
	}
};
