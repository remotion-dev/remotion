import path from 'path';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {downloadAndMapAssetsToFileUrl} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {Page} from './browser/BrowserPage';
import {compressAsset} from './compress-assets';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {onlyArtifact, onlyAudioAndVideoAssets} from './filter-asset-types';
import type {CountType} from './get-frame-padded-index';
import {getFrameOutputFileName} from './get-frame-padded-index';
import type {VideoImageFormat} from './image-format';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {startPerfMeasure, stopPerfMeasure} from './perf';
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
	onFrameBuffer: null | ((buffer: Buffer, frame: number) => void) | undefined;
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
}) => {
	const startTime = performance.now();

	const index = framesToRender.indexOf(frame);
	const assetsOnly = index === -1;

	if (stoppedSignal.stopped) {
		return Promise.reject(new Error('Render was stopped'));
	}

	const errorCallbackOnFrame = (err: Error) => {
		reject(err);
	};

	const cleanupPageError = handleJavascriptException({
		page,
		onError: errorCallbackOnFrame,
		frame,
	});
	page.on('error', errorCallbackOnFrame);

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

	if (!outputDir && !onFrameBuffer && imageFormat !== 'none') {
		throw new Error(
			'Called renderFrames() without specifying either `outputDir` or `onFrameBuffer`',
		);
	}

	if (outputDir && onFrameBuffer && imageFormat !== 'none') {
		throw new Error(
			'Pass either `outputDir` or `onFrameBuffer` to renderFrames(), not both.',
		);
	}

	const id = startPerfMeasure('save');

	const {buffer, collectedAssets} = await takeFrame({
		frame,
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
						}),
					),
		jpegQuality,
		width,
		scale,
		wantsBuffer: Boolean(onFrameBuffer),
		timeoutInMilliseconds,
	});
	if (onFrameBuffer && !assetsOnly) {
		if (!buffer) {
			throw new Error('unexpected null buffer');
		}

		onFrameBuffer(buffer, frame);
	}

	stopPerfMeasure(id);

	const onlyAvailableAssets = assets.filter(truthy);

	const previousAudioRenderAssets = onlyAvailableAssets
		.map((a) => a.audioAndVideoAssets)
		.flat(2);

	const previousArtifactAssets = onlyAvailableAssets
		.map((a) => a.artifactAssets)
		.flat(2);

	const audioAndVideoAssets = onlyAudioAndVideoAssets(collectedAssets);
	const artifactAssets = onlyArtifact(collectedAssets);

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

	assets.push({
		audioAndVideoAssets: compressedAssets,
		frame,
		artifactAssets: artifactAssets.map((a) => {
			return {
				frame: a.frame,
				filename: a.filename,
			};
		}),
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

	cleanupPageError();
	page.off('error', errorCallbackOnFrame);

	if (!assetsOnly) {
		framesRenderedObj.count++;
		onFrameUpdate?.(
			framesRenderedObj.count,
			frame,
			performance.now() - startTime,
		);
	}
};
