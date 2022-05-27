import {ExecaChildProcess} from 'execa';
import fs from 'fs';
import os from 'os';
import path from 'path';
import type {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {
	BrowserExecutable,
	Codec,
	FfmpegExecutable,
	FrameRange,
	Internals,
	PixelFormat,
	ProResProfile,
	SmallTCompMetadata,
} from 'remotion';
import {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {BrowserLog} from './browser-log';
import {canUseParallelEncoding} from './can-use-parallel-encoding';
import {ensureFramesInOrder} from './ensure-frames-in-order';
import {ensureOutputDirectory} from './ensure-output-directory';
import {getDurationFromFrameRange} from './get-duration-from-frame-range';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {getRealFrameRange} from './get-frame-to-render';
import {
	getServeUrlWithFallback,
	ServeUrlOrWebpackBundle,
} from './legacy-webpack-config';
import {ChromiumOptions} from './open-browser';
import {prespawnFfmpeg} from './prespawn-ffmpeg';
import {renderFrames} from './render-frames';
import {stitchFramesToVideo} from './stitch-frames-to-video';
import {tmpDir} from './tmp-dir';
import {OnStartData} from './types';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {validateOutputFilename} from './validate-output-filename';
import {validateScale} from './validate-scale';

export type StitchingState = 'encoding' | 'muxing';

export type RenderMediaOnProgress = (progress: {
	renderedFrames: number;
	encodedFrames: number;
	encodedDoneIn: number | null;
	renderedDoneIn: number | null;
	stitchStage: StitchingState;
}) => void;

export type RenderMediaOptions = {
	outputLocation: string;
	codec: Codec;
	composition: SmallTCompMetadata;
	inputProps?: unknown;
	parallelism?: number | null;
	crf?: number | null;
	imageFormat?: 'png' | 'jpeg' | 'none';
	ffmpegExecutable?: FfmpegExecutable;
	pixelFormat?: PixelFormat;
	envVariables?: Record<string, string>;
	quality?: number;
	frameRange?: FrameRange | null;
	puppeteerInstance?: PuppeteerBrowser;
	overwrite?: boolean;
	onProgress?: RenderMediaOnProgress;
	onDownload?: RenderMediaOnDownload;
	proResProfile?: ProResProfile;
	dumpBrowserLogs?: boolean;
	onBrowserLog?: ((log: BrowserLog) => void) | undefined;
	onStart?: (data: OnStartData) => void;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
	port?: number | null;
	browserExecutable?: BrowserExecutable;
} & ServeUrlOrWebpackBundle;

type Await<T> = T extends PromiseLike<infer U> ? U : T;

export const renderMedia = async ({
	parallelism,
	proResProfile,
	crf,
	composition,
	imageFormat,
	ffmpegExecutable,
	inputProps,
	pixelFormat,
	codec,
	envVariables,
	quality,
	frameRange,
	puppeteerInstance,
	outputLocation,
	onProgress,
	overwrite,
	onDownload,
	dumpBrowserLogs,
	onBrowserLog,
	onStart,
	timeoutInMilliseconds,
	chromiumOptions,
	scale,
	browserExecutable,
	port,
	...options
}: RenderMediaOptions) => {
	Internals.validateQuality(quality);
	if (typeof crf !== 'undefined' && crf !== null) {
		Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	}

	validateOutputFilename(codec, getExtensionOfFilename(outputLocation));

	validateScale(scale);

	const serveUrl = getServeUrlWithFallback(options);

	let stitchStage: StitchingState = 'encoding';
	let stitcherFfmpeg: ExecaChildProcess<string> | undefined;
	let preStitcher: Await<ReturnType<typeof prespawnFfmpeg>> | null = null;
	let encodedFrames = 0;
	let renderedFrames = 0;
	let renderedDoneIn: number | null = null;
	let encodedDoneIn: number | null = null;
	const renderStart = Date.now();
	const tmpdir = tmpDir('pre-encode');
	const parallelEncoding = canUseParallelEncoding(codec);
	const actualImageFormat = imageFormat ?? 'jpeg';

	const preEncodedFileLocation = parallelEncoding
		? path.join(
				tmpdir,
				'pre-encode.' + getFileExtensionFromCodec(codec, 'chunk')
		  )
		: null;

	const outputDir = parallelEncoding
		? null
		: await fs.promises.mkdtemp(path.join(os.tmpdir(), 'react-motion-render'));

	validateEvenDimensionsWithCodec({
		codec,
		height: composition.height,
		scale: scale ?? 1,
		width: composition.width,
	});

	try {
		const callUpdate = () => {
			onProgress?.({
				encodedDoneIn,
				encodedFrames,
				renderedDoneIn,
				renderedFrames,
				stitchStage,
			});
		};

		if (preEncodedFileLocation) {
			preStitcher = await prespawnFfmpeg({
				width: composition.width * (scale ?? 1),
				height: composition.height * (scale ?? 1),
				fps: composition.fps,
				outputLocation: preEncodedFileLocation,
				pixelFormat,
				codec,
				proResProfile,
				crf,
				onProgress: (frame: number) => {
					encodedFrames = frame;
					callUpdate();
				},
				verbose: Internals.Logging.isEqualOrBelowLogLevel(
					Internals.Logging.getLogLevel(),
					'verbose'
				),
				ffmpegExecutable,
				imageFormat: actualImageFormat,
			});
			stitcherFfmpeg = preStitcher.task;
		}

		const realFrameRange = getRealFrameRange(
			composition.durationInFrames,
			frameRange ?? null
		);

		const {
			waitForRightTimeOfFrameToBeInserted,
			setFrameToStitch,
			waitForFinish,
		} = ensureFramesInOrder(realFrameRange);

		const {assetsInfo} = await renderFrames({
			config: composition,
			onFrameUpdate: (frame: number) => {
				renderedFrames = frame;
				callUpdate();
			},
			parallelism,
			outputDir,
			onStart: (data) => {
				renderedFrames = 0;
				callUpdate();
				onStart?.(data);
			},
			inputProps,
			envVariables,
			imageFormat: actualImageFormat,
			quality,
			frameRange: frameRange ?? null,
			puppeteerInstance,
			onFrameBuffer: parallelEncoding
				? async (buffer, frame) => {
						await waitForRightTimeOfFrameToBeInserted(frame);
						stitcherFfmpeg?.stdin?.write(buffer);

						setFrameToStitch(frame + 1);
				  }
				: undefined,
			serveUrl,
			dumpBrowserLogs,
			onBrowserLog,
			onDownload,
			timeoutInMilliseconds,
			chromiumOptions,
			scale,
			ffmpegExecutable,
			browserExecutable,
			port,
		});
		if (stitcherFfmpeg) {
			await waitForFinish();
			stitcherFfmpeg?.stdin?.end();
			try {
				await stitcherFfmpeg;
			} catch (err) {
				throw new Error(preStitcher?.getLogs());
			}
		}

		renderedDoneIn = Date.now() - renderStart;
		callUpdate();

		ensureOutputDirectory(outputLocation);

		const stitchStart = Date.now();

		await stitchFramesToVideo({
			width: composition.width * (scale ?? 1),
			height: composition.height * (scale ?? 1),
			fps: composition.fps,
			outputLocation,
			internalOptions: {
				preEncodedFileLocation,
				imageFormat: actualImageFormat,
			},
			force: overwrite ?? Internals.DEFAULT_OVERWRITE,
			pixelFormat,
			codec,
			proResProfile,
			crf,
			assetsInfo,
			ffmpegExecutable,
			onProgress: (frame: number) => {
				stitchStage = 'muxing';
				encodedFrames = frame;
				callUpdate();
			},
			onDownload,
			verbose: Internals.Logging.isEqualOrBelowLogLevel(
				Internals.Logging.getLogLevel(),
				'verbose'
			),
			dir: outputDir ?? undefined,
		});
		encodedFrames = getDurationFromFrameRange(
			frameRange ?? null,
			composition.durationInFrames
		);
		encodedDoneIn = Date.now() - stitchStart;
		callUpdate();
	} finally {
		if (
			preEncodedFileLocation !== null &&
			fs.existsSync(preEncodedFileLocation)
		) {
			fs.unlinkSync(preEncodedFileLocation);
		}
	}
};
