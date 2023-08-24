import type {
	AudioCodec,
	Browser,
	BrowserExecutable,
	CancelSignal,
	ChromiumOptions,
	Codec,
	Crf,
	FfmpegOverrideFn,
	FrameRange,
	LogLevel,
	PixelFormat,
	ProResProfile,
	RenderMediaOnDownload,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs, {existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Internals} from 'remotion';
import {chalk} from '../chalk';
import {ConfigInternals} from '../config';
import type {Loop} from '../config/number-of-gif-loops';
import {getAndValidateAbsoluteOutputFile} from '../get-cli-options';
import {getCompositionWithDimensionOverride} from '../get-composition-with-dimension-override';
import {getOutputFilename} from '../get-filename';
import {getFinalOutputCodec} from '../get-final-output-codec';
import {getVideoImageFormat} from '../image-formats';
import {Log} from '../log';
import {makeOnDownload} from '../make-on-download';
import {parsedCli} from '../parse-command-line';
import type {JobProgressCallback} from '../preview-server/render-queue/job';
import type {BundlingState, CopyingState} from '../progress-bar';
import {
	createOverwriteableCliOutput,
	makeRenderingAndStitchingProgress,
} from '../progress-bar';
import type {
	AggregateRenderProgress,
	DownloadProgress,
	RenderingProgressInput,
	StitchingProgressInput,
} from '../progress-types';
import {bundleOnCliOrTakeServeUrl} from '../setup-cache';
import {shouldUseNonOverlayingLogger} from '../should-use-non-overlaying-logger';
import type {RenderStep} from '../step';
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
	numberOfGifLoops,
	audioCodec,
	serializedInputPropsWithCustomSchema,
	disallowParallelEncoding,
	offthreadVideoCacheSizeInBytes,
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
	remainingArgs: string[];
	compositionIdFromUi: string | null;
	outputLocationFromUI: string | null;
	overwrite: boolean;
	quiet: boolean;
	concurrency: number | string | null;
	frameRange: FrameRange | null;
	everyNthFrame: number;
	jpegQuality: number | undefined;
	onProgress: JobProgressCallback;
	addCleanupCallback: (cb: () => void) => void;
	crf: Crf | null;
	cancelSignal: CancelSignal | null;
	uiCodec: Codec | null;
	uiImageFormat: VideoImageFormat | null;
	ffmpegOverride: FfmpegOverrideFn;
	audioBitrate: string | null;
	videoBitrate: string | null;
	muted: boolean;
	enforceAudioTrack: boolean;
	proResProfile: ProResProfile | undefined;
	x264Preset: X264Preset | undefined;
	pixelFormat: PixelFormat;
	numberOfGifLoops: Loop;
	audioCodec: AudioCodec | null;
	disallowParallelEncoding: boolean;
	offthreadVideoCacheSizeInBytes: number | null;
}) => {
	const downloads: DownloadProgress[] = [];

	if (browserExecutable) {
		Log.verboseAdvanced(
			{indent, logLevel},
			'Browser executable: ',
			browserExecutable,
		);
	}

	const browserInstance = RenderInternals.internalOpenBrowser({
		browser,
		browserExecutable,
		chromiumOptions,
		forceDeviceScaleFactor: scale,
		indent,
		viewport: null,
		logLevel,
	});

	const updatesDontOverwrite = shouldUseNonOverlayingLogger({logLevel});
	const renderProgress = createOverwriteableCliOutput({
		quiet,
		cancelSignal,
		updatesDontOverwrite,
		indent,
	});

	const steps: RenderStep[] = [
		RenderInternals.isServeUrl(fullEntryPoint) ? null : ('bundling' as const),
		'rendering' as const,
		shouldOutputImageSequence ? null : ('stitching' as const),
	].filter(truthy);

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
		};

		const {output, message, progress} = makeRenderingAndStitchingProgress({
			prog: aggregateRenderProgress,
			steps: steps.length,
			stitchingStep: steps.indexOf('stitching'),
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
			bundlingStep: steps.indexOf('bundling'),
			steps: steps.length,
			onDirectoryCreated: (dir) => {
				addCleanupCallback(() => RenderInternals.deleteDirectory(dir));
			},
			quietProgress: updatesDontOverwrite,
		},
	);

	addCleanupCallback(() => cleanupBundle());

	const onDownload: RenderMediaOnDownload = makeOnDownload({
		downloads,
		indent,
		logLevel,
		updateRenderProgress,
		updatesDontOverwrite,
	});

	const puppeteerInstance = await browserInstance;
	addCleanupCallback(() => puppeteerInstance.close(false, logLevel, indent));

	const actualConcurrency = RenderInternals.getActualConcurrency(concurrency);
	const server = await RenderInternals.prepareServer({
		concurrency: actualConcurrency,
		indent,
		port,
		remotionRoot,
		logLevel,
		webpackConfigOrServeUrl: urlOrBundle,
		offthreadVideoCacheSizeInBytes,
	});

	addCleanupCallback(() => server.closeServer(false));

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
		});

	const {codec, reason: codecReason} = getFinalOutputCodec({
		cliFlag: parsedCli.codec,
		configFile: ConfigInternals.getOutputCodecOrUndefined() ?? null,
		downloadName: null,
		outName: getUserPassedOutputLocation(
			argsAfterComposition,
			outputLocationFromUI,
		),
		uiCodec,
	});

	RenderInternals.validateEvenDimensionsWithCodec({
		width: config.width,
		height: config.height,
		codec,
		scale,
	});

	const relativeOutputLocation = getOutputFilename({
		imageSequence: shouldOutputImageSequence,
		compositionName: compositionId,
		defaultExtension: RenderInternals.getFileExtensionFromCodec(
			codec,
			audioCodec,
		),
		args: argsAfterComposition,
		indent,
		fromUi: outputLocationFromUI,
		logLevel,
	});

	Log.verboseAdvanced(
		{indent, logLevel},
		chalk.gray(`Entry point = ${fullEntryPoint} (${entryPointReason})`),
	);
	Log.infoAdvanced(
		{indent, logLevel},
		chalk.gray(
			`Composition = ${compositionId} (${reason}), Codec = ${codec} (${codecReason}), Output = ${relativeOutputLocation}`,
		),
	);

	const absoluteOutputFile = getAndValidateAbsoluteOutputFile(
		relativeOutputLocation,
		overwrite,
	);
	const exists = existsSync(absoluteOutputFile);

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
		concurrency: actualConcurrency,
		doneIn: null,
		steps,
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

		Log.verboseAdvanced({indent, logLevel}, 'Output dir', outputDir);

		await RenderInternals.internalRenderFrames({
			imageFormat,
			serializedInputPropsWithCustomSchema,
			onFrameUpdate: (rendered) => {
				(renderingProgress as RenderingProgressInput).frames = rendered;
				updateRenderProgress({newline: false, printToConsole: true});
			},
			onStart: () => undefined,
			onDownload,
			cancelSignal: cancelSignal ?? undefined,
			outputDir,
			webpackBundleOrServeUrl: urlOrBundle,
			everyNthFrame,
			envVariables,
			frameRange,
			concurrency: actualConcurrency,
			puppeteerInstance,
			jpegQuality: jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
			timeoutInMilliseconds: puppeteerTimeout,
			chromiumOptions,
			scale,
			browserExecutable,
			port,
			composition: config,
			server: await server,
			indent,
			muted,
			onBrowserLog: null,
			onFrameBuffer: null,
			logLevel,
			serializedResolvedPropsWithCustomSchema: Internals.serializeJSONWithDate({
				indent: undefined,
				staticBase: null,
				data: config.props,
			}).serializedString,
			offthreadVideoCacheSizeInBytes,
		});

		updateRenderProgress({newline: true, printToConsole: true});
		Log.infoAdvanced(
			{indent, logLevel},
			chalk.blue(`▶ ${absoluteOutputFile}`),
		);
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
		x264Preset,
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
			updateRenderProgress({newline: false, printToConsole: true});
		},
		puppeteerInstance,
		onDownload,
		onCtrlCExit: addCleanupCallback,
		indent,
		server: await server,
		cancelSignal: cancelSignal ?? undefined,
		audioCodec,
		preferLossless: false,
		imageFormat,
		disallowParallelEncoding,
		onBrowserLog: null,
		onStart: () => undefined,
		serializedResolvedPropsWithCustomSchema: Internals.serializeJSONWithDate({
			data: config.props,
			indent: undefined,
			staticBase: null,
		}).serializedString,
		offthreadVideoCacheSizeInBytes,
	});

	updateRenderProgress({newline: true, printToConsole: true});
	Log.infoAdvanced(
		{indent, logLevel},
		chalk.blue(`${exists ? '○' : '+'} ${absoluteOutputFile}`),
	);

	Log.verboseAdvanced({indent, logLevel}, `Slowest frames:`);
	slowestFrames.forEach(({frame, time}) => {
		Log.verboseAdvanced(
			{indent, logLevel},
			`  Frame ${frame} (${time.toFixed(3)}ms)`,
		);
	});

	for (const line of RenderInternals.perf.getPerf()) {
		Log.verboseAdvanced({indent, logLevel}, line);
	}
};
