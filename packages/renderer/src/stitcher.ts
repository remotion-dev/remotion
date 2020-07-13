import execa from 'execa';

export const stitchVideos = async (options: {
	dir: string;
	fps: number;
	width: number;
	height: number;
}): Promise<void> => {
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
			'element-%d.png',
			'-vcodec',
			'libx264',
			'-crf',
			'16',
			'-pix_fmt',
			'yuv420p',
			'test.mp4',
		],
		{cwd: options.dir}
	);
};
