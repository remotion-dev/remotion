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
import {getActualConcurrency} from './get-concurrency';
import {getFrameCount} from './get-frame-range';
import {getFrameToRender} from './get-frame-to-render';
import {DEFAULT_IMAGE_FORMAT} from './image-format';
import {Pool} from './pool';
import {provideScreenshot} from './provide-screenshot';
import {seekToFrame} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';

export type RenderFramesOutput = {
	frameCount: number;
	assetsInfo: RenderAssetInfo;
};

export type OnStartData = {
	frameCount: number;
};

export type OnErrorInfo = {error: Error; frame: number | null};

export const renderFrames = async ({
	config,
	parallelism,
	onFrameUpdate,
	compositionId,
	outputDir,
	onStart,
	inputProps,
	quality,
	imageFormat = DEFAULT_IMAGE_FORMAT,
	frameRange,
	puppeteerInstance,
	serveUrl,
	onError,
	envVariables,
}: {
	config: VideoConfig;
	compositionId: string;
	onStart: (data: OnStartData) => void;
	onFrameUpdate: (
		framesRendered: number,
		src: string,
		frameIndex: number
	) => void;
	outputDir: string;
	inputProps: unknown;
	envVariables?: Record<string, string>;
	imageFormat: ImageFormat;
	parallelism?: number | null;
	quality?: number;
	browser?: Browser;
	frameRange?: FrameRange | null;
	serveUrl: string;
	dumpBrowserLogs?: boolean;
	puppeteerInstance: PuppeteerBrowser;
	onError?: (info: OnErrorInfo) => void;
}): Promise<RenderFramesOutput> => {
	Internals.validateDimension(
		config.height,
		'height',
		'in the `config` object passed to `renderFrames()`'
	);
	Internals.validateDimension(
		config.width,
		'width',
		'in the `config` object passed to `renderFrames()`'
	);
	Internals.validateFps(
		config.fps,
		'in the `config` object of `renderFrames()`'
	);
	Internals.validateDurationInFrames(
		config.durationInFrames,
		'in the `config` object passed to `renderFrames()`'
	);
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
		const errorCallback = (err: Error) => {
			onError?.({error: err, frame: null});
		};

		page.on('pageerror', errorCallback);

		await setPropsAndEnv({inputProps, envVariables, page, serveUrl});

		const site = `${serveUrl}/index.html?composition=${compositionId}`;
		await page.goto(site);
		page.off('pageerror', errorCallback);
		return page;
	});

	const puppeteerPages = await Promise.all(pages);
	const pool = new Pool(puppeteerPages);

	const frameCount = getFrameCount(config.durationInFrames, frameRange ?? null);
	const lastFrameIndex = getFrameToRender(frameRange ?? null, frameCount - 1);
	// Substract one because 100 frames will be 00-99
	// --> 2 digits
	const filePadLength = String(lastFrameIndex).length;
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

				const errorCallback = (err: Error) => {
					onError?.({error: err, frame});
				};

				const output = path.join(
					outputDir,
					`element-${paddedIndex}.${imageFormat}`
				);

				freePage.on('pageerror', errorCallback);
				try {
					await seekToFrame({frame, page: freePage});
				} catch (err) {
					if (
						err.message.includes('timeout') &&
						err.message.includes('exceeded')
					) {
						errorCallback(
							new Error(
								'The rendering timed out. See https://www.remotion.dev/docs/timeout/ for possible reasons.'
							)
						);
					} else {
						errorCallback(err);
					}

					throw err;
				}

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
				onFrameUpdate(framesRendered, output, frame);
				freePage.off('pageerror', errorCallback);
				return collectedAssets;
			})
	);

	return {
		assetsInfo: {
			assets,
		},
		frameCount,
	};
};
