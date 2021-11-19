import path from 'path';
import {
	Browser as PuppeteerBrowser,
	ConsoleMessage,
	Page,
	Puppeteer,
} from 'puppeteer-core';
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
	onFrameUpdate: (framesRendered: number, frameIndex: number) => void;
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
	parallelEncoding?: boolean;
	writeFrame?: (buffer?: Buffer) => void;
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
	onBrowserLog,
	parallelEncoding,
	writeFrame,
	pagesArray,
}: RenderFramesOptions & {
	onError: (err: Error) => void;
	pagesArray: Page[];
}): Promise<RenderFramesOutput> => {
	if (!puppeteerInstance) {
		throw new Error('weird');
	}

	const actualParallelism = getActualConcurrency(parallelism ?? null);

	const pages = new Array(actualParallelism).fill(true).map(async () => {
		const page = await puppeteerInstance.newPage();
		pagesArray.push(page);
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
					if (parallelEncoding) {
						const buffer = await provideScreenshot({
							page: freePage,
							imageFormat,
							quality,
							options: {
								frame,
								output: undefined,
							},
						});
						writeFrame?.(buffer);
					} else {
						const output = path.join(
							outputDir,
							`element-${paddedIndex}.${imageFormat}`
						);
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
				}

				const collectedAssets = await freePage.evaluate(() => {
					return window.remotion_collectAssets();
				});
				pool.release(freePage);
				framesRendered++;
				onFrameUpdate(framesRendered, frame);
				freePage.off('pageerror', errorCallbackOnFrame);
				freePage.off('error', errorCallbackOnFrame);
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

export const renderFrames = async (
	options: RenderFramesOptions
): Promise<RenderFramesOutput> => {
	Internals.validateDimension(
		options.config.height,
		'height',
		'in the `config` object passed to `renderFrames()`'
	);
	Internals.validateDimension(
		options.config.width,
		'width',
		'in the `config` object passed to `renderFrames()`'
	);
	Internals.validateFps(
		options.config.fps,
		'in the `config` object of `renderFrames()`'
	);
	Internals.validateDurationInFrames(
		options.config.durationInFrames,
		'in the `config` object passed to `renderFrames()`'
	);
	if (options.quality !== undefined && options.imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}

	Internals.validateQuality(options.quality);

	const browserInstance =
		options.puppeteerInstance ??
		(await openBrowser(options.browser ?? Internals.DEFAULT_BROWSER, {
			shouldDumpIo: options.dumpBrowserLogs,
			browserExecutable: options.browserExecutable,
		}));
	const {stopCycling} = cycleBrowserTabs(browserInstance);

	const openedPages: Page[] = [];

	return new Promise<RenderFramesOutput>((resolve, reject) => {
		// eslint-disable-next-line promise/catch-or-return
		innerRenderFrames({
			...options,
			puppeteerInstance: browserInstance,
			onError: (err) => reject(err),
			pagesArray: openedPages,
		})
			.then((res) => resolve(res))
			.catch((err) => reject(err))
			.finally(() => {
				// If browser instance was passed in, we close all the pages
				// we opened.
				// If new browser was opened, then closing the browser as a cleanup.

				if (options.puppeteerInstance) {
					Promise.all(openedPages.map((p) => p.close())).catch((err) => {
						console.log('Unable to close browser tab', err);
					});
				} else {
					browserInstance.close().catch((err) => {
						console.log('Unable to close browser', err);
					});
				}

				stopCycling();
			});
	});
};
