import {RenderInternals} from '@remotion/renderer';
import {spawnSync} from 'child_process';

export const ffmpegCommand = (_root: string, args: string[]) => {
	const done = spawnSync(
		RenderInternals.getExecutablePath('ffmpeg', false),
		args,
		{
			...RenderInternals.callFfExtraOptions(),
			stdio: 'inherit',
		}
	);
	process.exit(done.status as number);
};

export const ffprobeCommand = (_root: string, args: string[]) => {
	const done = spawnSync(
		RenderInternals.getExecutablePath('ffprobe', false),
		args,
		{
			...RenderInternals.callFfExtraOptions(),
			stdio: 'inherit',
		}
	);
	process.exit(done.status as number);
};
