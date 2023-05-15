import {RenderInternals} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import {chmodSync} from 'node:fs';

export const ffmpegCommand = (_root: string, args: string[]) => {
	const binary = RenderInternals.getExecutablePath('ffmpeg');
	chmodSync(binary, 0o755);
	const done = spawnSync(binary, args, {
		...RenderInternals.dynamicLibraryPathOptions(),
		stdio: 'inherit',
	});
	process.exit(done.status as number);
};

export const ffprobeCommand = (_root: string, args: string[]) => {
	const binary = RenderInternals.getExecutablePath('ffprobe');
	chmodSync(binary, 0o755);
	const done = spawnSync(binary, args, {
		...RenderInternals.dynamicLibraryPathOptions(),
		stdio: 'inherit',
	});
	process.exit(done.status as number);
};
