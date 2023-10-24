import {RenderInternals} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import {chmodSync} from 'node:fs';
import {ConfigInternals} from './config';

export const ffmpegCommand = (_root: string, args: string[]) => {
	const logLevel = ConfigInternals.Logging.getLogLevel();

	const binary = RenderInternals.getExecutablePath('ffmpeg', false, logLevel);
	if (!process.env.READ_ONLY_FS) {
		chmodSync(binary, 0o755);
	}

	const done = spawnSync(binary, args, {
		...RenderInternals.dynamicLibraryPathOptions(false, logLevel),
		stdio: 'inherit',
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
		...RenderInternals.dynamicLibraryPathOptions(false, logLevel),
		stdio: 'inherit',
	});
	process.exit(done.status as number);
};
