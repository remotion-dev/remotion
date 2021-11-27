import fs from 'fs';
import path from 'path';
import {
	Browser as PuppeteerBrowser,
	ConsoleMessage,
	Page,
} from 'puppeteer-core';
import {
	BrowserExecutable,
	FrameRange,
	ImageFormat,
	Internals,
	VideoConfig,
} from 'remotion';
import {
	downloadAndMapAssetsToFileUrl,
	RenderMediaOnDownload,
} from './assets/download-and-map-assets-to-file';
import {BrowserLog} from './browser-log';
import {cycleBrowserTabs} from './cycle-browser-tabs';
import {ensureOutputDirectory} from './ensure-output-directory';
import {getActualConcurrency} from './get-concurrency';
import {getFrameCount} from './get-frame-range';
import {getFrameToRender} from './get-frame-to-render';
import {DEFAULT_IMAGE_FORMAT} from './image-format';
import {
	getServeUrlWithFallback,
	ServeUrlOrWebpackBundle,
} from './legacy-webpack-config';
import {makeAssetsDownloadTmpDir} from './make-assets-download-dir';
import {normalizeServeUrl} from './normalize-serve-url';
import {openBrowser} from './open-browser';
import {Pool} from './pool';
import {prepareServer} from './prepare-server';
import {provideScreenshot} from './provide-screenshot';
import {seekToFrame} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import {OnStartData, RenderFramesOutput} from './types';

type ConfigOrComposition =
	| {
			/**
			 * @deprecated This field has been renamed to `composition`
			 */
			config: VideoConfig;
	  }
	| {
			composition: VideoConfig;
	  };

type RenderFramesOptions = {
	onStart: (data: OnStartData) => void;
	onFrameUpdate: (framesRendered: number, frameIndex: number) => void;
	outputDir: string | null;
	inputProps: unknown;
	envVariables?: Record<string, string>;
	imageFormat: ImageFormat;
	parallelism?: number | null;
	quality?: number;
	frameRange?: FrameRange | null;
	dumpBrowserLogs?: boolean;
	puppeteerInstance?: PuppeteerBrowser;
	browserExecutable?: BrowserExecutable;
	onBrowserLog?: (log: BrowserLog) => void;
	writeFrame?: (buffer: Buffer, frame: number) => void;
	onDownload?: RenderMediaOnDownload;
} & ConfigOrComposition &
	ServeUrlOrWebpackBundle;

const getComposition = (others: ConfigOrComposition) => {
	if ('composition' in others) {
		return others.composition;
	}

	if ('config' in others) {
		return others.config;
	}

	return undefined;
};

export const innerRenderFrames = async ({
	parallelism,
	onFrameUpdate,
	outputDir,
	onStart,
	inputProps,
	quality,
	imageFormat = DEFAULT_IMAGE_FORMAT,
	frameRange,
	puppeteerInstance,
	onError,
	envVariables,
	onBrowserLog,
	writeFrame,
	onDownload,
	pagesArray,
	serveUrl,
	composition,
}: Omit<RenderFramesOptions, 'url'> & {
	onError: (err: Error) => void;
	pagesArray: Page[];
	serveUrl: string;
	composition: VideoConfig;
}): Promise<RenderFramesOutput> => {
	if (!puppeteerInstance) {
		throw new Error('weird');
	}

	const actualParallelism = getActualConcurrency(parallelism ?? null);

	if (outputDir) {
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, {
				recursive: true,
			});
		}
	}

	const pages = new Array(actualParallelism).fill(true).map(async () => {
		const page = await puppeteerInstance.newPage();
		pagesArray.push(page);
		page.setViewport({
			width: composition.width,
			height: composition.height,
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

		const site = `${normalizeServeUrl(serveUrl)}?composition=${composition.id}`;
		await page.goto(site);

		page.off('console', logCallback);
		return page;
	});

	const puppeteerPages = await Promise.all(pages);
	const pool = new Pool(puppeteerPages);

	const frameCount = getFrameCount(
		composition.durationInFrames,
		frameRange ?? null
	);
	const firstFrameIndex = getFrameToRender(frameRange ?? null, 0);
	const lastFrameIndex = getFrameToRender(frameRange ?? null, frameCount - 1);
	// Substract one because 100 frames will be 00-99
	// --> 2 digits
	const filePadLength = String(lastFrameIndex).length;
	let framesRendered = 0;

	onStart({
		frameCount,
	});
	const downloadDir = makeAssetsDownloadTmpDir();
	const assets = await Promise.all(
		new Array(frameCount)
			.fill(Boolean)
			.map((x, i) => i)
			.map(async (index) => {
				const frame = getFrameToRender(frameRange ?? null, index);
				const freePage = await pool.acquire();
				const paddedIndex = String(frame).padStart(filePadLength, '0');

				const errorCallbackOnFrame = (err: Error) => {
					onError(
						new Error(
							`Error on rendering frame ${frame}: ${err.stack || err.message}`
						)
					);
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
					if (writeFrame) {
						const buffer = await provideScreenshot({
							page: freePage,
							imageFormat,
							quality,
							options: {
								frame,
								output: undefined,
							},
						});
						writeFrame(buffer, frame);
					} else {
						if (!outputDir) {
							throw new Error(
								'Called renderFrames() without specifying either `outputDir` or `writeFrame`'
							);
						}

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
				collectedAssets.forEach((asset) => {
					downloadAndMapAssetsToFileUrl({
						asset,
						downloadDir,
						onDownload: onDownload ?? (() => () => undefined),
					});
				});
				pool.release(freePage);
				framesRendered++;
				onFrameUpdate(framesRendered, frame);
				freePage.off('pageerror', errorCallbackOnFrame);
				freePage.off('error', errorCallbackOnFrame);
				return collectedAssets;
			})
	);

	const returnValue: RenderFramesOutput = {
		assetsInfo: {
			assets,
			downloadDir,
			firstFrameIndex,
			imageSequenceName: `element-%0${filePadLength}d.${imageFormat}`,
		},
		frameCount,
	};
	return returnValue;
};

export const renderFrames = async (
	options: RenderFramesOptions
): Promise<RenderFramesOutput> => {
	const composition = getComposition(options);

	if (!composition) {
		throw new Error(
			'No `composition` option has been specified for renderFrames()'
		);
	}

	Internals.validateDimension(
		composition.height,
		'height',
		'in the `config` object passed to `renderFrames()`'
	);
	Internals.validateDimension(
		composition.width,
		'width',
		'in the `config` object passed to `renderFrames()`'
	);
	Internals.validateFps(
		composition.fps,
		'in the `config` object of `renderFrames()`'
	);
	Internals.validateDurationInFrames(
		composition.durationInFrames,
		'in the `config` object passed to `renderFrames()`'
	);
	if (options.quality !== undefined && options.imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}

	const selectedServeUrl = getServeUrlWithFallback(options);

	Internals.validateQuality(options.quality);

	const {closeServer, serveUrl} = await prepareServer(selectedServeUrl);

	const browserInstance =
		options.puppeteerInstance ??
		(await openBrowser(Internals.DEFAULT_BROWSER, {
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
			serveUrl,
			composition,
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
				closeServer();
			});
	});
};
