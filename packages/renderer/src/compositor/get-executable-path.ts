// Adapted from @swc/core package

import path from 'path';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';

let warned = false;

export function isMusl({
	indent,
	logLevel,
}: {
	indent: boolean;
	logLevel: LogLevel;
}) {
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
	type: 'compositor' | 'ffmpeg' | 'ffprobe',
	indent: boolean,
	logLevel: LogLevel,
): string => {
	const base = getExecutableDir(indent, logLevel);
	switch (type) {
		case 'compositor':
			if (process.platform === 'win32') {
				return path.join(base, 'compositor.exe');
			}

			return path.join(base, 'compositor');

		case 'ffmpeg':
			if (process.platform === 'win32') {
				return path.join(base, 'ffmpeg.exe');
			}

			return path.join(base, 'ffmpeg');
		case 'ffprobe':
			if (process.platform === 'win32') {
				return path.join(base, 'ffprobe.exe');
			}

			return path.join(base, 'ffprobe');

		default:
			throw new Error(`Unknown executable type: ${type}`);
	}
};

export const getExecutableDir = (
	indent: boolean,
	logLevel: LogLevel,
): string => {
	if (process.env.COMPOSITOR_DIR) {
		return process.env.COMPOSITOR_DIR;
	}

	switch (process.platform) {
		case 'win32':
			switch (process.arch) {
				case 'x64':
					return require('@remotion/compositor-win32-x64-msvc').dir;
				default:
					throw new Error(
						`Unsupported architecture on Windows: ${process.arch}`,
					);
			}

		case 'darwin':
			switch (process.arch) {
				case 'x64':
					return require('@remotion/compositor-darwin-x64').dir;
				case 'arm64':
					return require('@remotion/compositor-darwin-arm64').dir;
				default:
					throw new Error(`Unsupported architecture on macOS: ${process.arch}`);
			}

		case 'linux': {
			const musl = isMusl({indent, logLevel});
			switch (process.arch) {
				case 'x64':
					if (musl) {
						return require('@remotion/compositor-linux-x64-musl').dir;
					}

					return require('@remotion/compositor-linux-x64-gnu').dir;
				case 'arm64':
					if (musl) {
						return require('@remotion/compositor-linux-arm64-musl').dir;
					}

					return require('@remotion/compositor-linux-arm64-gnu').dir;

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
