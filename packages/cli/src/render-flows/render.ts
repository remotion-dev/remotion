import type {
	Browser,
	BrowserExecutable,
	CancelSignal,
	ChromiumOptions,
	Codec,
	FfmpegExecutable,
	FrameRange,
	ImageFormat,
	LogLevel,
	RenderMediaOnDownload,
	StitchingState,
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
import {ConfigInternals} from '../config';
import {
	getAndValidateAbsoluteOutputFile,
	validateFfmpegCanUseCodec,
} from '../get-cli-options';
import {getCompositionWithDimensionOverride} from '../get-composition-with-dimension-override';
import {getOutputFilename} from '../get-filename';
import {getFinalOutputCodec} from '../get-final-output-codec';
import {getRenderMediaOptions} from '../get-render-media-options';
import {getImageFormat} from '../image-formats';
import {INDENT_TOKEN, Log} from '../log';
import {parsedCli} from '../parse-command-line';
import type {JobProgressCallback} from '../preview-server/render-queue/job';
import type {DownloadProgress} from '../progress-bar';
import {
	createOverwriteableCliOutput,
	makeRenderingAndStitchingProgress,
} from '../progress-bar';
import {bundleOnCliOrTakeServeUrl} from '../setup-cache';
import type {RenderStep} from '../step';
import {truthy} from '../truthy';
import {getUserPassedOutputLocation} from '../user-passed-output-location';
export const renderCompFlow = async ({
	remotionRoot,
	fullEntryPoint,
	ffmpegExecutable,
	ffprobeExecutable,
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
	configFileImageFormat,
	outputLocationFromUI,
	quality,
	onProgress,
	addCleanupCallback,
	uiCodec,
	uiImageFormat,
	cancelSignal,
}: {
	remotionRoot: string;
	fullEntryPoint: string;
	entryPointReason: string;
	browserExecutable: BrowserExecutable;
	chromiumOptions: ChromiumOptions;
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
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
	configFileImageFormat: ImageFormat | undefined;
	quality: number | undefined;
	onProgress: JobProgressCallback;
	addCleanupCallback: (cb: () => Promise<void>) => void;
	uiCodec: Codec | null;
	uiImageFormat: ImageFormat | null;
	cancelSignal: CancelSignal | null;
}) => {
	const downloads: DownloadProgress[] = [];
	const downloadMap = RenderInternals.makeDownloadMap();
	addCleanupCallback(() => RenderInternals.cleanDownloadMap(downloadMap));

	const ffmpegVersion = await RenderInternals.getFfmpegVersion({
		ffmpegExecutable,
		remotionRoot,
	});
	Log.verboseAdvanced(
		{indent, logLevel},
		'FFMPEG Version:',
		ffmpegVersion ? ffmpegVersion.join('.') : 'Built from source'
	);
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
	addCleanupCallback(cleanupBundle);

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

	await validateFfmpegCanUseCodec(codec, remotionRoot);

	RenderInternals.validateEvenDimensionsWithCodec({
		width: config.width,
		height: config.height,
		codec,
		scale,
	});

	const relativeOutputLocation = getOutputFilename({
		codec,
		imageSequence: shouldOutputImageSequence,
		compositionName: compositionId,
		defaultExtension: RenderInternals.getFileExtensionFromCodec(codec),
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

	const updateRenderProgress = () => {
		if (totalFrames.length === 0) {
			throw new Error('totalFrames should not be 0');
		}

		const {output, message, progress} = makeRenderingAndStitchingProgress(
			{
				rendering: {
					frames: renderedFrames,
					totalFrames: totalFrames.length,
					concurrency: RenderInternals.getActualConcurrency(concurrency),
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
			},
			indent
		);
		onProgress({progress, message});

		return renderProgress.update(output);
	};

	const imageFormat = getImageFormat({
		codec: shouldOutputImageSequence ? undefined : codec,
		configFileImageFormat,
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
			config,
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
			concurrency,
			puppeteerInstance,
			quality,
			timeoutInMilliseconds: puppeteerTimeout,
			chromiumOptions,
			scale,
			ffmpegExecutable,
			ffprobeExecutable,
			browserExecutable,
			port,
			downloadMap,
		});

		updateRenderProgress();
		Log.infoAdvanced({indent, logLevel}, chalk.cyan(`▶ ${absoluteOutputFile}`));
	}

	const options = await getRenderMediaOptions({
		config,
		outputLocation: absoluteOutputFile,
		serveUrl: urlOrBundle,
		codec,
		remotionRoot,
	});

	await renderMedia({
		...options,
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
		downloadMap,
		cancelSignal: cancelSignal ?? undefined,
		onSlowestFrames: (slowestFrames) => {
			Log.verboseAdvanced({indent, logLevel});
			Log.verboseAdvanced({indent, logLevel}, `Slowest frames:`);
			slowestFrames.forEach(({frame, time}) => {
				Log.verboseAdvanced(
					{indent, logLevel},
					`Frame ${frame} (${time.toFixed(3)}ms)`
				);
			});
		},
		printLog: (...str) => Log.verboseAdvanced({indent, logLevel}, ...str),
	});

	Log.infoAdvanced({indent, logLevel});
	Log.infoAdvanced({indent, logLevel}, chalk.cyan(`▶ ${absoluteOutputFile}`));

	for (const line of RenderInternals.perf.getPerf()) {
		Log.verboseAdvanced({indent, logLevel}, line);
	}
};
