// Prints to CLI and also reports back to browser

import type {
	Browser,
	BrowserExecutable,
	CancelSignal,
	ChromeMode,
	ChromiumOptions,
	LogLevel,
	RenderMediaOnDownload,
	StillImageFormat,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	AggregateRenderProgress,
	JobProgressCallback,
} from '@remotion/studio-server';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {NoReactInternals} from 'remotion/no-react';
import {defaultBrowserDownloadProgress} from '../browser-download-bar';
import {chalk} from '../chalk';
import {registerCleanupJob} from '../cleanup-before-quit';
import {ConfigInternals} from '../config';
import {determineFinalStillImageFormat} from '../determine-image-format';
import {getAndValidateAbsoluteOutputFile} from '../get-cli-options';
import {getCompositionWithDimensionOverride} from '../get-composition-with-dimension-override';
import {makeHyperlink} from '../hyperlinks/make-link';
import {Log} from '../log';
import {makeOnDownload} from '../make-on-download';
import {handleOnArtifact} from '../on-artifact';
import {parsedCli, quietFlagProvided} from '../parsed-cli';
import type {OverwriteableCliOutput} from '../progress-bar';
import {
	LABEL_WIDTH,
	createOverwriteableCliOutput,
	makeRenderingAndStitchingProgress,
	printFact,
} from '../progress-bar';
import {initialAggregateRenderProgress} from '../progress-types';
import {bundleOnCliOrTakeServeUrl} from '../setup-cache';
import {shouldUseNonOverlayingLogger} from '../should-use-non-overlaying-logger';
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
	serializedInputPropsWithCustomSchema,
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
	indent,
	addCleanupCallback,
	cancelSignal,
	outputLocationFromUi,
	offthreadVideoCacheSizeInBytes,
	binariesDirectory,
	publicPath,
	chromeMode,
	offthreadVideoThreads,
}: {
	remotionRoot: string;
	fullEntryPoint: string;
	entryPointReason: string;
	remainingArgs: (string | number)[];
	serializedInputPropsWithCustomSchema: string;
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
	indent: boolean;
	addCleanupCallback: (label: string, cb: () => void) => void;
	cancelSignal: CancelSignal | null;
	outputLocationFromUi: string | null;
	offthreadVideoCacheSizeInBytes: number | null;
	offthreadVideoThreads: number | null;
	binariesDirectory: string | null;
	publicPath: string | null;
	chromeMode: ChromeMode;
}) => {
	const isVerbose = RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose');
	Log.verbose(
		{indent, logLevel},
		chalk.gray(`Entry point = ${fullEntryPoint} (${entryPointReason})`),
	);

	const aggregate: AggregateRenderProgress = initialAggregateRenderProgress();
	const updatesDontOverwrite = shouldUseNonOverlayingLogger({logLevel});

	const renderProgress: OverwriteableCliOutput = createOverwriteableCliOutput({
		quiet: quietFlagProvided(),
		cancelSignal,
		updatesDontOverwrite: shouldUseNonOverlayingLogger({logLevel}),
		indent,
	});

	const updateRenderProgress = ({
		newline,
		printToConsole,
	}: {
		newline: boolean;
		printToConsole: boolean;
	}) => {
		const {output, progress, message} = makeRenderingAndStitchingProgress({
			prog: aggregate,
			isUsingParallelEncoding: false,
		});
		if (printToConsole) {
			renderProgress.update(updatesDontOverwrite ? message : output, newline);
		}

		onProgress({message, value: progress, ...aggregate});
	};

	const onBrowserDownload = defaultBrowserDownloadProgress({
		quiet: quietFlagProvided(),
		indent,
		logLevel,
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

	const {cleanup: cleanupBundle, urlOrBundle} = await bundleOnCliOrTakeServeUrl(
		{
			fullPath: fullEntryPoint,
			remotionRoot,
			publicDir,
			onProgress: ({copying, bundling}) => {
				aggregate.bundling = bundling;
				aggregate.copyingState = copying;
				updateRenderProgress({
					newline: false,
					printToConsole: true,
				});
			},
			indentOutput: indent,
			logLevel,
			onDirectoryCreated: (dir) => {
				registerCleanupJob(`Delete ${dir}`, () => {
					RenderInternals.deleteDirectory(dir);
				});
			},
			quietProgress: updatesDontOverwrite,
			quietFlag: quietFlagProvided(),
			outDir: null,
			// Not needed for still
			gitSource: null,
			bufferStateDelayInMilliseconds: null,
			maxTimelineTracks: null,
			publicPath,
		},
	);

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

	addCleanupCallback(`Cleanup bundle`, () => cleanupBundle());

	const puppeteerInstance = await browserInstance;
	addCleanupCallback(`Close browser`, () =>
		puppeteerInstance.close({silent: false}),
	);

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

	const {format: imageFormat, source} = determineFinalStillImageFormat({
		cliFlag: parsedCli['image-format'] ?? null,
		configImageFormat:
			ConfigInternals.getUserPreferredStillImageFormat() ?? null,
		downloadName: null,
		outName: getUserPassedOutputLocation(
			argsAfterComposition,
			outputLocationFromUi,
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
		compositionDefaultOutName: config.defaultOutName,
	});

	const absoluteOutputLocation = getAndValidateAbsoluteOutputFile(
		relativeOutputLocation,
		overwrite,
		logLevel,
	);
	const exists = existsSync(absoluteOutputLocation);

	mkdirSync(path.join(absoluteOutputLocation, '..'), {
		recursive: true,
	});

	printFact('info')({
		indent,
		left: 'Composition',
		link: 'https://remotion.dev/docs/terminology/composition',
		logLevel,
		right: [compositionId, isVerbose ? `(${reason})` : null]
			.filter(truthy)
			.join(' '),
		color: 'gray',
	});
	printFact('info')({
		indent,
		left: 'Format',
		logLevel,
		right: [imageFormat, isVerbose ? `(${source})` : null]
			.filter(truthy)
			.join(' '),
		color: 'gray',
	});
	printFact('info')({
		indent,
		left: 'Output',
		logLevel,
		right: relativeOutputLocation,
		color: 'gray',
	});

	const renderStart = Date.now();

	aggregate.rendering = {
		frames: 0,
		doneIn: null,
		totalFrames: 1,
		timeRemainingInMilliseconds: null,
	};

	updateRenderProgress({
		newline: false,
		printToConsole: true,
	});

	const onDownload: RenderMediaOnDownload = makeOnDownload({
		downloads: aggregate.downloads,
		indent,
		logLevel,
		updateRenderProgress,
		updatesDontOverwrite,
		isUsingParallelEncoding: false,
	});

	const {onArtifact} = handleOnArtifact({
		artifactState: aggregate.artifactState,
		compositionId,
		onProgress: (progress) => {
			aggregate.artifactState = progress;

			updateRenderProgress({
				newline: false,
				printToConsole: true,
			});
		},
	});

	await RenderInternals.internalRenderStill({
		composition: config,
		frame: stillFrame,
		output: absoluteOutputLocation,
		serveUrl: urlOrBundle,
		jpegQuality,
		envVariables,
		imageFormat,
		serializedInputPropsWithCustomSchema,
		chromiumOptions,
		timeoutInMilliseconds: puppeteerTimeout,
		scale,
		browserExecutable,
		overwrite,
		onDownload,
		port,
		puppeteerInstance,
		server,
		cancelSignal,
		indent,
		onBrowserLog: null,
		logLevel,
		serializedResolvedPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				indent: undefined,
				staticBase: null,
				data: config.props,
			}).serializedString,
		offthreadVideoCacheSizeInBytes,
		binariesDirectory,
		onBrowserDownload,
		onArtifact,
		chromeMode,
		offthreadVideoThreads,
	});

	aggregate.rendering = {
		frames: 1,
		doneIn: Date.now() - renderStart,
		totalFrames: 1,
		timeRemainingInMilliseconds: null,
	};
	updateRenderProgress({
		newline: true,
		printToConsole: true,
	});
	Log.info(
		{indent, logLevel},
		chalk.blue(
			`${(exists ? '○' : '+').padEnd(LABEL_WIDTH)} ${makeHyperlink({url: 'file://' + absoluteOutputLocation, text: relativeOutputLocation, fallback: relativeOutputLocation})}`,
		),
	);
};
