// Adapted from @swc/core package

import type {LogLevel} from '../log-level';
import {Log} from '../logger';

let warned = false;

function isMusl({indent, logLevel}: {indent: boolean; logLevel: LogLevel}) {
	// @ts-expect-error bun no types
	if (!process.report && typeof Bun !== 'undefined') {
		if (!warned) {
			Log.warn(
				{indent, logLevel},
				'Bun limitation: Could not determine if your Linux is using musl or glibc. Assuming glibc.',
			);
		}

		warned = true;
		return false;
	}

	// @ts-expect-error no types
	const {glibcVersionRuntime} = process.report.getReport().header;
	return !glibcVersionRuntime;
}

export const getExecutablePath = (
	type: 'compositor' | 'ffmpeg' | 'ffprobe' | 'ffmpeg-cwd',
	indent: boolean,
	logLevel: LogLevel,
): string => {
	if (type === 'compositor' && process.env.COMPOSITOR_PATH) {
		return process.env.COMPOSITOR_PATH;
	}

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
						`Unsupported architecture on Windows: ${process.arch}`,
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

		case 'linux': {
			const musl = isMusl({indent, logLevel});
			switch (process.arch) {
				case 'x64':
					if (musl) {
						return require('@remotion/compositor-linux-x64-musl')[key];
					}

					return require('@remotion/compositor-linux-x64-gnu')[key];
				case 'arm64':
					if (musl) {
						return require('@remotion/compositor-linux-arm64-musl')[key];
					}

					return require('@remotion/compositor-linux-arm64-gnu')[key];

				default:
					throw new Error(`Unsupported architecture on Linux: ${process.arch}`);
			}
		}

		default:
			throw new Error(
				`Unsupported OS: ${process.platform}, architecture: ${process.arch}`,
			);
	}
};
