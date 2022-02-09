import {ExecaChildProcess} from 'execa';
import os from 'os';
import fs from 'fs';
import path from 'path';
import type {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {
	Codec,
	FfmpegExecutable,
	FrameRange,
	Internals,
	PixelFormat,
	ProResProfile,
	SmallTCompMetadata,
} from 'remotion';
import {stitchFramesToVideo, spawnFfmpeg} from './stitcher';
import {renderFrames} from './render';
import {BrowserLog} from './browser-log';
import {OnStartData} from './types';
import {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {tmpDir} from './tmp-dir';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {
	getServeUrlWithFallback,
	ServeUrlOrWebpackBundle,
} from './legacy-webpack-config';
import {ensureOutputDirectory} from './ensure-output-directory';
import {ensureFramesInOrder} from './ensure-frames-in-order';
import {getRealFrameRange} from './get-frame-to-render';
import {ChromiumOptions} from './open-browser';
import {validateScale} from './validate-scale';
import {canUseParallelEncoding} from './can-use-parallel-encoding';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';

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
	...options
}: RenderMediaOptions) => {
	Internals.validateQuality(quality);
	if (typeof crf !== 'undefined' && crf !== null) {
		Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	}

	validateScale(scale);

	const serveUrl = getServeUrlWithFallback(options);

	let stitchStage: StitchingState = 'encoding';
	let stitcherFfmpeg: ExecaChildProcess<string> | undefined;
	let preStitcher: Await<ReturnType<typeof spawnFfmpeg>> | null = null;
	let encodedFrames = 0;
	let renderedFrames = 0;
	let renderedDoneIn: number | null = null;
	let encodedDoneIn: number | null = null;
	const renderStart = Date.now();
	const tmpdir = tmpDir('pre-encode');
	const parallelEncoding = canUseParallelEncoding(codec);

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
			preStitcher = await spawnFfmpeg({
				width: composition.width * (scale ?? 1),
				height: composition.height * (scale ?? 1),
				fps: composition.fps,
				outputLocation: preEncodedFileLocation,
				force: true,
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
				internalOptions: {
					parallelEncoding,
					preEncodedFileLocation: null,
				},
				assetsInfo: null,
			});
			stitcherFfmpeg = preStitcher.task;
		}

		const {
			waitForRightTimeOfFrameToBeInserted,
			setFrameToStitch,
			waitForFinish,
		} = ensureFramesInOrder(
			getRealFrameRange(composition.durationInFrames, frameRange ?? null)
		);

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
			imageFormat: imageFormat ?? 'jpeg',
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
		});
		if (stitcherFfmpeg) {
			await waitForFinish();
			stitcherFfmpeg?.stdin?.end();
			await stitcherFfmpeg;
			preStitcher?.cleanup?.();
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
				parallelEncoding: false,
				preEncodedFileLocation,
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
		encodedFrames = composition.durationInFrames;
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
