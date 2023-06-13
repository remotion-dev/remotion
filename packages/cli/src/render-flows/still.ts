// Prints to CLI and also reports back to browser

import type {
	Browser,
	BrowserExecutable,
	CancelSignal,
	ChromiumOptions,
	LogLevel,
	RenderMediaOnDownload,
	StillImageFormat,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {chalk} from '../chalk';
import {registerCleanupJob} from '../cleanup-before-quit';
import {ConfigInternals} from '../config';
import {determineFinalStillImageFormat} from '../determine-image-format';
import {getAndValidateAbsoluteOutputFile} from '../get-cli-options';
import {getCompositionWithDimensionOverride} from '../get-composition-with-dimension-override';
import {Log} from '../log';
import {parsedCli, quietFlagProvided} from '../parse-command-line';
import type {JobProgressCallback} from '../preview-server/render-queue/job';
import type {OverwriteableCliOutput} from '../progress-bar';
import {
	createOverwriteableCliOutput,
	makeRenderingAndStitchingProgress,
} from '../progress-bar';
import type {
	AggregateRenderProgress,
	DownloadProgress,
} from '../progress-types';
import {initialAggregateRenderProgress} from '../progress-types';
import {bundleOnCliOrTakeServeUrl} from '../setup-cache';
import {shouldUseNonOverlayingLogger} from '../should-use-non-overlaying-logger';
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
	jpegQuality,
	scale,
	stillFrame,
	width,
	compositionIdFromUi,
	imageFormatFromUi,
	logLevel,
	onProgress,
	indentOutput,
	addCleanupCallback,
	cancelSignal,
	outputLocationFromUi,
}: {
	remotionRoot: string;
	fullEntryPoint: string;
	entryPointReason: string;
	remainingArgs: string[];
	inputProps: Record<string, unknown>;
	envVariables: Record<string, string>;
	jpegQuality: number;
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
	onProgress: JobProgressCallback;
	indentOutput: boolean;
	addCleanupCallback: (cb: () => void) => void;
	cancelSignal: CancelSignal | null;
	outputLocationFromUi: string | null;
}) => {
	const downloads: DownloadProgress[] = [];

	const aggregate: AggregateRenderProgress = initialAggregateRenderProgress();
	const updatesDontOverwrite = shouldUseNonOverlayingLogger({logLevel});

	let renderProgress: OverwriteableCliOutput | null = null;

	const steps: RenderStep[] = [
		RenderInternals.isServeUrl(fullEntryPoint) ? null : ('bundling' as const),
		'rendering' as const,
	].filter(truthy);

	const updateProgress = (newline: boolean) => {
		const {output, progress, message} = makeRenderingAndStitchingProgress({
			prog: aggregate,
			steps: steps.length,
			stitchingStep: steps.indexOf('stitching'),
		});
		if (renderProgress) {
			renderProgress.update(updatesDontOverwrite ? message : output, newline);
		}

		onProgress({message, value: progress, ...aggregate});
	};

	Log.verboseAdvanced(
		{indent: indentOutput, logLevel},
		'Browser executable: ',
		browserExecutable
	);
	const verbose = RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose');

	const browserInstance = RenderInternals.internalOpenBrowser({
		browser,
		browserExecutable,
		chromiumOptions,
		shouldDumpIo: verbose,
		forceDeviceScaleFactor: scale,
		indent: indentOutput,
		viewport: null,
	});

	const {cleanup: cleanupBundle, urlOrBundle} = await bundleOnCliOrTakeServeUrl(
		{
			fullPath: fullEntryPoint,
			remotionRoot,
			steps: steps.length,
			publicDir,
			onProgress: ({copying, bundling}) => {
				aggregate.bundling = bundling;
				aggregate.copyingState = copying;
				updateProgress(false);
			},
			indentOutput,
			logLevel,
			bundlingStep: steps.indexOf('bundling'),
			onDirectoryCreated: (dir) => {
				registerCleanupJob(() => {
					RenderInternals.deleteDirectory(dir);
				});
			},
			quietProgress: updatesDontOverwrite,
		}
	);

	const server = RenderInternals.prepareServer({
		concurrency: 1,
		indent: indentOutput,
		port,
		remotionRoot,
		verbose: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose'),
		webpackConfigOrServeUrl: urlOrBundle,
	});

	addCleanupCallback(() => server.then((s) => s.closeServer(false)));

	addCleanupCallback(() => cleanupBundle());

	const puppeteerInstance = await browserInstance;
	addCleanupCallback(() => puppeteerInstance.close(false));

	const {compositionId, config, reason, argsAfterComposition} =
		await getCompositionWithDimensionOverride({
			height,
			width,
			args: remainingArgs,
			compositionIdFromUi,
			browserExecutable,
			chromiumOptions,
			envVariables,
			indent: indentOutput,
			inputProps,
			port,
			puppeteerInstance,
			serveUrlOrWebpackUrl: urlOrBundle,
			timeoutInMilliseconds: puppeteerTimeout,
			verbose: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose'),
			server: await server,
		});

	const {format: imageFormat, source} = determineFinalStillImageFormat({
		cliFlag: parsedCli['image-format'] ?? null,
		configImageFormat:
			ConfigInternals.getUserPreferredStillImageFormat() ?? null,
		downloadName: null,
		outName: getUserPassedOutputLocation(
			argsAfterComposition,
			outputLocationFromUi
		),
		isLambda: false,
		fromUi: imageFormatFromUi,
	});

	const relativeOutputLocation = getOutputLocation({
		compositionId,
		defaultExtension: imageFormat,
		args: argsAfterComposition,
		type: 'asset',
		outputLocationFromUi,
	});

	const absoluteOutputLocation = getAndValidateAbsoluteOutputFile(
		relativeOutputLocation,
		overwrite
	);
	const exists = existsSync(absoluteOutputLocation);

	mkdirSync(path.join(absoluteOutputLocation, '..'), {
		recursive: true,
	});

	Log.verboseAdvanced(
		{indent: indentOutput, logLevel},
		chalk.gray(`Entry point = ${fullEntryPoint} (${entryPointReason})`)
	);
	Log.infoAdvanced(
		{indent: indentOutput, logLevel},
		chalk.gray(
			`Composition = ${compositionId} (${reason}), Format = ${imageFormat} (${source}), Output = ${relativeOutputLocation}`
		)
	);

	renderProgress = createOverwriteableCliOutput({
		quiet: quietFlagProvided(),
		cancelSignal,
		updatesDontOverwrite: shouldUseNonOverlayingLogger({logLevel}),
		indent: indentOutput,
	});
	const renderStart = Date.now();

	aggregate.rendering = {
		frames: 0,
		concurrency: 1,
		doneIn: null,
		steps,
		totalFrames: 1,
	};

	updateProgress(false);

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
		updateProgress(false);

		return ({percent}) => {
			download.progress = percent;
			updateProgress(false);
		};
	};

	await RenderInternals.internalRenderStill({
		composition: config,
		frame: stillFrame,
		output: absoluteOutputLocation,
		serveUrl: urlOrBundle,
		jpegQuality,
		dumpBrowserLogs: verbose,
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
		puppeteerInstance,
		server: await server,
		cancelSignal,
		indent: indentOutput,
		onBrowserLog: null,
		verbose,
	});

	aggregate.rendering = {
		frames: 1,
		concurrency: 1,
		doneIn: Date.now() - renderStart,
		steps,
		totalFrames: 1,
	};
	updateProgress(true);
	Log.infoAdvanced(
		{indent: indentOutput, logLevel},
		chalk.blue(`${exists ? '○' : '+'} ${absoluteOutputLocation}`)
	);
};
