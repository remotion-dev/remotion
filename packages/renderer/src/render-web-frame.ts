import path from 'path';
import type {ClipRegion, SmallTCompMetadata, TAsset} from 'remotion';
import type {DownloadMap} from './assets/download-map';
import {DEFAULT_BROWSER} from './browser';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {Page} from './browser/BrowserPage';
import type {ConsoleMessage} from './browser/ConsoleMessage';
import type {CompositorLayer} from './compositor/payloads';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import type {CountType} from './get-frame-padded-index';
import type {ServeUrl} from './legacy-webpack-config';
import {isUserCancelledRender} from './make-cancel-signal';
import type {ChromiumOptions} from './open-browser';
import {openBrowser} from './open-browser';
import {startPerfMeasure, stopPerfMeasure} from './perf';
import type {Pool} from './pool';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import type {BrowserReplacer} from './replace-browser';
import {seekToFrame} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import {takeFrame} from './take-frame-and-compose';

const renderFrameWithOptionToReject = async ({
	frame,
	index,
	reject,
	width,
	height,
	poolPromise,
	stopState,
	imageFormat,
	downloadMap,
	scale,
	quality,
}: {
	frame: number;
	index: number;
	reject: (err: Error) => void;
	width: number;
	height: number;
	poolPromise: Promise<Pool<Page>>;
	stopState: {isStopped: boolean};
	imageFormat: 'png' | 'jpeg' | 'none';
	downloadMap: DownloadMap;
	scale: number;
	quality: number | undefined;
}): Promise<{
	layer: CompositorLayer | null;
	buffer: Buffer | null;
	assets: TAsset[];
}> => {
	const pool = await poolPromise;
	const freePage = await pool.acquire();

	if (stopState.isStopped) {
		reject(new Error('Render was stopped'));
		throw new Error('stopped');
	}

	const errorCallbackOnFrame = (err: Error) => {
		reject(err);
	};

	const cleanupPageError = handleJavascriptException({
		page: freePage,
		onError: errorCallbackOnFrame,
		frame,
	});
	freePage.on('error', errorCallbackOnFrame);
	await seekToFrame({frame, page: freePage});

	const id = startPerfMeasure('save');

	const output = path.join(
		downloadMap.compositingDir,
		`preframe-${index}.${imageFormat}`
	);

	const {buffer, collectedAssets, clipRegion} = await takeFrame({
		frame,
		freePage,
		height,
		imageFormat,
		quality,
		width,
	});

	const needsComposing =
		clipRegion === null
			? null
			: {
					tmpFile: path.join(
						downloadMap.compositingDir,
						`${frame}.${imageFormat}`
					),
					finalOutfie:
						output ??
						path.join(
							downloadMap.compositingDir,
							`${frame}-final.${imageFormat}`
						),
					clipRegion: clipRegion as ClipRegion,
			  };

	const compositionLayer: CompositorLayer | null =
		!needsComposing || needsComposing.clipRegion === 'hide'
			? null
			: {
					type:
						imageFormat === 'jpeg'
							? ('JpgImage' as const)
							: ('PngImage' as const),
					params: {
						height: needsComposing.clipRegion.height * scale,
						width: needsComposing.clipRegion.width * scale,
						src: needsComposing.tmpFile,
						x: needsComposing.clipRegion.x * scale,
						y: needsComposing.clipRegion.y * scale,
					},
			  };

	// TODO: Always return buffer

	stopPerfMeasure(id);

	cleanupPageError();
	freePage.off('error', errorCallbackOnFrame);
	pool.release(freePage);

	return {layer: compositionLayer, buffer, assets: collectedAssets};
};

const renderWebFrame = ({
	frame,
	index,
	downloadMap,
	imageFormat,
	poolPromise,
	stopState,
	composition,
	scale,
	quality,
}: {
	frame: number;
	index: number;
	downloadMap: DownloadMap;
	imageFormat: 'png' | 'jpeg' | 'none';
	poolPromise: Promise<Pool<Page>>;
	stopState: {
		isStopped: boolean;
	};
	composition: SmallTCompMetadata;
	scale: number;
	quality: number | undefined;
}) => {
	return new Promise<{
		layer: CompositorLayer | null;
		buffer: Buffer | null;
		assets: TAsset[];
	}>((resolve, reject) => {
		renderFrameWithOptionToReject({
			frame,
			index,
			reject,
			width: composition.width,
			height: composition.height,
			downloadMap,
			imageFormat,
			poolPromise,
			stopState,
			scale,
			quality,
		})
			.then((res) => {
				resolve(res);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

// TODO: Bring fixes for retrying here
export const renderWebFrameAndRetryTargetClose = async ({
	frame,
	index,
	retriesLeft,
	attempt,
	actualConcurrency,
	browserReplacer,
	poolPromise,
	composition,
	downloadMap,
	imageFormat,
	onFrameBuffer,
	outputDir,
	stopState,
	countType,
	scale,
	quality,
	framesToRender,
	lastFrame,
	framesRendered,
	browserExecutable,
	chromiumOptions,
	dumpBrowserLogs,
	pagesArray,
	onBrowserLog,
	inputProps,
	envVariables,
	muted,
	proxyPort,
	realFrameRange,
	serveUrl,
	timeoutInMilliseconds,
}: {
	frame: number;
	index: number;
	retriesLeft: number;
	attempt: number;
	actualConcurrency: number;
	browserReplacer: BrowserReplacer | null;
	poolPromise: Promise<Pool<Page>>;
	composition: SmallTCompMetadata;
	downloadMap: DownloadMap;
	imageFormat: 'png' | 'jpeg' | 'none';
	onFrameBuffer: ((buffer: Buffer, frame: number) => void) | undefined;
	outputDir: string | null;
	stopState: {
		isStopped: boolean;
	};
	countType: CountType;
	scale: number;
	quality: number | undefined;
	framesToRender: number[];
	lastFrame: number;
	framesRendered: {
		frames: number;
	};
	browserExecutable?: BrowserExecutable;
	chromiumOptions?: ChromiumOptions;
	dumpBrowserLogs?: boolean;
	pagesArray: Page[];
	onBrowserLog?: (log: BrowserLog) => void;
	inputProps: unknown;
	envVariables?: Record<string, string>;
	muted: boolean;
	proxyPort: number;
	realFrameRange: [number, number];
	serveUrl: ServeUrl;
	timeoutInMilliseconds: number;
}): Promise<{
	layer: CompositorLayer | null;
	buffer: Buffer | null;
	assets: TAsset[];
}> => {
	try {
		const returnval = await renderWebFrame({
			frame,
			index,
			poolPromise,
			composition,
			downloadMap,
			imageFormat,
			stopState,
			scale,
			quality,
		});

		return returnval;
	} catch (err) {
		if (
			!(err as Error)?.message?.includes('Target closed') &&
			!(err as Error)?.message?.includes('Session closed')
		) {
			throw err;
		}

		if (isUserCancelledRender(err)) {
			throw err;
		}

		if (retriesLeft === 0) {
			console.warn(
				err,
				`The browser crashed ${attempt} times while rendering frame ${frame}. Not retrying anymore. Learn more about this error under https://www.remotion.dev/docs/target-closed`
			);
			throw err;
		}

		console.warn(
			`The browser crashed while rendering frame ${frame}, retrying ${retriesLeft} more times. Learn more about this error under https://www.remotion.dev/docs/target-closed`
		);
		if (!browserReplacer) {
			throw new Error('Did not have browser replacer for web frame');
		}

		await browserReplacer.replaceBrowser(
			() =>
				makeBrowser({
					browserExecutable,
					chromiumOptions,
					dumpBrowserLogs,
					scale,
				}),
			async () => {
				const pages = new Array(actualConcurrency).fill(true).map(() =>
					makePage({
						browserReplacer,
						composition,
						pagesArray,
						onBrowserLog,
						scale,
						inputProps,
						envVariables,
						imageFormat,
						muted,
						proxyPort,
						realFrameRange,
						serveUrl,
						timeoutInMilliseconds,
					})
				);
				const puppeteerPages = await Promise.all(pages);
				const pool = await poolPromise;
				for (const newPage of puppeteerPages) {
					pool.release(newPage);
				}
			}
		);
		const fram = await renderWebFrameAndRetryTargetClose({
			frame,
			index,
			retriesLeft: retriesLeft - 1,
			attempt: attempt + 1,
			actualConcurrency,
			browserReplacer,
			composition,
			downloadMap,
			imageFormat,
			onFrameBuffer,
			outputDir,
			poolPromise,
			stopState,
			countType,
			scale,
			quality,
			framesToRender,
			lastFrame,
			framesRendered,
			inputProps,
			pagesArray,
			browserExecutable,
			chromiumOptions,
			dumpBrowserLogs,
			envVariables,
			muted,
			onBrowserLog,
			proxyPort,
			realFrameRange,
			serveUrl,
			timeoutInMilliseconds,
		});

		return fram;
	}
};

export const makePage = async ({
	browserReplacer,
	pagesArray,
	composition,
	scale,
	onBrowserLog,
	inputProps,
	envVariables,
	serveUrl,
	realFrameRange,
	timeoutInMilliseconds,
	proxyPort,
	imageFormat,
	muted,
}: {
	browserReplacer: BrowserReplacer;
	pagesArray: Page[];
	composition: SmallTCompMetadata;
	scale?: number;
	onBrowserLog?: (log: BrowserLog) => void;
	inputProps: unknown;
	envVariables?: Record<string, string>;
	serveUrl: ServeUrl;
	realFrameRange: [number, number];
	timeoutInMilliseconds: number | undefined;
	proxyPort: number;
	imageFormat: 'png' | 'jpeg' | 'none';
	muted: boolean;
}) => {
	if (!browserReplacer) {
		throw new Error('canonot make page without browser replacer');
	}

	const page = await browserReplacer.getBrowser().newPage();
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
		audioEnabled: !muted,
		videoEnabled: imageFormat !== 'none',
	});

	await puppeteerEvaluateWithCatch({
		// eslint-disable-next-line max-params
		pageFunction: (
			id: string,
			defaultProps: unknown,
			durationInFrames: number,
			fps: number,
			height: number,
			width: number
		) => {
			window.setBundleMode({
				type: 'composition',
				compositionName: id,
				compositionDefaultProps: defaultProps,
				compositionDurationInFrames: durationInFrames,
				compositionFps: fps,
				compositionHeight: height,
				compositionWidth: width,
			});
		},
		args: [
			composition.id,
			composition.defaultProps,
			composition.durationInFrames,
			composition.fps,
			composition.height,
			composition.width,
		],
		frame: null,
		page,
	});

	page.off('console', logCallback);

	return page;
};

export const makeBrowser = ({
	dumpBrowserLogs,
	browserExecutable,
	chromiumOptions,
	scale,
}: {
	dumpBrowserLogs?: boolean | undefined;
	browserExecutable?: BrowserExecutable | undefined;
	chromiumOptions?: ChromiumOptions | undefined;
	scale?: number | undefined;
}) =>
	openBrowser(DEFAULT_BROWSER, {
		shouldDumpIo: dumpBrowserLogs,
		browserExecutable,
		chromiumOptions,
		forceDeviceScaleFactor: scale ?? 1,
	});
