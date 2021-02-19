import execa from 'execa';
import fs from 'fs';
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
	const files = await fs.promises.readdir(options.dir);
	const biggestNumber = Math.max(
		...files
			.filter((f) => f.match(/element-([0-9]+)/))
			.map((f) => {
				return f.match(/element-([0-9]+)/)?.[1] as string;
			})
			.map((f) => Number(f))
	);
	const numberLength = String(biggestNumber).length;

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
			`element-%0${numberLength}d.${format}`,
			'-c:v',
			options.outputFormat === 'mp4'
				? 'libx264'
				: options.outputFormat === 'webm-v8'
				? 'libvpx'
				: 'libvpx-vp9',
			'-crf',
			'16',
			'-b:v',
			'1M',
			options.force ? '-y' : null,
			'-pix_fmt',
			options.pixelFormat ?? 'yuv420p',
			options.outputLocation,
		].filter(Boolean) as string[],
		{cwd: options.dir}
	);
};
