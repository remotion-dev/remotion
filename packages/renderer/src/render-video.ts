import {ExecaChildProcess} from 'execa';
import fs from 'fs';
import path from 'path';
import type {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {
	Browser,
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

export type RenderVideoOnDownload = (src: string) => void;

export type StitchingState = 'encoding' | 'muxing';

export type RenderVideoOnProgress = (progress: {
	renderedFrames: number;
	encodedFrames: number;
	encodedDoneIn: number | null;
	renderedDoneIn: number | null;
	stitchStage: StitchingState;
}) => void;

export type RenderVideoOptions = {
	proResProfile: ProResProfile | undefined;
	parallelism: number | null;
	parallelEncoding: boolean;
	crf: number | null;
	outputDir: string;
	config: TCompMetadata;
	imageFormat: 'png' | 'jpeg' | 'none';
	ffmpegExecutable: FfmpegExecutable;
	inputProps: object;
	pixelFormat: PixelFormat;
	codec: Codec;
	envVariables: Record<string, string>;
	quality: number | undefined;
	frameRange: FrameRange | null;
	browser: Browser;
	serveUrl: string;
	openedBrowser: PuppeteerBrowser;
	overwrite: boolean;
	absoluteOutputFile: string;
	onProgress?: RenderVideoOnProgress;
	shouldOutputImageSequence: boolean;
	fileExtension: string | null;
	bundled: string;
	onDownload: (src: string) => void;
};

export const renderVideo = async ({
	parallelism,
	proResProfile,
	parallelEncoding,
	crf,
	outputDir,
	config,
	imageFormat,
	ffmpegExecutable,
	inputProps,
	pixelFormat,
	codec,
	envVariables,
	quality,
	frameRange,
	browser,
	serveUrl,
	openedBrowser,
	absoluteOutputFile,
	onProgress,
	overwrite,
	shouldOutputImageSequence,
	fileExtension,
	bundled,
	onDownload,
}: RenderVideoOptions) => {
	let stitchStage: StitchingState = 'encoding';
	let stitcherFfmpeg: ExecaChildProcess<string> | undefined;
	let preStitcher;
	let encodedFrames = 0;
	let renderedFrames = 0;
	let preEncodedFileLocation: string | undefined;
	let renderedDoneIn: number | null = null;
	let encodedDoneIn: number | null = null;
	const renderStart = Date.now();

	const callUpdate = () => {
		onProgress?.({
			encodedDoneIn,
			encodedFrames,
			renderedDoneIn,
			renderedFrames,
			stitchStage,
		});
	};

	if (parallelEncoding) {
		if (typeof crf !== 'number') {
			throw new TypeError('CRF is unexpectedly not a number');
		}

		preEncodedFileLocation = path.join(
			outputDir,
			'pre-encode.' + fileExtension
		);

		preStitcher = await spawnFfmpeg({
			dir: outputDir,
			width: config.width,
			height: config.height,
			fps: config.fps,
			outputLocation: preEncodedFileLocation,
			force: true,
			imageFormat,
			pixelFormat,
			codec,
			proResProfile,
			crf,
			parallelism,
			onProgress: (frame: number) => {
				encodedFrames = frame;
				callUpdate();
			},
			verbose: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
			parallelEncoding,
			webpackBundle: bundled,
			ffmpegExecutable,
			assetsInfo: {assets: []},
		});
		stitcherFfmpeg = preStitcher.task;
	}

	const renderer = renderFrames({
		config,
		onFrameUpdate: (frame: number) => {
			renderedFrames = frame;
			callUpdate();
		},
		parallelism,
		parallelEncoding,
		outputDir,
		onStart: () => {
			renderedFrames = 0;
			callUpdate();
		},
		inputProps,
		envVariables,
		imageFormat,
		quality,
		browser,
		frameRange: frameRange ?? null,
		puppeteerInstance: openedBrowser,
		writeFrame: async (buffer) => {
			stitcherFfmpeg?.stdin?.write(buffer);
		},
		serveUrl,
	});
	const {assetsInfo} = await renderer;
	if (stitcherFfmpeg) {
		stitcherFfmpeg?.stdin?.end();
		await stitcherFfmpeg;
		preStitcher?.cleanup?.();
	}

	const closeBrowserPromise = openedBrowser.close();
	renderedDoneIn = Date.now() - renderStart;
	callUpdate();

	if (shouldOutputImageSequence) {
		return;
	}

	if (typeof crf !== 'number') {
		throw new TypeError('CRF is unexpectedly not a number');
	}

	const dirName = path.dirname(absoluteOutputFile);

	if (!fs.existsSync(dirName)) {
		fs.mkdirSync(dirName, {
			recursive: true,
		});
	}

	const stitchStart = Date.now();
	await stitchFramesToVideo({
		dir: outputDir,
		width: config.width,
		height: config.height,
		fps: config.fps,
		outputLocation: absoluteOutputFile,
		preEncodedFileLocation,
		force: overwrite,
		imageFormat,
		pixelFormat,
		codec,
		proResProfile,
		crf,
		assetsInfo,
		parallelism,
		ffmpegExecutable,
		onProgress: (frame: number) => {
			stitchStage = 'muxing';
			encodedFrames = frame;
			callUpdate();
		},
		// TODO: Optimization, Now can download before!
		onDownload,
		webpackBundle: bundled,
		verbose: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
	});
	encodedFrames = config.durationInFrames;
	encodedDoneIn = Date.now() - stitchStart;
	callUpdate();
	await closeBrowserPromise;
};
