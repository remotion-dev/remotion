import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {parsedCli} from './parsed-cli';

export const dynamicLibEnv = (
	indent: boolean,
	logLevel: LogLevel,
	binariesDirectory: string | null,
) => {
	const lib = path.dirname(
		RenderInternals.getExecutablePath({
			type: 'compositor',
			indent,
			logLevel,
			binariesDirectory,
		}),
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

export const ffmpegCommand = (args: string[], logLevel: LogLevel) => {
	const {value: binariesDirectory} =
		BrowserSafeApis.options.binariesDirectoryOption.getValue({
			commandLine: parsedCli,
		});

	const binary = RenderInternals.getExecutablePath({
		type: 'ffmpeg',
		indent: false,
		logLevel,
		binariesDirectory,
	});
	RenderInternals.makeFileExecutableIfItIsNot(binary);

	const done = spawnSync(binary, args, {
		stdio: 'inherit',
		env: dynamicLibEnv(false, logLevel, binariesDirectory),
		cwd: process.cwd(),
	});
	process.exit(done.status as number);
};

export const ffprobeCommand = (args: string[], logLevel: LogLevel) => {
	const {value: binariesDirectory} =
		BrowserSafeApis.options.binariesDirectoryOption.getValue({
			commandLine: parsedCli,
		});
	const binary = RenderInternals.getExecutablePath({
		type: 'ffprobe',
		indent: false,
		logLevel,
		binariesDirectory,
	});
	RenderInternals.makeFileExecutableIfItIsNot(binary);

	const done = spawnSync(binary, args, {
		cwd: process.cwd(),
		stdio: 'inherit',
		env: dynamicLibEnv(false, logLevel, binariesDirectory),
	});
	process.exit(done.status as number);
};
