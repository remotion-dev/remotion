import path from 'path';
import {VideoConfig} from 'remotion';
import {openBrowser, provideScreenshot} from '.';
import {logPerf} from './benchmarking';
import {getActualConcurrency} from './get-concurrency';
import {DEFAULT_IMAGE_FORMAT, ImageFormat} from './image-format';
import {Pool} from './pool';

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
	const pages = new Array(actualParallelism).fill(true).map(async () => {
		const page = await browser.newPage();
		page.setViewport({
			width: config.width,
			height: config.height,
			deviceScaleFactor: 1,
		});
		page.on('error', console.error);
		page.on('pageerror', console.error);

		const site = `file://${webpackBundle}/index.html?composition=${compositionId}&props=${encodeURIComponent(
			JSON.stringify(userProps)
		)}`;
		await page.goto(site);
		return page;
	});

	const pool = new Pool(await Promise.all(pages));

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
					await provideScreenshot({
						page: freePage,
						imageFormat,
						quality,
						options: {
							frame: f,
							output: path.join(outputDir, `element-${f}.${imageFormat}`),
						},
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
	setTimeout(() => {
		logPerf();
	}, 300);
};
