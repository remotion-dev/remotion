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

	const report = process.report?.getReport();
	if (report && typeof report === 'string') {
		if (!warned) {
			Log.warn(
				{indent, logLevel},
				'Bun limitation: Could not determine if your Windows is using musl or glibc. Assuming glibc.',
			);
		}

		warned = true;
		return false;
	}

	// @ts-expect-error no types
	const {glibcVersionRuntime} = report.header;
	return !glibcVersionRuntime;
}

export const getExecutablePath = ({
	indent,
	logLevel,
	type,
	binariesDirectory,
}: {
	type: 'compositor' | 'ffmpeg' | 'ffprobe';
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
}): string => {
	const base = binariesDirectory ?? getExecutableDir(indent, logLevel);
	switch (type) {
		case 'compositor':
			if (process.platform === 'win32') {
				return path.resolve(base, 'remotion.exe');
			}

			return path.resolve(base, 'remotion');

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
