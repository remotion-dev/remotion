import {RenderInternals} from '@remotion/renderer';
import {spawnSync} from 'child_process';

export const ffmpegCommand = (_root: string, args: string[]) => {
	spawnSync(RenderInternals.getExecutablePath('ffmpeg'), args, {
		...RenderInternals.callFfExtraOptions(),
		stdio: 'inherit',
	});
};

export const ffprobeCommand = (_root: string, args: string[]) => {
	const done = spawnSync(RenderInternals.getExecutablePath('ffprobe'), args, {
		...RenderInternals.callFfExtraOptions(),
		stdio: 'inherit',
	});
	process.exit(done.status as number);
};
