import execa from 'execa';
import {DEFAULT_IMAGE_FORMAT, ImageFormat} from './image-format';
import {validateFfmpeg} from './validate-ffmpeg';

export const stitchFramesToVideo = async (options: {
	dir: string;
	fps: number;
	width: number;
	height: number;
	outputLocation: string;
	force: boolean;
	imageFormat?: ImageFormat;
}): Promise<void> => {
	const format = options.imageFormat ?? DEFAULT_IMAGE_FORMAT;
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
			'-pattern_type',
			'glob',
			'-i',
			`element-*.${format}`,
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
