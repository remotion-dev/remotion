import type {
	Browser,
	BrowserExecutable,
	ChromiumOptions,
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
import {
	getAndValidateAbsoluteOutputFile,
	getFinalCodec,
	validateFfmepgCanUseCodec,
} from '../get-cli-options';
import {getCompositionWithDimensionOverride} from '../get-composition-with-dimension-override';
import {getOutputFilename} from '../get-filename';
import {getRenderMediaOptions} from '../get-render-media-options';
import {getImageFormat} from '../image-formats';
import {INDENT_TOKEN, Log} from '../log';
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
	indentOutput,
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
	quality,
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
	indentOutput: boolean;
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
	overwrite: boolean;
	quiet: boolean;
	concurrency: number | null;
	frameRange: FrameRange | null;
	everyNthFrame: number;
	configFileImageFormat: ImageFormat | undefined;
	quality: number | undefined;
}) => {
	const downloads: DownloadProgress[] = [];
	const downloadMap = RenderInternals.makeDownloadMap();

	const ffmpegVersion = await RenderInternals.getFfmpegVersion({
		ffmpegExecutable,
		remotionRoot,
	});
	Log.verboseAdvanced(
		{indent: indentOutput, logLevel},
		'FFMPEG Version:',
		ffmpegVersion ? ffmpegVersion.join('.') : 'Built from source'
	);
	Log.verboseAdvanced(
		{indent: indentOutput, logLevel},
		'Browser executable: ',
		browserExecutable
	);

	Log.verboseAdvanced(
		{indent: indentOutput, logLevel},
		'Asset dirs',
		downloadMap.assetDir
	);

	const browserInstance = openBrowser(browser, {
		browserExecutable,
		shouldDumpIo: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose'),
		chromiumOptions,
		forceDeviceScaleFactor: scale,
		indentationString: indentOutput ? INDENT_TOKEN + ' ' : '',
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
			indentOutput,
			logLevel,
		}
	);

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

	// TODO: Should use codec from UI if explicitly specified
	const {codec, reason: codecReason} = getFinalCodec({
		downloadName: null,
		outName: getUserPassedOutputLocation(argsAfterComposition),
	});

	validateFfmepgCanUseCodec(codec, remotionRoot);

	RenderInternals.validateEvenDimensionsWithCodec({
		width: config.width,
		height: config.height,
		codec,
		scale,
	});

	// TODO: Should use output location from UI if explicitly specified
	const relativeOutputLocation = getOutputFilename({
		codec,
		imageSequence: shouldOutputImageSequence,
		compositionName: compositionId,
		defaultExtension: RenderInternals.getFileExtensionFromCodec(codec, 'final'),
		args: argsAfterComposition,
	});

	Log.infoAdvanced(
		{indent: indentOutput, logLevel},
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

	Log.verboseAdvanced(
		{indent: indentOutput, logLevel},
		'Output dir',
		outputDir
	);

	const renderProgress = createOverwriteableCliOutput({
		quiet,
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

		const {output} = makeRenderingAndStitchingProgress(
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
			indentOutput
		);
		return renderProgress.update(output);
	};

	const imageFormat = getImageFormat(
		shouldOutputImageSequence ? undefined : codec,
		configFileImageFormat
	);

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
						{indent: indentOutput, logLevel},

						'\nWriting Data URL to file: ',
						src.substring(0, 30) + '...'
					);
				} else {
					Log.infoAdvanced(
						{indent: indentOutput, logLevel},
						'\nDownloading asset... ',
						src
					);
				}
			},
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
		Log.infoAdvanced({indent: indentOutput, logLevel});
		Log.infoAdvanced(
			{indent: indentOutput, logLevel},
			chalk.cyan(`▶ ${absoluteOutputFile}`)
		);
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
		onSlowestFrames: (slowestFrames) => {
			Log.verboseAdvanced({indent: indentOutput, logLevel});
			Log.verboseAdvanced({indent: indentOutput, logLevel}, `Slowest frames:`);
			slowestFrames.forEach(({frame, time}) => {
				Log.verboseAdvanced(
					{indent: indentOutput, logLevel},
					`Frame ${frame} (${time.toFixed(3)}ms)`
				);
			});
		},
		printLog: (...str) =>
			Log.verboseAdvanced({indent: indentOutput, logLevel}, ...str),
	});

	Log.infoAdvanced({indent: indentOutput, logLevel});
	Log.infoAdvanced(
		{indent: indentOutput, logLevel},
		chalk.cyan(`▶ ${absoluteOutputFile}`)
	);

	try {
		await cleanupBundle();
		await RenderInternals.cleanDownloadMap(downloadMap);

		Log.verboseAdvanced(
			{indent: indentOutput, logLevel},
			'Cleaned up',
			downloadMap.assetDir
		);
	} catch (err) {
		Log.warnAdvanced(
			{indent: indentOutput, logLevel},
			'Could not clean up directory.'
		);
		Log.warnAdvanced({indent: indentOutput, logLevel}, err);
		Log.warnAdvanced(
			{indent: indentOutput, logLevel},
			'Do you have minimum required Node.js version?'
		);
	}

	// TODO: This will not indent
	if (RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose')) {
		RenderInternals.perf.logPerf();
	}
};
