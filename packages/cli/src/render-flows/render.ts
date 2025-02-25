import type {
	AudioCodec,
	Browser,
	BrowserExecutable,
	CancelSignal,
	ChromeMode,
	ChromiumOptions,
	Codec,
	ColorSpace,
	Crf,
	FfmpegOverrideFn,
	FrameRange,
	LogLevel,
	NumberOfGifLoops,
	PixelFormat,
	ProResProfile,
	RenderMediaOnDownload,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {HardwareAccelerationOption} from '@remotion/renderer/client';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {
	AggregateRenderProgress,
	BundlingState,
	CopyingState,
	DownloadProgress,
	JobProgressCallback,
	RenderingProgressInput,
	StitchingProgressInput,
} from '@remotion/studio-server';
import {formatBytes, type ArtifactProgress} from '@remotion/studio-shared';
import fs, {existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {NoReactInternals} from 'remotion/no-react';
import {defaultBrowserDownloadProgress} from '../browser-download-bar';
import {chalk} from '../chalk';
import {ConfigInternals} from '../config';
import {getAndValidateAbsoluteOutputFile} from '../get-cli-options';
import {getCompositionWithDimensionOverride} from '../get-composition-with-dimension-override';
import {getOutputFilename} from '../get-filename';
import {makeHyperlink} from '../hyperlinks/make-link';
import {getVideoImageFormat} from '../image-formats';
import {Log} from '../log';
import {makeOnDownload} from '../make-on-download';
import {handleOnArtifact} from '../on-artifact';
import {parsedCli, quietFlagProvided} from '../parsed-cli';
import {
	LABEL_WIDTH,
	createOverwriteableCliOutput,
	makeRenderingAndStitchingProgress,
	printFact,
} from '../progress-bar';
import {bundleOnCliOrTakeServeUrl} from '../setup-cache';
import {shouldUseNonOverlayingLogger} from '../should-use-non-overlaying-logger';
import {truthy} from '../truthy';
import {getUserPassedOutputLocation} from '../user-passed-output-location';

export const renderVideoFlow = async ({
	remotionRoot,
	fullEntryPoint,
	indent,
	logLevel,
	browserExecutable,
	browser,
	chromiumOptions,
	scale,
	shouldOutputImageSequence,
	publicDir,
	envVariables,
	puppeteerTimeout,
	port,
	height,
	width,
	remainingArgs,
	compositionIdFromUi,
	entryPointReason,
	overwrite,
	quiet,
	concurrency,
	frameRange,
	everyNthFrame,
	outputLocationFromUI,
	jpegQuality,
	onProgress,
	addCleanupCallback,
	cancelSignal,
	crf,
	uiCodec,
	uiImageFormat,
	ffmpegOverride,
	audioBitrate,
	muted,
	enforceAudioTrack,
	proResProfile,
	x264Preset,
	pixelFormat,
	videoBitrate,
	encodingMaxRate,
	encodingBufferSize,
	numberOfGifLoops,
	audioCodec,
	serializedInputPropsWithCustomSchema,
	disallowParallelEncoding,
	offthreadVideoCacheSizeInBytes,
	offthreadVideoThreads,
	colorSpace,
	repro,
	binariesDirectory,
	forSeamlessAacConcatenation,
	separateAudioTo,
	publicPath,
	metadata,
	hardwareAcceleration,
	chromeMode,
}: {
	remotionRoot: string;
	fullEntryPoint: string;
	entryPointReason: string;
	browserExecutable: BrowserExecutable;
	chromiumOptions: ChromiumOptions;
	logLevel: LogLevel;
	browser: Browser;
	scale: number;
	indent: boolean;
	shouldOutputImageSequence: boolean;
	publicDir: string | null;
	serializedInputPropsWithCustomSchema: string;
	envVariables: Record<string, string>;
	puppeteerTimeout: number;
	port: number | null;
	height: number | null;
	width: number | null;
	remainingArgs: (string | number)[];
	compositionIdFromUi: string | null;
	outputLocationFromUI: string | null;
	overwrite: boolean;
	quiet: boolean;
	concurrency: number | string | null;
	frameRange: FrameRange | null;
	everyNthFrame: number;
	jpegQuality: number | undefined;
	onProgress: JobProgressCallback;
	addCleanupCallback: (label: string, cb: () => void) => void;
	crf: Crf | null;
	cancelSignal: CancelSignal | null;
	uiCodec: Codec | null;
	uiImageFormat: VideoImageFormat | null;
	ffmpegOverride: FfmpegOverrideFn;
	audioBitrate: string | null;
	videoBitrate: string | null;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	muted: boolean;
	enforceAudioTrack: boolean;
	proResProfile: ProResProfile | undefined;
	x264Preset: X264Preset | null;
	pixelFormat: PixelFormat;
	numberOfGifLoops: NumberOfGifLoops;
	audioCodec: AudioCodec | null;
	disallowParallelEncoding: boolean;
	offthreadVideoCacheSizeInBytes: number | null;
	offthreadVideoThreads: number | null;
	colorSpace: ColorSpace | null;
	repro: boolean;
	binariesDirectory: string | null;
	forSeamlessAacConcatenation: boolean;
	separateAudioTo: string | null;
	publicPath: string | null;
	metadata: Record<string, string> | null;
	hardwareAcceleration: HardwareAccelerationOption;
	chromeMode: ChromeMode;
}) => {
	const isVerbose = RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose');

	printFact('verbose')({
		indent,
		logLevel,
		left: 'Entry point',
		right: [fullEntryPoint, isVerbose ? `(${entryPointReason})` : null]
			.filter(truthy)
			.join(' '),
		color: 'gray',
	});
	const downloads: DownloadProgress[] = [];
	const onBrowserDownload = defaultBrowserDownloadProgress({
		indent,
		logLevel,
		quiet: quietFlagProvided(),
	});

	await RenderInternals.internalEnsureBrowser({
		browserExecutable,
		indent,
		logLevel,
		onBrowserDownload,
		chromeMode,
	});

	const browserInstance = RenderInternals.internalOpenBrowser({
		browser,
		browserExecutable,
		chromiumOptions,
		forceDeviceScaleFactor: scale,
		indent,
		viewport: null,
		logLevel,
		onBrowserDownload,
		chromeMode,
	});

	let isUsingParallelEncoding = false;

	const updatesDontOverwrite = shouldUseNonOverlayingLogger({logLevel});
	const renderProgress = createOverwriteableCliOutput({
		quiet,
		cancelSignal,
		updatesDontOverwrite,
		indent,
	});

	let bundlingProgress: BundlingState = {
		doneIn: null,
		progress: 0,
	};

	let renderingProgress: RenderingProgressInput | null = null;
	let stitchingProgress: StitchingProgressInput | null = null;
	let copyingState: CopyingState = {
		bytes: 0,
		doneIn: null,
	};

	let artifactState: ArtifactProgress = {received: []};

	const updateRenderProgress = ({
		newline,
		printToConsole,
	}: {
		newline: boolean;
		printToConsole: boolean;
	}) => {
		const aggregateRenderProgress: AggregateRenderProgress = {
			rendering: renderingProgress,
			stitching: shouldOutputImageSequence ? null : stitchingProgress,
			downloads,
			bundling: bundlingProgress,
			copyingState,
			artifactState,
		};

		const {output, message, progress} = makeRenderingAndStitchingProgress({
			prog: aggregateRenderProgress,
			isUsingParallelEncoding,
		});
		onProgress({message, value: progress, ...aggregateRenderProgress});

		if (printToConsole) {
			renderProgress.update(updatesDontOverwrite ? message : output, newline);
		}
	};

	const {urlOrBundle, cleanup: cleanupBundle} = await bundleOnCliOrTakeServeUrl(
		{
			fullPath: fullEntryPoint,
			remotionRoot,
			publicDir,
			onProgress: ({bundling, copying}) => {
				bundlingProgress = bundling;
				copyingState = copying;
				updateRenderProgress({newline: false, printToConsole: true});
			},
			indentOutput: indent,
			logLevel,
			onDirectoryCreated: (dir) => {
				addCleanupCallback(`Delete ${dir}`, () =>
					RenderInternals.deleteDirectory(dir),
				);
			},
			quietProgress: updatesDontOverwrite,
			quietFlag: quietFlagProvided(),
			outDir: null,
			// Not needed for render
			gitSource: null,
			bufferStateDelayInMilliseconds: null,
			maxTimelineTracks: null,
			publicPath,
		},
	);

	addCleanupCallback(`Cleanup bundle`, () => cleanupBundle());

	const onDownload: RenderMediaOnDownload = makeOnDownload({
		downloads,
		indent,
		logLevel,
		updateRenderProgress,
		updatesDontOverwrite,
		isUsingParallelEncoding,
	});

	const puppeteerInstance = await browserInstance;
	addCleanupCallback(`Closing browser instance`, () =>
		puppeteerInstance.close({silent: false}),
	);

	const resolvedConcurrency = RenderInternals.resolveConcurrency(concurrency);
	const server = await RenderInternals.prepareServer({
		offthreadVideoThreads:
			offthreadVideoThreads ??
			RenderInternals.DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS,
		indent,
		port,
		remotionRoot,
		logLevel,
		webpackConfigOrServeUrl: urlOrBundle,
		offthreadVideoCacheSizeInBytes,
		binariesDirectory,
		forceIPv4: false,
	});

	addCleanupCallback(`Close server`, () => server.closeServer(false));

	const {compositionId, config, reason, argsAfterComposition} =
		await getCompositionWithDimensionOverride({
			height,
			width,
			args: remainingArgs,
			compositionIdFromUi,
			browserExecutable,
			chromiumOptions,
			envVariables,
			indent,
			serializedInputPropsWithCustomSchema,
			port,
			puppeteerInstance,
			serveUrlOrWebpackUrl: urlOrBundle,
			timeoutInMilliseconds: puppeteerTimeout,
			logLevel,
			server,
			offthreadVideoCacheSizeInBytes,
			offthreadVideoThreads,
			binariesDirectory,
			onBrowserDownload,
			chromeMode,
		});

	const {onArtifact} = handleOnArtifact({
		artifactState,
		onProgress: (progress) => {
			artifactState = progress;
			updateRenderProgress({newline: false, printToConsole: true});
		},
		compositionId,
	});

	const {value: codec, source: codecReason} =
		BrowserSafeApis.options.videoCodecOption.getValue(
			{
				commandLine: parsedCli,
			},
			{
				configFile: ConfigInternals.getOutputCodecOrUndefined() ?? null,
				downloadName: null,
				outName: getUserPassedOutputLocation(
					argsAfterComposition,
					outputLocationFromUI,
				),
				uiCodec,
				compositionCodec: config.defaultCodec,
			},
		);

	RenderInternals.validateEvenDimensionsWithCodec({
		width: config.width,
		height: config.height,
		codec,
		scale,
		wantsImageSequence: shouldOutputImageSequence,
		indent,
		logLevel,
	});

	const relativeOutputLocation = getOutputFilename({
		imageSequence: shouldOutputImageSequence,
		compositionName: compositionId,
		compositionDefaultOutName: config.defaultOutName,
		defaultExtension: RenderInternals.getFileExtensionFromCodec(
			codec,
			audioCodec,
		),
		args: argsAfterComposition,
		indent,
		fromUi: outputLocationFromUI,
		logLevel,
	});

	printFact('info')({
		indent,
		logLevel,
		left: 'Composition',
		right: [compositionId, isVerbose ? `(${reason})` : null]
			.filter(truthy)
			.join(' '),
		color: 'gray',
		link: 'https://www.remotion.dev/docs/terminology/composition',
	});
	printFact('info')({
		indent,
		logLevel,
		left: 'Codec',
		link: 'https://www.remotion.dev/docs/encoding',
		right: [codec, isVerbose ? `(${codecReason})` : null]
			.filter(truthy)
			.join(' '),
		color: 'gray',
	});
	printFact('info')({
		indent,
		logLevel,
		left: 'Output',
		right: relativeOutputLocation,
		color: 'gray',
	});
	printFact('info')({
		indent,
		logLevel,
		left: 'Concurrency',
		link: 'https://www.remotion.dev/docs/terminology/concurrency',
		right: `${resolvedConcurrency}x`,
		color: 'gray',
	});

	const absoluteOutputFile = getAndValidateAbsoluteOutputFile(
		relativeOutputLocation,
		overwrite,
		logLevel,
	);

	const absoluteSeparateAudioTo =
		separateAudioTo === null ? null : path.resolve(separateAudioTo);
	const exists = existsSync(absoluteOutputFile);
	const audioExists = absoluteSeparateAudioTo
		? existsSync(absoluteSeparateAudioTo)
		: false;

	const realFrameRange = RenderInternals.getRealFrameRange(
		config.durationInFrames,
		frameRange,
	);
	const totalFrames: number[] = RenderInternals.getFramesToRender(
		realFrameRange,
		everyNthFrame,
	);

	renderingProgress = {
		frames: 0,
		totalFrames: totalFrames.length,
		doneIn: null,
		timeRemainingInMilliseconds: null,
	};

	const imageFormat = getVideoImageFormat({
		codec: shouldOutputImageSequence ? undefined : codec,
		uiImageFormat,
	});

	if (shouldOutputImageSequence) {
		fs.mkdirSync(absoluteOutputFile, {
			recursive: true,
		});
		if (imageFormat === 'none') {
			throw new Error(
				`Cannot render an image sequence with a codec that renders no images. codec = ${codec}, imageFormat = ${imageFormat}`,
			);
		}

		const outputDir = shouldOutputImageSequence
			? absoluteOutputFile
			: await fs.promises.mkdtemp(
					path.join(os.tmpdir(), 'react-motion-render'),
				);

		Log.verbose({indent, logLevel}, 'Output dir', outputDir);

		await RenderInternals.internalRenderFrames({
			imageFormat,
			serializedInputPropsWithCustomSchema,
			onFrameUpdate: (rendered) => {
				(renderingProgress as RenderingProgressInput).frames = rendered;
				updateRenderProgress({newline: false, printToConsole: true});
			},
			onStart: ({parallelEncoding}) => {
				isUsingParallelEncoding = parallelEncoding;
			},
			onDownload,
			cancelSignal: cancelSignal ?? undefined,
			outputDir,
			webpackBundleOrServeUrl: urlOrBundle,
			everyNthFrame,
			envVariables,
			frameRange,
			concurrency: resolvedConcurrency,
			puppeteerInstance,
			jpegQuality: jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
			timeoutInMilliseconds: puppeteerTimeout,
			chromiumOptions,
			scale,
			browserExecutable,
			port,
			composition: config,
			server,
			indent,
			muted,
			onBrowserLog: null,
			onFrameBuffer: null,
			logLevel,
			serializedResolvedPropsWithCustomSchema:
				NoReactInternals.serializeJSONWithDate({
					indent: undefined,
					staticBase: null,
					data: config.props,
				}).serializedString,
			offthreadVideoCacheSizeInBytes,
			offthreadVideoThreads,
			parallelEncodingEnabled: isUsingParallelEncoding,
			binariesDirectory,
			compositionStart: 0,
			forSeamlessAacConcatenation,
			onBrowserDownload,
			onArtifact,
			chromeMode,
		});

		Log.info({indent, logLevel}, chalk.blue(`▶ ${absoluteOutputFile}`));
		return;
	}

	stitchingProgress = {
		doneIn: null,
		frames: 0,
		stage: 'encoding',
		totalFrames: totalFrames.length,
		codec,
	};

	const {slowestFrames} = await RenderInternals.internalRenderMedia({
		outputLocation: absoluteOutputFile,
		composition: {
			...config,
			width: width ?? config.width,
			height: height ?? config.height,
		},
		crf: crf ?? null,
		envVariables,
		frameRange,
		serializedInputPropsWithCustomSchema,
		overwrite,
		pixelFormat,
		proResProfile,
		x264Preset: x264Preset ?? null,
		jpegQuality: jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
		chromiumOptions,
		timeoutInMilliseconds: puppeteerTimeout,
		scale,
		port,
		numberOfGifLoops,
		everyNthFrame,
		logLevel,
		muted,
		enforceAudioTrack,
		browserExecutable,
		ffmpegOverride,
		concurrency,
		serveUrl: urlOrBundle,
		codec,
		audioBitrate,
		videoBitrate,
		encodingMaxRate,
		encodingBufferSize,
		onProgress: (update) => {
			(stitchingProgress as StitchingProgressInput).doneIn =
				update.encodedDoneIn;
			(stitchingProgress as StitchingProgressInput).frames =
				update.encodedFrames;
			(stitchingProgress as StitchingProgressInput).stage = update.stitchStage;
			(renderingProgress as RenderingProgressInput).doneIn =
				update.renderedDoneIn;
			(renderingProgress as RenderingProgressInput).frames =
				update.renderedFrames;
			(
				renderingProgress as RenderingProgressInput
			).timeRemainingInMilliseconds = update.renderEstimatedTime;
			updateRenderProgress({newline: false, printToConsole: true});
		},
		puppeteerInstance,
		onDownload,
		onCtrlCExit: addCleanupCallback,
		indent,
		server,
		cancelSignal: cancelSignal ?? undefined,
		audioCodec,
		preferLossless: false,
		imageFormat,
		disallowParallelEncoding,
		onBrowserLog: null,
		onStart: () => undefined,
		serializedResolvedPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				data: config.props,
				indent: undefined,
				staticBase: null,
			}).serializedString,
		offthreadVideoCacheSizeInBytes,
		offthreadVideoThreads,
		colorSpace,
		repro: repro ?? false,
		binariesDirectory,
		separateAudioTo: absoluteSeparateAudioTo,
		forSeamlessAacConcatenation,
		compositionStart: 0,
		onBrowserDownload,
		onArtifact,
		metadata: metadata ?? null,
		hardwareAcceleration,
		chromeMode,
	});
	if (!updatesDontOverwrite) {
		updateRenderProgress({newline: true, printToConsole: true});
	}

	if (absoluteSeparateAudioTo) {
		const relativeAudio = path.relative(process.cwd(), absoluteSeparateAudioTo);
		const audioSize = fs.statSync(absoluteSeparateAudioTo).size;
		Log.info(
			{indent, logLevel},
			chalk.blue(
				`${(audioExists ? '○' : '+').padEnd(LABEL_WIDTH, ' ')} ${makeHyperlink({url: `file://${absoluteSeparateAudioTo}`, text: relativeAudio, fallback: absoluteSeparateAudioTo})}`,
			),
			chalk.gray(`${formatBytes(audioSize)}`),
		);
	}

	const {size} = fs.statSync(absoluteOutputFile);
	Log.info(
		{indent, logLevel},
		chalk.blue(
			`${(exists ? '○' : '+').padEnd(LABEL_WIDTH)} ${makeHyperlink({url: `file://${absoluteOutputFile}`, text: relativeOutputLocation, fallback: relativeOutputLocation})}`,
		),
		chalk.gray(`${formatBytes(size)}`),
	);

	Log.verbose({indent, logLevel}, `Slowest frames:`);
	slowestFrames.forEach(({frame, time}) => {
		Log.verbose({indent, logLevel}, `  Frame ${frame} (${time.toFixed(3)}ms)`);
	});

	for (const line of RenderInternals.perf.getPerf()) {
		Log.verbose({indent, logLevel}, line);
	}
};
