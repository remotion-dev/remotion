import fs from 'fs';
import path from 'path';
import type {SmallTCompMetadata, TAsset} from 'remotion';
import {Internals} from 'remotion';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {downloadAndMapAssetsToFileUrl} from './assets/download-and-map-assets-to-file';
import {DEFAULT_BROWSER} from './browser';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {Browser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import type {ConsoleMessage} from './browser/ConsoleMessage';
import {compressAsset} from './compress-assets';
import {cycleBrowserTabs} from './cycle-browser-tabs';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import type {FfmpegExecutable} from './ffmpeg-executable';
import type {FrameRange} from './frame-range';
import {getActualConcurrency} from './get-concurrency';
import {getFramesToRender} from './get-duration-from-frame-range';
import type {CountType} from './get-frame-padded-index';
import {
	getFilePadLength,
	getFrameOutputFileName,
} from './get-frame-padded-index';
import {getRealFrameRange} from './get-frame-to-render';
import type {ImageFormat} from './image-format';
import {DEFAULT_IMAGE_FORMAT} from './image-format';
import type {ServeUrlOrWebpackBundle} from './legacy-webpack-config';
import {getServeUrlWithFallback} from './legacy-webpack-config';
import {makeAssetsDownloadTmpDir} from './make-assets-download-dir';
import type {CancelSignal} from './make-cancel-signal';
import type {ChromiumOptions} from './open-browser';
import {openBrowser} from './open-browser';
import {startPerfMeasure, stopPerfMeasure} from './perf';
import {Pool} from './pool';
import {prepareServer} from './prepare-server';
import {provideScreenshot} from './provide-screenshot';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {validateQuality} from './quality';
import {seekToFrame} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import {truthy} from './truthy';
import type {OnStartData, RenderFramesOutput} from './types';
import {validateScale} from './validate-scale';

type ConfigOrComposition =
	| {
			/**
			 * @deprecated This field has been renamed to `composition`
			 */
			config: SmallTCompMetadata;
	  }
	| {
			composition: SmallTCompMetadata;
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
	everyNthFrame?: number;
	dumpBrowserLogs?: boolean;
	puppeteerInstance?: Browser;
	browserExecutable?: BrowserExecutable;
	onBrowserLog?: (log: BrowserLog) => void;
	onFrameBuffer?: (buffer: Buffer, frame: number) => void;
	onDownload?: RenderMediaOnDownload;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
	ffmpegExecutable?: FfmpegExecutable;
	ffprobeExecutable?: FfmpegExecutable;
	port?: number | null;
	cancelSignal?: CancelSignal;
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

const getPool = async (pages: Promise<Page>[]) => {
	const puppeteerPages = await Promise.all(pages);
	const pool = new Pool(puppeteerPages);
	return pool;
};

const innerRenderFrames = ({
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
	onFrameBuffer,
	onDownload,
	pagesArray,
	serveUrl,
	composition,
	timeoutInMilliseconds,
	scale,
	actualParallelism,
	downloadDir,
	everyNthFrame = 1,
	proxyPort,
	cancelSignal,
}: Omit<RenderFramesOptions, 'url' | 'onDownload'> & {
	onError: (err: Error) => void;
	pagesArray: Page[];
	serveUrl: string;
	composition: SmallTCompMetadata;
	actualParallelism: number;
	downloadDir: string;
	onDownload: RenderMediaOnDownload;
	proxyPort: number;
}): Promise<RenderFramesOutput> => {
	if (!puppeteerInstance) {
		throw new Error(
			'no puppeteer instance passed to innerRenderFrames - internal error'
		);
	}

	if (outputDir) {
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, {
				recursive: true,
			});
		}
	}

	const downloadPromises: Promise<unknown>[] = [];

	const realFrameRange = getRealFrameRange(
		composition.durationInFrames,
		frameRange ?? null
	);

	const framesToRender = getFramesToRender(realFrameRange, everyNthFrame);
	const lastFrame = framesToRender[framesToRender.length - 1];

	const pages = new Array(actualParallelism).fill(true).map(async () => {
		const page = await puppeteerInstance.newPage();
		pagesArray.push(page);
		await page.setViewport({
			width: composition.width,
			height: composition.height,
			deviceScaleFactor: scale ?? 1,
		});

		const logCallback = (log: ConsoleMessage) => {
			onBrowserLog?.({
				stackTrace: log.stackTrace(),
				text: log.text,
				type: log.type,
			});
		};

		if (onBrowserLog) {
			page.on('console', logCallback);
		}

		const initialFrame = realFrameRange[0];

		await setPropsAndEnv({
			inputProps,
			envVariables,
			page,
			serveUrl,
			initialFrame,
			timeoutInMilliseconds,
			proxyPort,
			retriesRemaining: 2,
		});

		await puppeteerEvaluateWithCatch({
			pageFunction: (id: string) => {
				window.setBundleMode({
					type: 'composition',
					compositionName: id,
				});
			},
			args: [composition.id],
			frame: null,
			page,
		});

		page.off('console', logCallback);
		return page;
	});

	// If rendering a GIF and skipping frames, we must ensure it starts from 0
	// and then is consecutive so FFMPEG recognizes the sequence
	const countType: CountType =
		everyNthFrame === 1 ? 'actual-frames' : 'from-zero';

	const filePadLength = getFilePadLength({
		lastFrame,
		totalFrames: framesToRender.length,
		countType,
	});
	let framesRendered = 0;

	const poolPromise = getPool(pages);

	onStart({
		frameCount: framesToRender.length,
	});

	const assets: TAsset[][] = new Array(framesToRender.length).fill(undefined);
	let stopped = false;
	cancelSignal?.(() => {
		stopped = true;
	});
	const progress = Promise.all(
		framesToRender.map(async (frame, index) => {
			const pool = await poolPromise;
			const freePage = await pool.acquire();
			if (stopped) {
				throw new Error('Render was stopped');
			}

			const errorCallbackOnFrame = (err: Error) => {
				onError(err);
			};

			const cleanupPageError = handleJavascriptException({
				page: freePage,
				onError: errorCallbackOnFrame,
				frame,
			});
			freePage.on('error', errorCallbackOnFrame);
			await seekToFrame({frame, page: freePage});

			if (imageFormat !== 'none') {
				if (onFrameBuffer) {
					const id = startPerfMeasure('save');
					const buffer = await provideScreenshot({
						page: freePage,
						imageFormat,
						quality,
						options: {
							frame,
							output: null,
						},
					});
					stopPerfMeasure(id);

					onFrameBuffer(buffer, frame);
				} else {
					if (!outputDir) {
						throw new Error(
							'Called renderFrames() without specifying either `outputDir` or `onFrameBuffer`'
						);
					}

					const output = path.join(
						outputDir,
						getFrameOutputFileName({
							frame,
							imageFormat,
							index,
							countType,
							lastFrame,
							totalFrames: framesToRender.length,
						})
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

			const collectedAssets = await puppeteerEvaluateWithCatch<TAsset[]>({
				pageFunction: () => {
					return window.remotion_collectAssets();
				},
				args: [],
				frame,
				page: freePage,
			});
			const compressedAssets = collectedAssets.map((asset) =>
				compressAsset(assets.filter(truthy).flat(1), asset)
			);
			assets[index] = compressedAssets;
			compressedAssets.forEach((asset) => {
				downloadAndMapAssetsToFileUrl({
					asset,
					downloadDir,
					onDownload,
				}).catch((err) => {
					onError(
						new Error(`Error while downloading asset: ${(err as Error).stack}`)
					);
				});
			});
			pool.release(freePage);
			framesRendered++;
			onFrameUpdate(framesRendered, frame);
			cleanupPageError();
			freePage.off('error', errorCallbackOnFrame);
			return compressedAssets;
		})
	);

	const happyPath = progress.then(() => {
		const returnValue: RenderFramesOutput = {
			assetsInfo: {
				assets,
				downloadDir,
				imageSequenceName: `element-%0${filePadLength}d.${imageFormat}`,
				firstFrameIndex: framesToRender[0],
			},
			frameCount: framesToRender.length,
		};
		return returnValue;
	});

	return happyPath
		.then(() => {
			return Promise.all(downloadPromises);
		})
		.then(() => happyPath);
};

type CleanupFn = () => void;

export const renderFrames = (
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
		'in the `config` object of `renderFrames()`',
		false
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

	validateQuality(options.quality);
	validateScale(options.scale);

	const browserInstance =
		options.puppeteerInstance ??
		openBrowser(DEFAULT_BROWSER, {
			shouldDumpIo: options.dumpBrowserLogs,
			browserExecutable: options.browserExecutable,
			chromiumOptions: options.chromiumOptions,
			forceDeviceScaleFactor: options.scale ?? 1,
		});

	const downloadDir = makeAssetsDownloadTmpDir();

	const onDownload = options.onDownload ?? (() => () => undefined);

	const actualParallelism = getActualConcurrency(options.parallelism ?? null);

	const openedPages: Page[] = [];

	return new Promise<RenderFramesOutput>((resolve, reject) => {
		const cleanup: CleanupFn[] = [];
		const onError = (err: Error) => {
			reject(err);
		};

		Promise.race([
			new Promise<RenderFramesOutput>((_, rej) => {
				options.cancelSignal?.(() => {
					rej(new Error('renderFrames() got cancelled'));
				});
			}),
			Promise.all([
				prepareServer({
					webpackConfigOrServeUrl: selectedServeUrl,
					downloadDir,
					onDownload,
					onError,
					ffmpegExecutable: options.ffmpegExecutable ?? null,
					ffprobeExecutable: options.ffprobeExecutable ?? null,
					port: options.port ?? null,
				}),
				browserInstance,
			]).then(([{serveUrl, closeServer, offthreadPort}, puppeteerInstance]) => {
				const {stopCycling} = cycleBrowserTabs(
					puppeteerInstance,
					actualParallelism
				);

				cleanup.push(stopCycling);
				cleanup.push(closeServer);

				return innerRenderFrames({
					...options,
					puppeteerInstance,
					onError,
					pagesArray: openedPages,
					serveUrl,
					composition,
					actualParallelism,
					onDownload,
					downloadDir,
					proxyPort: offthreadPort,
				});
			}),
		])
			.then((res) => {
				return resolve(res);
			})
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
					Promise.resolve(browserInstance)
						.then((puppeteerInstance) => {
							return puppeteerInstance.close();
						})
						.catch((err) => {
							console.log('Unable to close browser', err);
						});
				}

				cleanup.forEach((c) => {
					c();
				});
			});
	});
};
