import {ExecaChildProcess} from 'execa';
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
	TCompMetadata,
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
	composition: TCompMetadata;
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
	...options
}: RenderMediaOptions) => {
	Internals.validateQuality(quality);
	if (typeof crf !== 'undefined') {
		Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	}

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
	const parallelEncoding = !Internals.isAudioCodec(codec);
	const preEncodedFileLocation = parallelEncoding
		? path.join(
				tmpdir,
				'pre-encode.' + getFileExtensionFromCodec(codec, 'chunk')
		  )
		: null;

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
				width: composition.width,
				height: composition.height,
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
				verbose: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
				parallelEncoding,
				ffmpegExecutable,
				assetsInfo: null,
			});
			stitcherFfmpeg = preStitcher.task;
		}

		let frameToStitch =
			typeof frameRange === 'number'
				? frameRange
				: frameRange === null || frameRange === undefined
				? 0
				: frameRange[0];

		let lastFrame = 0;

		const waitForRightTimeOfFrameToBeInserted = async (frameToBe: number) => {
			return new Promise<void>((resolve) => {
				if (frameToStitch === frameToBe) {
					resolve();
					return;
				}

				const interval = setInterval(() => {
					if (frameToStitch === frameToBe) {
						resolve();
						clearInterval(interval);
					}
				}, 10);
			});
		};

		const {assetsInfo} = await renderFrames({
			config: composition,
			onFrameUpdate: (frame: number) => {
				renderedFrames = frame;
				callUpdate();
			},
			parallelism,
			outputDir: null,
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
			writeFrame: async (buffer, frame) => {
				lastFrame = Math.max(lastFrame, frame);
				await waitForRightTimeOfFrameToBeInserted(frame);
				stitcherFfmpeg?.stdin?.write(buffer);
				frameToStitch = frame + 1;
			},
			serveUrl,
			dumpBrowserLogs,
			onBrowserLog,
			onDownload,
		});
		if (stitcherFfmpeg) {
			await waitForRightTimeOfFrameToBeInserted(lastFrame + 1);
			stitcherFfmpeg?.stdin?.end();
			await stitcherFfmpeg;
			preStitcher?.cleanup?.();
		}

		renderedDoneIn = Date.now() - renderStart;
		callUpdate();

		const dirName = path.dirname(outputLocation);

		if (!fs.existsSync(dirName)) {
			fs.mkdirSync(dirName, {
				recursive: true,
			});
		}

		const stitchStart = Date.now();
		await stitchFramesToVideo({
			width: composition.width,
			height: composition.height,
			fps: composition.fps,
			outputLocation,
			preEncodedFileLocation,
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
			verbose: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
			parallelEncoding: false,
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
