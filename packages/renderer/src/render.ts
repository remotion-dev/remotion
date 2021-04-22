import path from 'path';
import {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {
	Browser,
	FrameRange,
	ImageFormat,
	Internals,
	RenderAssetInfo,
	VideoConfig,
} from 'remotion';
import {provideScreenshot, seekToFrame} from '.';
import {getActualConcurrency} from './get-concurrency';
import {getFrameCount} from './get-frame-range';
import {getFrameToRender} from './get-frame-to-render';
import {DEFAULT_IMAGE_FORMAT} from './image-format';
import {Pool} from './pool';

export type RenderFramesOutput = {
	frameCount: number;
	assetsInfo: RenderAssetInfo;
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
	inputProps,
	quality,
	imageFormat = DEFAULT_IMAGE_FORMAT,
	browser = Internals.DEFAULT_BROWSER,
	frameRange,
	dumpBrowserLogs = false,
	puppeteerInstance,
	serveUrl,
}: {
	config: VideoConfig;
	parallelism?: number | null;
	onFrameUpdate: (f: number, frame: string) => void;
	onStart: (data: OnStartData) => void;
	compositionId: string;
	outputDir: string;
	inputProps: unknown;
	imageFormat: ImageFormat;
	quality?: number;
	browser?: Browser;
	frameRange?: FrameRange | null;
	assetsOnly?: boolean;
	dumpBrowserLogs?: boolean;
	puppeteerInstance: PuppeteerBrowser;
	serveUrl: string;
}): Promise<RenderFramesOutput> => {
	if (quality !== undefined && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}
	const actualParallelism = getActualConcurrency(parallelism ?? null);

	const pages = new Array(actualParallelism).fill(true).map(async () => {
		const page = await puppeteerInstance.newPage();
		page.setViewport({
			width: config.width,
			height: config.height,
			deviceScaleFactor: 1,
		});
		page.on('error', console.error);
		page.on('pageerror', console.error);

		if (inputProps) {
			await page.goto(`${serveUrl}/index.html`);

			await page.evaluate(
				(key, input) => {
					window.localStorage.setItem(key, input);
				},
				Internals.INPUT_PROPS_KEY,
				JSON.stringify(inputProps)
			);
		}
		const site = `${serveUrl}/index.html?composition=${compositionId}`;
		console.log('going to ', site);
		await page.goto(site);
		return page;
	});

	const puppeteerPages = await Promise.all(pages);
	const pool = new Pool(puppeteerPages);

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
	const assets = await Promise.all(
		new Array(frameCount)
			.fill(Boolean)
			.map((x, i) => i)
			.map(async (index) => {
				const frame = getFrameToRender(frameRange ?? null, index);
				const freePage = await pool.acquire();
				const paddedIndex = String(frame).padStart(filePadLength, '0');

				await seekToFrame({frame, page: freePage});
				const output = path.join(
					outputDir,
					`element-${paddedIndex}.${imageFormat}`
				);
				if (imageFormat !== 'none') {
					await provideScreenshot({
						page: freePage,
						imageFormat,
						quality,
						options: {
							frame,
							output,
						},
					});
				}
				const collectedAssets = await freePage.evaluate(() => {
					return window.remotion_collectAssets();
				});
				pool.release(freePage);
				framesRendered++;
				onFrameUpdate(framesRendered, output);
				return collectedAssets;
			})
	);

	return {
		assetsInfo: {
			assets,
			// TODO: Will break stuff
			bundleDir: '',
		},
		frameCount,
	};
};
