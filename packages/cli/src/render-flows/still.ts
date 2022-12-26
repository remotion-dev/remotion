// Prints to CLI and also reports back to browser

import type {
	Browser,
	BrowserExecutable,
	ChromiumOptions,
	FfmpegExecutable,
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
import {determineFinalImageFormat} from '../determine-image-format';
import {getAndValidateAbsoluteOutputFile} from '../get-cli-options';
import {getCompositionWithDimensionOverride} from '../get-composition-with-dimension-override';
import {Log} from '../log';
import {parsedCli, quietFlagProvided} from '../parse-command-line';
import type {JobProgressCallback} from '../preview-server/render-queue/job';
import type {DownloadProgress} from '../progress-bar';
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
	ffmpegExecutable,
	ffprobeExecutable,
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
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
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
}) => {
	const startTime = Date.now();

	Log.verbose('Browser executable: ', browserExecutable);
	const shouldDumpIo = RenderInternals.isEqualOrBelowLogLevel(
		logLevel,
		'verbose'
	);

	const browserInstance = openBrowser(browser, {
		browserExecutable,
		chromiumOptions,
		shouldDumpIo,
		forceDeviceScaleFactor: scale,
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
				onProgress({message: 'Bundling...', progress});
			},
		}
	);

	onProgress({
		message: 'Opening browser',
		progress: 0,
	});

	const puppeteerInstance = await browserInstance;

	const downloadMap = RenderInternals.makeDownloadMap();

	const comps = await getCompositions(urlOrBundle, {
		inputProps,
		puppeteerInstance,
		envVariables,
		timeoutInMilliseconds: puppeteerTimeout,
		chromiumOptions,
		port,
		browserExecutable,
		ffmpegExecutable,
		ffprobeExecutable,
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
	});

	const absoluteOutputLocation = getAndValidateAbsoluteOutputFile(
		relativeOutputLocation,
		overwrite
	);

	mkdirSync(path.join(absoluteOutputLocation, '..'), {
		recursive: true,
	});

	Log.info(
		chalk.gray(
			`Entry point = ${fullEntryPoint} (${entryPointReason}), Output = ${relativeOutputLocation}, Format = ${imageFormat} (${source}), Composition = ${compositionId} (${reason})`
		)
	);

	const renderProgress = createOverwriteableCliOutput(quietFlagProvided());
	const renderStart = Date.now();

	const downloads: DownloadProgress[] = [];
	let frames = 0;
	const totalFrames = 1;

	const updateProgress = () => {
		renderProgress.update(
			makeRenderingAndStitchingProgress({
				rendering: {
					frames,
					concurrency: 1,
					doneIn: frames === totalFrames ? Date.now() - renderStart : null,
					steps,
					totalFrames,
				},
				downloads,
				stitching: null,
			})
		);
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
		ffmpegExecutable,
		browserExecutable,
		overwrite,
		onDownload,
		port,
		downloadMap,
	});

	frames = 1;
	updateProgress();
	Log.info();

	const closeBrowserPromise = puppeteerInstance.close(false);

	Log.info(chalk.green('\nYour still frame is ready!'));

	const seconds = Math.round((Date.now() - startTime) / 1000);
	Log.info(
		[
			'- Total render time:',
			seconds,
			seconds === 1 ? 'second' : 'seconds',
		].join(' ')
	);
	Log.info('-', 'Output can be found at:');
	Log.info(chalk.cyan(`▶️ ${absoluteOutputLocation}`));
	await closeBrowserPromise;
	await RenderInternals.cleanDownloadMap(downloadMap);
	await cleanupBundle();

	Log.verbose('Cleaned up', downloadMap.assetDir);
};
