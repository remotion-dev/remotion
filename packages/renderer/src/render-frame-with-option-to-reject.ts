import path from 'path';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {downloadAndMapAssetsToFileUrl} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {Page} from './browser/BrowserPage';
import {collectAssets} from './collect-assets';
import {compressAsset} from './compress-assets';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {
	onlyArtifact,
	onlyAudioAndVideoAssets,
	onlyInlineAudio,
} from './filter-asset-types';
import type {CountType} from './get-frame-padded-index';
import {getFrameOutputFileName} from './get-frame-padded-index';
import type {VideoImageFormat} from './image-format';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import type {
	CapturedFrame,
	RemotionSharedMemoryCapture,
} from './remotion-shared-memory';
import {isRemotionRawFrame} from './remotion-shared-memory';
import type {FrameAndAssets, OnArtifact} from './render-frames';
import {seekToFrame} from './seek-to-frame';
import {takeFrame} from './take-frame';
import {truthy} from './truthy';

export const renderFrameWithOptionToReject = async ({
	reject,
	width,
	height,
	compId,
	attempt,
	stoppedSignal,
	indent,
	logLevel,
	timeoutInMilliseconds,
	outputDir,
	onFrameBuffer,
	onFrame,
	remotionSharedMemory,
	imageFormat,
	onError,
	lastFrame,
	jpegQuality,
	frameDir,
	scale,
	countType,
	assets,
	framesToRender,
	onArtifact,
	onDownload,
	downloadMap,
	binariesDirectory,
	cancelSignal,
	framesRenderedObj,
	onFrameUpdate,
	frame,
	page,
	imageSequencePattern,
	fps,
	trimLeftOffset,
	trimRightOffset,
	allFramesAndExtraFrames,
}: {
	reject: (err: Error) => void;
	width: number;
	height: number;
	compId: string;
	attempt: number;
	stoppedSignal: {stopped: boolean};
	timeoutInMilliseconds: number;
	indent: boolean;
	logLevel: LogLevel;
	outputDir: string | null;
	onFrameBuffer:
		| null
		| ((buffer: Buffer, frame: number) => void | Promise<void>)
		| undefined;
	onFrame:
		| null
		| ((frame: CapturedFrame, frameNumber: number) => void | Promise<void>);
	remotionSharedMemory: RemotionSharedMemoryCapture | null;
	imageFormat: VideoImageFormat;
	onError: (err: Error) => void;
	lastFrame: number;
	jpegQuality: number;
	frameDir: string;
	scale: number;
	countType: CountType;
	assets: FrameAndAssets[];
	framesToRender: number[];
	onArtifact: OnArtifact | null;
	onDownload: RenderMediaOnDownload | null;
	downloadMap: DownloadMap;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
	framesRenderedObj: {count: number};
	onFrameUpdate:
		| null
		| ((
				framesRendered: number,
				frameIndex: number,
				timeToRenderInMilliseconds: number,
		  ) => void);
	frame: number;
	page: Page;
	imageSequencePattern: string | null;
	fps: number;
	trimLeftOffset: number;
	trimRightOffset: number;
	allFramesAndExtraFrames: number[];
}) => {
	const startTime = performance.now();

	const index = framesToRender.indexOf(frame);
	const assetsOnly = index === -1;

	if (stoppedSignal.stopped) {
		return Promise.reject(new Error('Render was stopped'));
	}

	let pageError: Error | null = null;
	const errorCallbackOnFrame = (err: Error) => {
		pageError ??= err;
		reject(err);
	};

	const cleanupPageError = handleJavascriptException({
		page,
		onError: errorCallbackOnFrame,
		frame,
	});
	page.on('error', errorCallbackOnFrame);
	let pageListenersCleaned = false;
	const cleanupPageListeners = () => {
		if (pageListenersCleaned) {
			return;
		}

		pageListenersCleaned = true;
		cleanupPageError();
		page.off('error', errorCallbackOnFrame);
	};

	try {
		const startSeeking = Date.now();

		await seekToFrame({
			frame,
			page,
			composition: compId,
			timeoutInMilliseconds,
			indent,
			logLevel,
			attempt,
		});

		const timeToSeek = Date.now() - startSeeking;
		if (timeToSeek > 1000) {
			Log.verbose(
				{indent, logLevel},
				`Seeking to frame ${frame} took ${timeToSeek}ms`,
			);
		}

		if (!outputDir && !onFrameBuffer && !onFrame && imageFormat !== 'none') {
			throw new Error(
				'Called renderFrames() without specifying either `outputDir` or `onFrameBuffer`',
			);
		}

		if (outputDir && (onFrameBuffer || onFrame) && imageFormat !== 'none') {
			throw new Error(
				'Pass either `outputDir` or `onFrameBuffer` to renderFrames(), not both.',
			);
		}

		const [captureResult, assetsResult] = await Promise.allSettled([
			takeFrame({
				freePage: page,
				height,
				imageFormat: assetsOnly ? 'none' : imageFormat,
				output:
					index === null
						? null
						: path.join(
								frameDir,
								getFrameOutputFileName({
									frame,
									imageFormat,
									index,
									countType,
									lastFrame,
									totalFrames: framesToRender.length,
									imageSequencePattern,
								}),
							),
				jpegQuality,
				width,
				scale,
				wantsBuffer: Boolean(onFrameBuffer || onFrame),
				timeoutInMilliseconds,
				remotionSharedMemory,
			}),
			collectAssets({
				frame,
				freePage: page,
				timeoutInMilliseconds,
			}),
		]);
		if (captureResult.status === 'rejected') {
			throw captureResult.reason;
		}

		const buffer = captureResult.value;
		if (assetsResult.status === 'rejected') {
			if (buffer !== null && isRemotionRawFrame(buffer)) {
				try {
					await buffer.release();
				} catch {
					// Preserve the asset collection error so the frame can be retried.
				}
			}

			throw assetsResult.reason;
		}

		const collectedAssets = assetsResult.value;
		let frameBufferForArtifacts = Buffer.isBuffer(buffer) ? buffer : null;
		if (
			buffer !== null &&
			isRemotionRawFrame(buffer) &&
			collectedAssets.some(
				(asset) =>
					asset.type === 'artifact' && asset.contentType === 'thumbnail',
			)
		) {
			try {
				const thumbnail = await takeFrame({
					freePage: page,
					height,
					imageFormat,
					output: null,
					jpegQuality,
					width,
					scale,
					wantsBuffer: true,
					timeoutInMilliseconds,
					remotionSharedMemory: null,
				});
				if (!thumbnail) {
					throw new Error('Could not capture a thumbnail artifact.');
				}

				frameBufferForArtifacts = thumbnail;
			} catch (error) {
				try {
					await buffer.release();
				} catch {
					// Preserve the thumbnail capture error so the frame can be retried.
				}

				throw error;
			}
		}

		cleanupPageListeners();
		if (pageError) {
			if (buffer !== null && isRemotionRawFrame(buffer)) {
				try {
					await buffer.release();
				} catch {
					// Preserve the page error so the frame can be retried.
				}
			}

			throw pageError;
		}

		if ((onFrameBuffer || onFrame) && !assetsOnly) {
			if (!buffer) {
				throw new Error('unexpected null buffer');
			}

			if (onFrame) {
				await onFrame(buffer, frame);
			} else {
				if (isRemotionRawFrame(buffer)) {
					try {
						await buffer.release();
					} catch {
						// The type mismatch is the primary error.
					}

					throw new Error(
						'Raw shared-memory frames cannot be passed to renderFrames().',
					);
				}

				await onFrameBuffer?.(buffer, frame);
			}
		}

		const onlyAvailableAssets = assets.filter(truthy);

		const previousAudioRenderAssets = onlyAvailableAssets
			.map((a) => a.audioAndVideoAssets)
			.flat(2);

		const previousArtifactAssets = onlyAvailableAssets
			.map((a) => a.artifactAssets)
			.flat(2);

		const audioAndVideoAssets = onlyAudioAndVideoAssets(collectedAssets);
		const artifactAssets = onlyArtifact({
			assets: collectedAssets,
			frameBuffer: frameBufferForArtifacts,
		});

		for (const artifact of artifactAssets) {
			for (const previousArtifact of previousArtifactAssets) {
				if (artifact.filename === previousArtifact.filename) {
					return Promise.reject(
						new Error(
							`An artifact with output "${artifact.filename}" was already registered at frame ${previousArtifact.frame}, but now registered again at frame ${artifact.frame}. Artifacts must have unique names. https://remotion.dev/docs/artifacts`,
						),
					);
				}
			}

			onArtifact?.(artifact);
		}

		const compressedAssets = audioAndVideoAssets.map((asset) => {
			return compressAsset(previousAudioRenderAssets, asset);
		});

		const inlineAudioAssets = onlyInlineAudio(collectedAssets);
		const outputFrame =
			allFramesAndExtraFrames[0] + allFramesAndExtraFrames.indexOf(frame);

		assets.push({
			audioAndVideoAssets: compressedAssets,
			frame,
			artifactAssets: artifactAssets.map((a) => {
				return {
					frame: a.frame,
					filename: a.filename,
				};
			}),
			inlineAudioAssets,
		});

		for (const renderAsset of compressedAssets) {
			downloadAndMapAssetsToFileUrl({
				renderAsset,
				onDownload,
				downloadMap,
				indent,
				logLevel,
				binariesDirectory,
				cancelSignalForAudioAnalysis: cancelSignal,
				shouldAnalyzeAudioImmediately: true,
			}).catch((err) => {
				const truncateWithEllipsis =
					renderAsset.src.substring(0, 1000) +
					(renderAsset.src.length > 1000 ? '...' : '');
				onError(
					new Error(
						`Error while downloading ${truncateWithEllipsis}: ${(err as Error).stack}`,
					),
				);
			});
		}

		for (const renderAsset of inlineAudioAssets) {
			downloadMap.inlineAudioMixing.addAsset({
				asset: {...renderAsset, frame: outputFrame},
				fps,
				totalNumberOfFrames: allFramesAndExtraFrames.length,
				firstFrame: allFramesAndExtraFrames[0],
				trimLeftOffset,
				trimRightOffset,
			});
		}

		if (!assetsOnly) {
			framesRenderedObj.count++;
			onFrameUpdate?.(
				framesRenderedObj.count,
				frame,
				performance.now() - startTime,
			);
		}
	} finally {
		cleanupPageListeners();
	}
};
