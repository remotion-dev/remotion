import path from 'path';
import {Browser, FrameRange, Internals, VideoConfig} from 'remotion';
import {openBrowser, provideScreenshot} from '.';
import {getActualConcurrency} from './get-concurrency';
import {DEFAULT_IMAGE_FORMAT, ImageFormat} from './image-format';
import {Pool} from './pool';
import {serveStatic} from './serve-static';

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
	browser = Internals.DEFAULT_BROWSER,
	frameRange,
	frames,
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
	browser?: Browser;
	frameRange?: FrameRange;
	frames?: number;
}) => {
	if (quality !== undefined && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}
	const actualParallelism = getActualConcurrency(parallelism ?? null);

	const [{port, close}, browserInstance] = await Promise.all([
		serveStatic(webpackBundle),
		openBrowser(browser),
	]);
	const pages = new Array(actualParallelism).fill(true).map(async () => {
		const page = await browserInstance.newPage();
		page.setViewport({
			width: config.width,
			height: config.height,
			deviceScaleFactor: 1,
		});
		page.on('error', console.error);
		page.on('pageerror', console.error);

		const site = `http://localhost:${port}/index.html?composition=${compositionId}&props=${encodeURIComponent(
			JSON.stringify(userProps)
		)}`;
		await page.goto(site);
		return page;
	});

	const pool = new Pool(await Promise.all(pages));

	// const {durationInFrames: frames} = config;
	// Substract one because 100 frames will be 00-99
	// --> 2 digits
	let filePadLength = 0;
	if (frames) {
		filePadLength = String(frames - 1).length;
	}
	let framesRendered = 0;
	onStart();
	await Promise.all(
		new Array(frames)
			.fill(Boolean)
			.map((x, i) => i)
			.map(async (f) => {
				let frame = f;
				const freePage = await pool.acquire();
				const paddedIndex = String(f).padStart(filePadLength, '0');
				if (frameRange) {
					frame = f + frameRange[0] - 1;
				}
				await provideScreenshot({
					page: freePage,
					imageFormat,
					quality,
					options: {
						frame,
						output: path.join(
							outputDir,
							`element-${paddedIndex}.${imageFormat}`
						),
					},
				});
				pool.release(freePage);
				framesRendered++;
				onFrameUpdate(framesRendered);
			})
	);
	await Promise.all([browserInstance.close(), close()]);
};
