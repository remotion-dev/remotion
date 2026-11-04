import {mkdir} from 'node:fs/promises';
import path from 'node:path';

const brandDirectory = path.resolve(import.meta.dir, '..');
const outputDirectory = path.resolve(
	brandDirectory,
	'../../out/canvas-capture-banner',
);
await mkdir(path.join(brandDirectory, 'public/canvas-capture-banner'), {
	recursive: true,
});
await mkdir(outputDirectory, {recursive: true});

// Repeated JPEG frame rendering deliberately simulates a recompressed 1× capture.
for (let pass = 1; pass <= 4; pass++) {
	const process = Bun.spawn(
		[
			'bunx',
			'remotion',
			'render',
			'CanvasCaptureBannerOneX',
			`public/canvas-capture-banner/pass-${pass}.mp4`,
			'--image-format=jpeg',
			'--jpeg-quality=65',
			'--crf=18',
			'--concurrency=4',
			...(pass === 1
				? []
				: [
						'--props',
						JSON.stringify({
							source: `canvas-capture-banner/pass-${pass - 1}.mp4`,
							trimBefore: 0,
						}),
					]),
		],
		{cwd: brandDirectory, stdout: 'inherit', stderr: 'inherit'},
	);
	if ((await process.exited) !== 0) {
		throw new Error(`JPEG pass ${pass} failed`);
	}
}

for (const args of [
	[
		'render',
		'CanvasCaptureBanner',
		path.join(outputDirectory, 'banner.mp4'),
		'--image-format=png',
		'--crf=10',
		'--concurrency=4',
	],
	[
		'still',
		'CanvasCaptureBanner',
		path.join(outputDirectory, 'banner.png'),
		'--frame=45',
		'--image-format=png',
	],
]) {
	const process = Bun.spawn(
		[
			'bunx',
			'remotion',
			...args,
			'--props',
			JSON.stringify({oneXSource: 'canvas-capture-banner/pass-4.mp4'}),
		],
		{cwd: brandDirectory, stdout: 'inherit', stderr: 'inherit'},
	);
	if ((await process.exited) !== 0) {
		throw new Error(`Banner ${args[0]} failed`);
	}
}
