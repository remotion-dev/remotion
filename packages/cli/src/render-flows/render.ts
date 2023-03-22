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
	StitchingState,
	VideoImageFormat,
} from '@remotion/renderer';
import {
	getCompositions,
	openBrowser,
	renderFrames,
	RenderInternals,
	renderMedia,
} from '@remotion/renderer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {chalk} from '../chalk';
import {registerCleanupJob} from '../cleanup-before-quit';
import {ConfigInternals} from '../config';
import type {Loop} from '../config/number-of-gif-loops';
import {getAndValidateAbsoluteOutputFile} from '../get-cli-options';
import {getCompositionWithDimensionOverride} from '../get-composition-with-dimension-override';
import {getOutputFilename} from '../get-filename';
import {getFinalOutputCodec} from '../get-final-output-codec';
import {getVideoImageFormat} from '../image-formats';
import {INDENT_TOKEN, Log} from '../log';
import {parsedCli} from '../parse-command-line';
import type {
	GuiRenderProgress,
	JobProgressCallback,
} from '../preview-server/render-queue/job';
import {
	createOverwriteableCliOutput,
	makeRenderingAndStitchingProgress,
} from '../progress-bar';
import type {
	AggregateRenderProgress,
	DownloadProgress,
} from '../progress-types';
import {bundleOnCliOrTakeServeUrl} from '../setup-cache';
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
	inputProps,
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
	quality,
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
	pixelFormat,
	videoBitrate,
	numberOfGifLoops,
	audioCodec,
	disallowParallelEncoding,
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
	inputProps: object;
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
	quality: number | undefined;
	onProgress: JobProgressCallback<GuiRenderProgress>;
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
	pixelFormat: PixelFormat;
	numberOfGifLoops: Loop;
	audioCodec: AudioCodec | null;
	disallowParallelEncoding: boolean;
}) => {
	const downloads: DownloadProgress[] = [];
	const downloadMap = RenderInternals.makeDownloadMap();
	addCleanupCallback(() => RenderInternals.cleanDownloadMap(downloadMap));
	registerCleanupJob(() => RenderInternals.cleanDownloadMap(downloadMap));

	Log.verboseAdvanced(
		{indent, logLevel},
		'Browser executable: ',
		browserExecutable
	);

	Log.verboseAdvanced({indent, logLevel}, 'Asset dirs', downloadMap.assetDir);

	const browserInstance = openBrowser(browser, {
		browserExecutable,
		shouldDumpIo: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose'),
		chromiumOptions,
		forceDeviceScaleFactor: scale,
		indentationString: indent ? INDENT_TOKEN + ' ' : '',
	});

	const steps: RenderStep[] = [
		RenderInternals.isServeUrl(fullEntryPoint) ? null : ('bundling' as const),
		'rendering' as const,
		shouldOutputImageSequence ? null : ('stitching' as const),
	].filter(truthy);

	const {urlOrBundle, cleanup: cleanupBundle} = await bundleOnCliOrTakeServeUrl(
		{
			fullPath: fullEntryPoint,
			remotionRoot,
			steps,
			publicDir,
			// TODO: Implement onProgress
			onProgress: () => undefined,
			indentOutput: indent,
			logLevel,
		}
	);

	registerCleanupJob(() => cleanupBundle());
	addCleanupCallback(() => cleanupBundle());

	const onDownload: RenderMediaOnDownload = (src) => {
		const id = Math.random();
		const download: DownloadProgress = {
			id,
			name: src,
			progress: 0,
			downloaded: 0,
			totalBytes: null,
		};
		downloads.push(download);
		updateRenderProgress();
		return ({percent, downloaded, totalSize}) => {
			download.progress = percent;
			download.totalBytes = totalSize;
			download.downloaded = downloaded;
			updateRenderProgress();
		};
	};

	const puppeteerInstance = await browserInstance;
	registerCleanupJob(() => puppeteerInstance.close(false));
	addCleanupCallback(() => puppeteerInstance.close(false));

	const comps = await getCompositions(urlOrBundle, {
		inputProps,
		puppeteerInstance,
		envVariables,
		timeoutInMilliseconds: puppeteerTimeout,
		chromiumOptions,
		browserExecutable,
		downloadMap,
		port,
	});

	const {compositionId, config, reason, argsAfterComposition} =
		await getCompositionWithDimensionOverride({
			validCompositions: comps,
			height,
			width,
			args: remainingArgs,
			compositionIdFromUi,
		});

	const {codec, reason: codecReason} = getFinalOutputCodec({
		cliFlag: parsedCli.codec,
		configFile: ConfigInternals.getOutputCodecOrUndefined() ?? null,
		downloadName: null,
		outName: getUserPassedOutputLocation(argsAfterComposition),
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
			audioCodec
		),
		args: argsAfterComposition,
		indent,
		fromUi: outputLocationFromUI,
		logLevel,
	});

	Log.infoAdvanced(
		{indent, logLevel},
		chalk.gray(
			`Entry point = ${fullEntryPoint} (${entryPointReason}), Composition = ${compositionId} (${reason}), Codec = ${codec} (${codecReason}), Output = ${relativeOutputLocation}`
		)
	);

	const absoluteOutputFile = getAndValidateAbsoluteOutputFile(
		relativeOutputLocation,
		overwrite
	);

	const outputDir = shouldOutputImageSequence
		? absoluteOutputFile
		: await fs.promises.mkdtemp(path.join(os.tmpdir(), 'react-motion-render'));

	Log.verboseAdvanced({indent, logLevel}, 'Output dir', outputDir);

	const renderProgress = createOverwriteableCliOutput({
		quiet,
		cancelSignal,
	});

	const realFrameRange = RenderInternals.getRealFrameRange(
		config.durationInFrames,
		frameRange
	);
	const totalFrames: number[] = RenderInternals.getFramesToRender(
		realFrameRange,
		everyNthFrame
	);
	let encodedFrames = 0;
	let renderedFrames = 0;
	let encodedDoneIn: number | null = null;
	let renderedDoneIn: number | null = null;
	let stitchStage: StitchingState = 'encoding';

	const actualConcurrency = RenderInternals.getActualConcurrency(concurrency);

	const updateRenderProgress = () => {
		if (totalFrames.length === 0) {
			throw new Error('totalFrames should not be 0');
		}

		const aggregateRenderProgress: AggregateRenderProgress = {
			rendering: {
				frames: renderedFrames,
				totalFrames: totalFrames.length,
				concurrency: actualConcurrency,
				doneIn: renderedDoneIn,
				steps,
			},
			stitching: shouldOutputImageSequence
				? null
				: {
						doneIn: encodedDoneIn,
						frames: encodedFrames,
						stage: stitchStage,
						steps,
						totalFrames: totalFrames.length,
						codec,
				  },
			downloads,
			bundling: {
				message: 'Bundled',
				progress: 1,
			},
		};

		const {output, message, progress} = makeRenderingAndStitchingProgress(
			aggregateRenderProgress,
			indent
		);
		onProgress({message, value: progress, ...aggregateRenderProgress});

		return renderProgress.update(output);
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
				`Cannot render an image sequence with a codec that renders no images. codec = ${codec}, imageFormat = ${imageFormat}`
			);
		}

		await renderFrames({
			imageFormat,
			inputProps,
			onFrameUpdate: (rendered) => {
				renderedFrames = rendered;
				updateRenderProgress();
			},
			onStart: () => undefined,
			onDownload: (src: string) => {
				if (src.startsWith('data:')) {
					Log.infoAdvanced(
						{indent, logLevel},

						'\nWriting Data URL to file: ',
						src.substring(0, 30) + '...'
					);
				} else {
					Log.infoAdvanced({indent, logLevel}, '\nDownloading asset... ', src);
				}
			},
			cancelSignal: cancelSignal ?? undefined,
			outputDir,
			serveUrl: urlOrBundle,
			dumpBrowserLogs: RenderInternals.isEqualOrBelowLogLevel(
				logLevel,
				'verbose'
			),
			everyNthFrame,
			envVariables,
			frameRange,
			concurrency: actualConcurrency,
			puppeteerInstance,
			quality,
			timeoutInMilliseconds: puppeteerTimeout,
			chromiumOptions,
			scale,
			browserExecutable,
			port,
			downloadMap,
			composition: config,
		});

		updateRenderProgress();
		process.stdout.write('\n');
		Log.infoAdvanced({indent, logLevel}, chalk.cyan(`▶ ${absoluteOutputFile}`));
	}

	const {slowestFrames} = await renderMedia({
		outputLocation: absoluteOutputFile,
		composition: {
			...config,
			width: width ?? config.width,
			height: height ?? config.height,
		},
		crf,
		envVariables,
		frameRange,
		inputProps,
		overwrite,
		pixelFormat,
		proResProfile,
		quality,
		dumpBrowserLogs: RenderInternals.isEqualOrBelowLogLevel(
			logLevel,
			'verbose'
		),
		chromiumOptions,
		timeoutInMilliseconds: ConfigInternals.getCurrentPuppeteerTimeout(),
		scale,
		port,
		numberOfGifLoops,
		everyNthFrame,
		verbose: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose'),
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
			encodedDoneIn = update.encodedDoneIn;
			encodedFrames = update.encodedFrames;
			renderedDoneIn = update.renderedDoneIn;
			stitchStage = update.stitchStage;
			renderedFrames = update.renderedFrames;
			updateRenderProgress();
		},
		puppeteerInstance,
		onDownload,
		internal: {
			onCtrlCExit: registerCleanupJob,
			downloadMap,
		},
		cancelSignal: cancelSignal ?? undefined,
		printLog: (...str) => Log.verboseAdvanced({indent, logLevel}, ...str),
		audioCodec,
		preferLossless: false,
		imageFormat,
		disallowParallelEncoding,
	});

	Log.verboseAdvanced({indent, logLevel});
	Log.verboseAdvanced({indent, logLevel}, `Slowest frames:`);
	slowestFrames.forEach(({frame, time}) => {
		Log.verboseAdvanced(
			{indent, logLevel},
			`Frame ${frame} (${time.toFixed(3)}ms)`
		);
	});

	updateRenderProgress();
	process.stdout.write('\n');
	Log.infoAdvanced({indent, logLevel}, chalk.cyan(`▶ ${absoluteOutputFile}`));

	for (const line of RenderInternals.perf.getPerf()) {
		Log.verboseAdvanced({indent, logLevel}, line);
	}
};
