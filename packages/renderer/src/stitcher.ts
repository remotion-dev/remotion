import execa from 'execa';
import fs from 'fs';
import {PixelFormat} from 'remotion';
import url from 'url';
import {Assets} from './assets';
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
	assets: Assets;
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
			...options.assets.reduce<string[]>(
				(acc, asset) => [...acc, '-i', url.fileURLToPath(asset.src)],
				[]
			),
			'-vcodec',
			'libx264',
			'-crf',
			'16',
			'-pix_fmt',
			options.pixelFormat ?? 'yuv420p',
			'-acodec',
			'aac',
			'-filter_complex',
			[
				...options.assets.map((asset, i) => {
					const duration = asset.duration
						? (asset.duration / options.fps).toFixed(3)
						: undefined; // in secounds with millisecounds level precision
					const from = ((asset.from / options.fps) * 1000).toFixed(); // in milliseconds
					return [
						`[${i + 1}:a]`,
						duration ? `atrim=0:${duration},` : '',
						`adelay=${from}`,
						`[a${i + 1}]`,
					].join('');
				}),
				`${options.assets.map((asset, i) => `[a${i + 1}]`).join('')}amix=${
					options.assets.length
				},dynaudnorm`,
			].join(';'),
			options.force ? '-y' : null,
			'-shortest',
			options.outputLocation,
		].filter(Boolean) as string[],
		{cwd: options.dir}
	);
};
