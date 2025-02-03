import type {VideoConfig} from 'remotion/no-react';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {Page} from './browser/BrowserPage';
import type {CountType} from './get-frame-padded-index';
import type {VideoImageFormat} from './image-format';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';
import type {NextFrameToRender} from './next-frame-to-render';
import {renderFrameWithOptionToReject} from './render-frame-with-option-to-reject';
import type {FrameAndAssets, OnArtifact} from './render-frames';

export const renderFrame = ({
	attempt,
	binariesDirectory,
	cancelSignal,
	imageFormat,
	indent,
	logLevel,
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
	frame,
	page,
}: {
	attempt: number;
	indent: boolean;
	logLevel: LogLevel;
	imageFormat: VideoImageFormat;
	cancelSignal: CancelSignal | undefined;
	binariesDirectory: string | null;
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
	nextFrameToRender: NextFrameToRender;
	frame: number;
	page: Page;
}) => {
	return new Promise<void>((resolve, reject) => {
		renderFrameWithOptionToReject({
			reject,
			width: composition.width,
			height: composition.height,
			compId: composition.id,
			attempt,
			indent,
			logLevel,
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
			framesRenderedObj,
			onFrameUpdate,
			frame,
			page,
		})
			.then(() => {
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
	});
};
