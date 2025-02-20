import type {VideoConfig} from 'remotion/no-react';
import {NoReactInternals} from 'remotion/no-react';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {isFlakyNetworkError, isTargetClosedErr} from './browser/flaky-errors';
import type {CountType} from './get-frame-padded-index';
import type {VideoImageFormat} from './image-format';
import {getRetriesLeftFromError} from './is-delay-render-error-with-retry';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {cancelErrorMessages, isUserCancelledRender} from './make-cancel-signal';
import type {NextFrameToRender} from './next-frame-to-render';
import type {Pool} from './pool';
import {renderFrame} from './render-frame';
import type {FrameAndAssets, OnArtifact} from './render-frames';
import type {BrowserReplacer} from './replace-browser';

export const renderFrameAndRetryTargetClose = async ({
	retriesLeft,
	attempt,
	assets,
	imageFormat,
	binariesDirectory,
	cancelSignal,
	composition,
	countType,
	downloadMap,
	frameDir,
	framesToRender,
	jpegQuality,
	onArtifact,
	onDownload,
	onError,
	outputDir,
	poolPromise,
	scale,
	stoppedSignal,
	timeoutInMilliseconds,
	indent,
	logLevel,
	makeBrowser,
	makeNewPage,
	browserReplacer,
	concurrencyOrFramesToRender,
	framesRenderedObj,
	lastFrame,
	onFrameBuffer,
	onFrameUpdate,
	nextFrameToRender,
}: {
	retriesLeft: number;
	attempt: number;
	imageFormat: VideoImageFormat;
	cancelSignal: CancelSignal | undefined;
	binariesDirectory: string | null;
	poolPromise: Promise<Pool>;
	jpegQuality: number;
	frameDir: string;
	scale: number;
	countType: CountType;
	assets: FrameAndAssets[];
	framesToRender: number[];
	onArtifact: OnArtifact | null;
	onDownload: RenderMediaOnDownload | null;
	downloadMap: DownloadMap;
	composition: Omit<VideoConfig, 'defaultProps' | 'props'>;
	onError: (err: Error) => void;
	stoppedSignal: {stopped: boolean};
	timeoutInMilliseconds: number;
	outputDir: string | null;
	indent: boolean;
	logLevel: LogLevel;
	makeBrowser: () => Promise<HeadlessBrowser>;
	makeNewPage: (frame: number, pageIndex: number) => Promise<Page>;
	browserReplacer: BrowserReplacer;
	concurrencyOrFramesToRender: number;
	lastFrame: number;
	framesRenderedObj: {count: number};
	onFrameBuffer: null | ((buffer: Buffer, frame: number) => void) | undefined;
	onFrameUpdate:
		| null
		| ((
				framesRendered: number,
				frameIndex: number,
				timeToRenderInMilliseconds: number,
		  ) => void);
	nextFrameToRender: NextFrameToRender;
}): Promise<void> => {
	const currentPool = await poolPromise;

	if (stoppedSignal.stopped) {
		return;
	}

	const freePage = await currentPool.acquire();

	const frame = nextFrameToRender.getNextFrame(freePage.pageIndex);

	try {
		await Promise.race([
			renderFrame({
				attempt,
				assets,
				binariesDirectory,
				cancelSignal,
				countType,
				downloadMap,
				frameDir,
				framesToRender,
				imageFormat,
				indent,
				jpegQuality,
				logLevel,
				onArtifact,
				onDownload,
				scale,
				composition,
				framesRenderedObj,
				lastFrame,
				onError,
				onFrameBuffer,
				onFrameUpdate,
				outputDir,
				stoppedSignal,
				timeoutInMilliseconds,
				nextFrameToRender,
				frame,
				page: freePage,
			}),
			new Promise((_, reject) => {
				cancelSignal?.(() => {
					reject(new Error(cancelErrorMessages.renderFrames));
				});
			}),
		]);
		currentPool.release(freePage);
	} catch (err) {
		const isTargetClosedError = isTargetClosedErr(err as Error);
		const shouldRetryError = (err as Error).stack?.includes(
			NoReactInternals.DELAY_RENDER_RETRY_TOKEN,
		);
		const flakyNetworkError = isFlakyNetworkError(err as Error);

		if (isUserCancelledRender(err) && !shouldRetryError) {
			throw err;
		}

		if (!isTargetClosedError && !shouldRetryError && !flakyNetworkError) {
			throw err;
		}

		if (stoppedSignal.stopped) {
			return;
		}

		if (retriesLeft === 0) {
			Log.warn(
				{
					indent,
					logLevel,
				},
				`The browser crashed ${attempt} times while rendering frame ${frame}. Not retrying anymore. Learn more about this error under https://www.remotion.dev/docs/target-closed`,
			);
			throw err;
		}

		if (shouldRetryError) {
			const pool = await poolPromise;
			// Replace the closed page
			const newPage = await makeNewPage(frame, freePage.pageIndex);
			pool.release(newPage);
			Log.warn(
				{indent, logLevel},
				`delayRender() timed out while rendering frame ${frame}: ${(err as Error).message}`,
			);
			const actualRetriesLeft = getRetriesLeftFromError(err as Error);
			nextFrameToRender.returnFrame(frame);

			return renderFrameAndRetryTargetClose({
				retriesLeft: actualRetriesLeft,
				attempt: attempt + 1,
				assets,
				imageFormat,
				binariesDirectory,
				cancelSignal,
				composition,
				countType,
				downloadMap,
				frameDir,
				framesToRender,
				indent,
				jpegQuality,
				logLevel,
				onArtifact,
				onDownload,
				onError,
				outputDir,
				poolPromise,
				scale,
				stoppedSignal,
				timeoutInMilliseconds,
				makeBrowser,
				makeNewPage,
				browserReplacer,
				concurrencyOrFramesToRender,
				framesRenderedObj,
				lastFrame,
				onFrameBuffer,
				onFrameUpdate,
				nextFrameToRender,
			});
		}

		Log.warn(
			{indent, logLevel},
			`The browser crashed while rendering frame ${frame}, retrying ${retriesLeft} more times. Learn more about this error under https://www.remotion.dev/docs/target-closed`,
		);
		// Replace the entire browser
		await browserReplacer.replaceBrowser(makeBrowser, async () => {
			const pages = new Array(concurrencyOrFramesToRender)
				.fill(true)
				.map((_, i) => makeNewPage(frame, i));
			const puppeteerPages = await Promise.all(pages);
			const pool = await poolPromise;
			for (const newPage of puppeteerPages) {
				pool.release(newPage);
			}
		});

		nextFrameToRender.returnFrame(frame);

		await renderFrameAndRetryTargetClose({
			retriesLeft: retriesLeft - 1,
			attempt: attempt + 1,
			assets,
			binariesDirectory,
			cancelSignal,
			composition,
			countType,
			downloadMap,
			frameDir,
			framesToRender,
			imageFormat,
			indent,
			jpegQuality,
			logLevel,
			onArtifact,
			makeBrowser,
			onDownload,
			onError,
			outputDir,
			poolPromise,
			scale,
			stoppedSignal,
			timeoutInMilliseconds,
			browserReplacer,
			makeNewPage,
			concurrencyOrFramesToRender,
			framesRenderedObj,
			lastFrame,
			onFrameBuffer,
			onFrameUpdate,
			nextFrameToRender,
		});
	}
};
