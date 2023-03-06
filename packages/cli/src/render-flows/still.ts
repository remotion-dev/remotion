// Prints to CLI and also reports back to browser

import type {
	Browser,
	BrowserExecutable,
	CancelSignal,
	ChromiumOptions,
	ImageFormat,
	LogLevel,
	RenderMediaOnDownload,
	StillImageFormat,
} from '@remotion/renderer';
import {
	getCompositions,
	openBrowser,
	RenderInternals,
	renderStill,
} from '@remotion/renderer';
import {mkdirSync} from 'fs';
import path from 'path';
import {chalk} from '../chalk';
import {registerCleanupJob} from '../cleanup-before-quit';
import {determineFinalImageFormat} from '../determine-image-format';
import {getAndValidateAbsoluteOutputFile} from '../get-cli-options';
import {getCompositionWithDimensionOverride} from '../get-composition-with-dimension-override';
import {INDENT_TOKEN, Log} from '../log';
import {parsedCli, quietFlagProvided} from '../parse-command-line';
import type {JobProgressCallback} from '../preview-server/render-queue/job';
import type {
	AggregateRenderProgress,
	DownloadProgress,
	OverwriteableCliOutput,
} from '../progress-bar';
import {
	createOverwriteableCliOutput,
	makeRenderingAndStitchingProgress,
} from '../progress-bar';
import {bundleOnCliOrTakeServeUrl} from '../setup-cache';
import type {RenderStep} from '../step';
import {truthy} from '../truthy';
import {
	getOutputLocation,
	getUserPassedOutputLocation,
} from '../user-passed-output-location';

export const renderStillFlow = async ({
	remotionRoot,
	fullEntryPoint,
	entryPointReason,
	remainingArgs,
	browser,
	browserExecutable,
	chromiumOptions,
	envVariables,
	height,
	inputProps,
	overwrite,
	port,
	publicDir,
	puppeteerTimeout,
	quality,
	scale,
	stillFrame,
	width,
	compositionIdFromUi,
	imageFormatFromUi,
	logLevel,
	configFileImageFormat,
	onProgress,
	indentOutput,
	addCleanupCallback,
	cancelSignal,
}: {
	remotionRoot: string;
	fullEntryPoint: string;
	entryPointReason: string;
	remainingArgs: string[];
	inputProps: object;
	envVariables: Record<string, string>;
	quality: number | undefined;
	browser: Browser;
	stillFrame: number;
	browserExecutable: BrowserExecutable;
	chromiumOptions: ChromiumOptions;
	scale: number;
	overwrite: boolean;
	puppeteerTimeout: number;
	port: number | null;
	publicDir: string | null;
	height: number | null;
	width: number | null;
	compositionIdFromUi: string | null;
	imageFormatFromUi: StillImageFormat | null;
	logLevel: LogLevel;
	configFileImageFormat: ImageFormat | undefined;
	onProgress: JobProgressCallback;
	indentOutput: boolean;
	addCleanupCallback: (cb: () => void) => void;
	cancelSignal: CancelSignal | null;
}) => {
	const downloads: DownloadProgress[] = [];

	const aggregate: AggregateRenderProgress = {
		rendering: null,
		downloads,
		stitching: null,
		bundling: {
			message: null,
			progress: 0,
		},
	};
	let renderProgress: OverwriteableCliOutput | null = null;

	const updateProgress = () => {
		const {output, progress, message} = makeRenderingAndStitchingProgress(
			aggregate,
			indentOutput
		);
		if (renderProgress) {
			renderProgress.update(output);
		}

		onProgress({progress, message});
	};

	Log.verboseAdvanced(
		{indent: indentOutput, logLevel},
		'Browser executable: ',
		browserExecutable
	);
	const shouldDumpIo = RenderInternals.isEqualOrBelowLogLevel(
		logLevel,
		'verbose'
	);

	const browserInstance = openBrowser(browser, {
		browserExecutable,
		chromiumOptions,
		shouldDumpIo,
		forceDeviceScaleFactor: scale,
		indentationString: indentOutput ? INDENT_TOKEN + ' ' : '',
	});

	const steps: RenderStep[] = [
		RenderInternals.isServeUrl(fullEntryPoint) ? null : ('bundling' as const),
		'rendering' as const,
	].filter(truthy);

	const {cleanup: cleanupBundle, urlOrBundle} = await bundleOnCliOrTakeServeUrl(
		{
			fullPath: fullEntryPoint,
			remotionRoot,
			steps,
			publicDir,
			onProgress: (progress) => {
				aggregate.bundling = progress;
				updateProgress();
			},
			indentOutput,
			logLevel,
		}
	);

	registerCleanupJob(() => cleanupBundle());
	addCleanupCallback(() => cleanupBundle());

	const puppeteerInstance = await browserInstance;
	addCleanupCallback(() => puppeteerInstance.close(false));

	const downloadMap = RenderInternals.makeDownloadMap();

	registerCleanupJob(() => RenderInternals.cleanDownloadMap(downloadMap));
	addCleanupCallback(() => RenderInternals.cleanDownloadMap(downloadMap));

	const comps = await getCompositions(urlOrBundle, {
		inputProps,
		puppeteerInstance,
		envVariables,
		timeoutInMilliseconds: puppeteerTimeout,
		chromiumOptions,
		port,
		browserExecutable,
		downloadMap,
	});

	const {compositionId, config, reason, argsAfterComposition} =
		await getCompositionWithDimensionOverride({
			validCompositions: comps,
			height,
			width,
			args: remainingArgs,
			compositionIdFromUi,
		});

	const {format: imageFormat, source} = determineFinalImageFormat({
		cliFlag: parsedCli['image-format'] ?? null,
		configImageFormat: configFileImageFormat ?? null,
		downloadName: null,
		outName: getUserPassedOutputLocation(argsAfterComposition),
		isLambda: false,
		fromUi: imageFormatFromUi,
	});

	const relativeOutputLocation = getOutputLocation({
		compositionId,
		defaultExtension: imageFormat,
		args: argsAfterComposition,
		type: 'asset',
	});

	const absoluteOutputLocation = getAndValidateAbsoluteOutputFile(
		relativeOutputLocation,
		overwrite
	);

	mkdirSync(path.join(absoluteOutputLocation, '..'), {
		recursive: true,
	});

	Log.infoAdvanced(
		{indent: indentOutput, logLevel},
		chalk.gray(
			`Entry point = ${fullEntryPoint} (${entryPointReason}), Output = ${relativeOutputLocation}, Format = ${imageFormat} (${source}), Composition = ${compositionId} (${reason})`
		)
	);

	renderProgress = createOverwriteableCliOutput({
		quiet: quietFlagProvided(),
		cancelSignal,
	});
	const renderStart = Date.now();

	aggregate.rendering = {
		frames: 0,
		concurrency: 1,
		doneIn: null,
		steps,
		totalFrames: 1,
	};

	updateProgress();

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
		updateProgress();

		return ({percent}) => {
			download.progress = percent;
			updateProgress();
		};
	};

	await renderStill({
		composition: config,
		frame: stillFrame,
		output: absoluteOutputLocation,
		serveUrl: urlOrBundle,
		quality,
		dumpBrowserLogs: shouldDumpIo,
		envVariables,
		imageFormat,
		inputProps,
		chromiumOptions,
		timeoutInMilliseconds: puppeteerTimeout,
		scale,
		browserExecutable,
		overwrite,
		onDownload,
		port,
		downloadMap,
		puppeteerInstance,
	});

	aggregate.rendering = {
		frames: 1,
		concurrency: 1,
		doneIn: Date.now() - renderStart,
		steps,
		totalFrames: 1,
	};
	updateProgress();
	Log.infoAdvanced({indent: indentOutput, logLevel});
	Log.infoAdvanced(
		{indent: indentOutput, logLevel},
		chalk.cyan(`▶️ ${absoluteOutputLocation}`)
	);
};
