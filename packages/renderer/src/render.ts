import path from 'path';
import {VideoConfig} from 'remotion';
import {openBrowser, provideScreenshot} from '.';
import {getActualConcurrency} from './get-concurrency';
import {Pool} from './pool'
import {DEFAULT_IMAGE_FORMAT, ImageFormat} from './image-format';

export const renderFrames = async ({
	config,
	parallelism,
	onFrameUpdate,
	compositionId: compositionId,
	outputDir,
	onStart,
	userProps,
	webpackBundle,
	quality,
	imageFormat = DEFAULT_IMAGE_FORMAT,
}: {
	config: VideoConfig;
	parallelism?: number | null;
	onFrameUpdate: (f: number) => void;
	onStart: () => void;
	compositionId: string;
	outputDir: string;
	userProps: unknown;
	webpackBundle: string;
	imageFormat?: ImageFormat;
	quality?: number;
}) => {
	if (quality !== undefined && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}
	const actualParallelism = getActualConcurrency(parallelism ?? null);

	const browser = await openBrowser();
	const pool = new Pool(await Promise.all(
		new Array(actualParallelism).fill(true).map(() => browser.newPage())
	));
	
	const {durationInFrames: frames} = config;
	let framesRendered = 0;
	onStart();
	await Promise.all(
		new Array(frames)
			.fill(Boolean)
			.map((x, i) => i)
			.map(async (f) => {
				const freePage = await pool.acquire();
				try {
					const site = `file://${webpackBundle}/index.html?composition=${compositionId}&frame=${f}&props=${encodeURIComponent(
						JSON.stringify(userProps)
					)}`;
					await provideScreenshot({
						page: freePage,
						options: {
							output: path.join(outputDir, `element-${f}.${imageFormat}`),
							site,
							height: config.height,
							width: config.width,
						},
						imageFormat,
						quality,
					});
				} catch (err) {
					console.log('Error taking screenshot', err);
				} finally {
					pool.release(freePage);
					framesRendered++;
					onFrameUpdate(framesRendered);
				}
			})
	);
	await browser.close();
};
