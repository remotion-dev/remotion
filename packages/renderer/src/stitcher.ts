import execa from 'execa';
import {validateFfmpeg} from './validate-ffmpeg';

export const stitchFramesToVideo = async (options: {
	dir: string;
	fps: number;
	width: number;
	height: number;
	outputLocation: string;
	force: boolean;
}): Promise<void> => {
	await validateFfmpeg();
	await execa(
		'ffmpeg',
		[
			'-r',
			String(options.fps),
			'-f',
			'image2',
			'-s',
			`${options.width}x${options.height}`,
			'-i',
			'element-%d.jpeg',
			'-vcodec',
			'libx264',
			'-crf',
			'16',
			options.force ? '-y' : null,
			'-pix_fmt',
			'yuv420p',
			options.outputLocation,
		].filter(Boolean) as string[],
		{cwd: options.dir}
	);
};
