import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import {chmodSync} from 'node:fs';
import path from 'node:path';
import {ConfigInternals} from './config';

export const dynamicLibEnv = (indent: boolean, logLevel: LogLevel) => {
	const lib = path.dirname(
		RenderInternals.getExecutablePath('compositor', indent, logLevel),
	);

	return {
		RUST_BACKTRACE: 'full',
		...(process.platform === 'darwin'
			? {
					DYLD_LIBRARY_PATH: lib,
				}
			: process.platform === 'win32'
				? {
						PATH: `${lib};${process.env.PATH}`,
					}
				: {
						LD_LIBRARY_PATH: lib,
					}),
	};
};

export const ffmpegCommand = (_root: string, args: string[]) => {
	const logLevel = ConfigInternals.Logging.getLogLevel();

	const binary = RenderInternals.getExecutablePath('ffmpeg', false, logLevel);
	if (!process.env.READ_ONLY_FS) {
		chmodSync(binary, 0o755);
	}

	const done = spawnSync(binary, args, {
		stdio: 'inherit',
		env: dynamicLibEnv(false, logLevel),
	});
	process.exit(done.status as number);
};

export const ffprobeCommand = (_root: string, args: string[]) => {
	const logLevel = ConfigInternals.Logging.getLogLevel();

	const binary = RenderInternals.getExecutablePath('ffprobe', false, logLevel);
	if (!process.env.READ_ONLY_FS) {
		chmodSync(binary, 0o755);
	}

	const done = spawnSync(binary, args, {
		cwd: path.dirname(binary),
		stdio: 'inherit',
		env: dynamicLibEnv(false, logLevel),
	});
	process.exit(done.status as number);
};
