import path from 'path';
import {Browser, FrameRange, Internals, VideoConfig} from 'remotion';
import {openBrowser, provideScreenshot} from '.';
import {getActualConcurrency} from './get-concurrency';
import {getFrameCount} from './get-frame-range';
import {getFrameToRender} from './get-frame-to-render';
import {DEFAULT_IMAGE_FORMAT, ImageFormat} from './image-format';
import {Pool} from './pool';
import {serveStatic} from './serve-static';

export type RenderFramesOutput = {
	frameCount: number;
};

type OnStartData = {
	frameCount: number;
};

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
}: {
	config: VideoConfig;
	parallelism?: number | null;
	onFrameUpdate: (f: number) => void;
	onStart: (data: OnStartData) => void;
	compositionId: string;
	outputDir: string;
	userProps: unknown;
	webpackBundle: string;
	imageFormat?: ImageFormat;
	quality?: number;
	browser?: Browser;
	frameRange?: FrameRange | null;
}): Promise<RenderFramesOutput> => {
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

	const frameCount = getFrameCount(config.durationInFrames, frameRange ?? null);
	// Substract one because 100 frames will be 00-99
	// --> 2 digits
	let filePadLength = 0;
	if (frameCount) {
		filePadLength = String(frameCount - 1).length;
	}
	let framesRendered = 0;
	onStart({
		frameCount,
	});
	await Promise.all(
		new Array(frameCount)
			.fill(Boolean)
			.map((x, i) => i)
			.map(async (index) => {
				const frame = getFrameToRender(frameRange ?? null, index);
				const freePage = await pool.acquire();
				const paddedIndex = String(frame).padStart(filePadLength, '0');

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
	return {
		frameCount,
	};
};
