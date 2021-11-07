import path from 'path';
import {Browser as PuppeteerBrowser, ConsoleMessage} from 'puppeteer-core';
import {
	Browser,
	BrowserExecutable,
	FrameRange,
	ImageFormat,
	Internals,
	VideoConfig,
} from 'remotion';
import {BrowserLog} from './browser-log';
import {cycleBrowserTabs} from './cycle-browser-tabs';
import {getActualConcurrency} from './get-concurrency';
import {getFrameCount} from './get-frame-range';
import {getFrameToRender} from './get-frame-to-render';
import {DEFAULT_IMAGE_FORMAT} from './image-format';
import {normalizeServeUrl} from './normalize-serve-url';
import {openBrowser} from './open-browser';
import {Pool} from './pool';
import {provideScreenshot} from './provide-screenshot';
import {seekToFrame} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import {OnStartData, RenderFramesOutput} from './types';

type RenderFramesOptions = {
	config: VideoConfig;
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
	puppeteerInstance?: PuppeteerBrowser;
	browserExecutable?: BrowserExecutable;
	onBrowserLog?: (log: BrowserLog) => void;
};

export const innerRenderFrames = async ({
	config,
	parallelism,
	onFrameUpdate,
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
	browserExecutable,
	dumpBrowserLogs,
	browser,
	onBrowserLog,
}: RenderFramesOptions & {
	onError: (err: Error) => void;
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

	Internals.validateQuality(quality);

	const actualParallelism = getActualConcurrency(parallelism ?? null);

	const browserInstance =
		puppeteerInstance ??
		(await openBrowser(browser ?? Internals.DEFAULT_BROWSER, {
			shouldDumpIo: dumpBrowserLogs,
			browserExecutable,
		}));

	const pages = new Array(actualParallelism).fill(true).map(async () => {
		const page = await browserInstance.newPage();
		page.setViewport({
			width: config.width,
			height: config.height,
			deviceScaleFactor: 1,
		});

		const logCallback = (log: ConsoleMessage) => {
			onBrowserLog?.({
				stackTrace: log.stackTrace(),
				text: log.text(),
				type: log.type(),
			});
		};

		if (onBrowserLog) {
			page.on('console', logCallback);
		}

		const initialFrame =
			typeof frameRange === 'number'
				? frameRange
				: frameRange === null || frameRange === undefined
				? 0
				: frameRange[0];

		await setPropsAndEnv({
			inputProps,
			envVariables,
			page,
			serveUrl,
			initialFrame,
		});

		const site = `${normalizeServeUrl(serveUrl)}?composition=${config.id}`;
		await page.goto(site);

		page.off('console', logCallback);
		return page;
	});
	const {stopCycling} = cycleBrowserTabs(browserInstance);

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

				const errorCallbackOnFrame = (err: Error) => {
					onError(new Error(`Error on rendering frame ${frame}: ${err.stack}`));
				};

				const output = path.join(
					outputDir,
					`element-${paddedIndex}.${imageFormat}`
				);

				freePage.on('pageerror', errorCallbackOnFrame);
				freePage.on('error', errorCallbackOnFrame);
				try {
					await seekToFrame({frame, page: freePage});
				} catch (err) {
					const error = err as Error;
					if (
						error.message.includes('timeout') &&
						error.message.includes('exceeded')
					) {
						errorCallbackOnFrame(
							new Error(
								'The rendering timed out. See https://www.remotion.dev/docs/timeout/ for possible reasons.'
							)
						);
					} else {
						errorCallbackOnFrame(error);
					}

					throw error;
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
				freePage.off('pageerror', errorCallbackOnFrame);
				freePage.off('error', errorCallbackOnFrame);
				return collectedAssets;
			})
	);
	stopCycling();
	// If browser instance was passed in, we close all the pages
	// we opened.
	// If new browser was opened, then closing the browser as a cleanup.

	if (puppeteerInstance) {
		await Promise.all(puppeteerPages.map((p) => p.close())).catch((err) => {
			console.log('Unable to close browser tab', err);
		});
	} else {
		browserInstance.close().catch((err) => {
			console.log('Unable to close browser', err);
		});
	}

	return {
		assetsInfo: {
			assets,
		},
		frameCount,
	};
};

export const renderFrames = (
	options: RenderFramesOptions
): Promise<RenderFramesOutput> => {
	return new Promise<RenderFramesOutput>((resolve, reject) => {
		innerRenderFrames({...options, onError: (err) => reject(err)})
			.then((res) => resolve(res))
			.catch((err) => reject(err));
	});
};
