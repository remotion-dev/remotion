import execa from 'execa';
import {OutputFormat, PixelFormat} from 'remotion';
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
	pixelFormat?: PixelFormat;
	outputFormat?: OutputFormat;
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
			options.outputFormat === 'mp4' ? '-vcodec' : '-c:v',
			options.outputFormat === 'mp4'
				? 'libx264'
				: options.outputFormat === 'webm-v8'
				? 'libvpx'
				: 'libvpx-vp9',
			'-crf',
			'16',
			options.force ? '-y' : null,
			'-pix_fmt',
			options.pixelFormat ?? 'yuv420p',
			options.outputLocation,
		].filter(Boolean) as string[],
		{cwd: options.dir}
	);
};
