// Adapted from @swc/core package

import path from 'path';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';

let cachedIsMusl: boolean | null = null;

export function isMusl({
	indent,
	logLevel,
}: {
	indent: boolean;
	logLevel: LogLevel;
}) {
	if (cachedIsMusl !== null) {
		return cachedIsMusl;
	}

	if (!process.report && typeof Bun !== 'undefined') {
		Log.warn(
			{indent, logLevel},
			'Bun limitation: Could not determine if your Linux is using musl or glibc. Assuming glibc.',
		);

		cachedIsMusl = false;
		return cachedIsMusl;
	}

	const processReport = process.report;
	const excludeNetwork =
		processReport && 'excludeNetwork' in processReport
			? processReport.excludeNetwork
			: null;

	try {
		// Diagnostic reports can block on reverse DNS lookups for open sockets.
		// This option is available in Node.js 20.13.0+ and 22.0.0+.
		if (processReport && 'excludeNetwork' in processReport) {
			processReport.excludeNetwork = true;
		}

		const report = processReport?.getReport();
		if (report && typeof report === 'string') {
			Log.warn(
				{indent, logLevel},
				'Bun limitation: Could not determine if your Windows is using musl or glibc. Assuming glibc.',
			);

			cachedIsMusl = false;
			return cachedIsMusl;
		}

		// @ts-expect-error no types
		const {glibcVersionRuntime} = report.header;
		cachedIsMusl = !glibcVersionRuntime;
		return cachedIsMusl;
	} finally {
		if (processReport && 'excludeNetwork' in processReport) {
			processReport.excludeNetwork = excludeNetwork;
		}
	}
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
