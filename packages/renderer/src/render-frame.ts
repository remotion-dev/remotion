import type {VideoConfig} from 'remotion/no-react';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {Page} from './browser/BrowserPage';
import type {CountType} from './get-frame-padded-index';
import type {VideoImageFormat} from './image-format';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';
import type {Pool} from './pool';
import {renderFrameWithOptionToReject} from './render-frame-with-option-to-reject';
import type {FrameAndAssets, OnArtifact} from './render-frames';

export const renderFrame = ({
	frame,
	index,
	assetsOnly,
	attempt,
	binariesDirectory,
	cancelSignal,
	imageFormat,
	indent,
	logLevel,
	poolPromise,
	assets,
	countType,
	downloadMap,
	frameDir,
	framesToRender,
	jpegQuality,
	onArtifact,
	onDownload,
	scale,
	composition,
	onError,
	outputDir,
	stoppedSignal,
	timeoutInMilliseconds,
	lastFrame,
	onFrameBuffer,
	onFrameUpdate,
	framesRenderedObj,
}: {
	frame: number;
	index: number | null;
	assetsOnly: boolean;
	attempt: number;
	indent: boolean;
	logLevel: LogLevel;
	imageFormat: VideoImageFormat;
	cancelSignal: CancelSignal | undefined;
	binariesDirectory: string | null;
	poolPromise: Promise<Pool<Page>>;
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
	onFrameBuffer: null | ((buffer: Buffer, frame: number) => void) | undefined;
	lastFrame: number;
	onFrameUpdate:
		| null
		| ((
				framesRendered: number,
				frameIndex: number,
				timeToRenderInMilliseconds: number,
		  ) => void);
	framesRenderedObj: {count: number};
}) => {
	return new Promise<void>((resolve, reject) => {
		const startTime = performance.now();

		renderFrameWithOptionToReject({
			frame,
			index,
			reject,
			width: composition.width,
			height: composition.height,
			compId: composition.id,
			assetsOnly,
			attempt,
			indent,
			logLevel,
			poolPromise,
			stoppedSignal,
			timeoutInMilliseconds,
			imageFormat,
			onFrameBuffer,
			outputDir,
			assets,
			binariesDirectory,
			cancelSignal,
			countType,
			downloadMap,
			frameDir,
			framesToRender,
			jpegQuality,
			lastFrame,
			onArtifact,
			onDownload,
			onError,
			scale,
		})
			.then(() => {
				if (!assetsOnly) {
					framesRenderedObj.count++;
					onFrameUpdate?.(
						framesRenderedObj.count,
						frame,
						performance.now() - startTime,
					);
				}

				resolve();
			})
			.catch((err) => {
				reject(err);
			});
	});
};
