import type {RenderMediaOnDownload} from '@remotion/renderer';
import {
	getCompositions,
	openBrowser,
	RenderInternals,
	renderStill,
} from '@remotion/renderer';
import {mkdirSync} from 'fs';
import path from 'path';
import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {determineFinalImageFormat} from './determine-image-format';
import {
	getAndValidateAbsoluteOutputFile,
	getCliOptions,
} from './get-cli-options';
import {getCompositionId} from './get-composition-id';
import {Log} from './log';
import {parsedCli, quietFlagProvided} from './parse-command-line';
import type {DownloadProgress} from './progress-bar';
import {
	createOverwriteableCliOutput,
	makeRenderingAndStitchingProgress,
} from './progress-bar';
import {bundleOnCliOrTakeServeUrl} from './setup-cache';
import type {RenderStep} from './step';
import {truthy} from './truthy';
import {
	getOutputLocation,
	getUserPassedOutputLocation,
} from './user-passed-output-location';

export const still = async (remotionRoot: string) => {
	const startTime = Date.now();
	const file = parsedCli._[1];
	const fullPath = RenderInternals.isServeUrl(file)
		? file
		: path.join(process.cwd(), file);

	if (parsedCli.frames) {
		Log.error(
			'--frames flag was passed to the `still` command. This flag only works with the `render` command. Did you mean `--frame`? See reference: https://www.remotion.dev/docs/cli/'
		);
		process.exit(1);
	}

	const {
		inputProps,
		envVariables,
		quality,
		browser,
		stillFrame,
		browserExecutable,
		chromiumOptions,
		scale,
		ffmpegExecutable,
		ffprobeExecutable,
		overwrite,
		puppeteerTimeout,
		port,
		publicDir,
	} = await getCliOptions({
		isLambda: false,
		type: 'still',
		codec: 'h264',
		remotionRoot,
	});

	Log.verbose('Browser executable: ', browserExecutable);

	const compositionId = getCompositionId();

	const {format: imageFormat, source} = determineFinalImageFormat({
		cliFlag: parsedCli['image-format'] ?? null,
		configImageFormat: ConfigInternals.getUserPreferredImageFormat() ?? null,
		downloadName: null,
		outName: getUserPassedOutputLocation(),
		isLambda: false,
	});

	const relativeOutputLocation = getOutputLocation({
		compositionId,
		defaultExtension: imageFormat,
	});

	const absoluteOutputLocation = getAndValidateAbsoluteOutputFile(
		relativeOutputLocation,
		overwrite
	);

	Log.info(
		chalk.gray(
			`Output = ${relativeOutputLocation}, Format = ${imageFormat} (${source}), Composition = ${compositionId}`
		)
	);

	const browserInstance = openBrowser(browser, {
		browserExecutable,
		chromiumOptions,
		shouldDumpIo: RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		),
		forceDeviceScaleFactor: scale,
	});

	mkdirSync(path.join(absoluteOutputLocation, '..'), {
		recursive: true,
	});

	const steps: RenderStep[] = [
		RenderInternals.isServeUrl(fullPath) ? null : ('bundling' as const),
		'rendering' as const,
	].filter(truthy);

	const {cleanup: cleanupBundle, urlOrBundle} = await bundleOnCliOrTakeServeUrl(
		{fullPath, remotionRoot, steps, publicDir}
	);

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

	const composition = comps.find((c) => c.id === compositionId);
	if (!composition) {
		throw new Error(`Cannot find composition with ID ${compositionId}`);
	}

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
		composition,
		frame: stillFrame,
		output: absoluteOutputLocation,
		serveUrl: urlOrBundle,
		quality,
		dumpBrowserLogs: RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		),
		envVariables,
		imageFormat,
		inputProps,
		chromiumOptions,
		timeoutInMilliseconds: ConfigInternals.getCurrentPuppeteerTimeout(),
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

	const closeBrowserPromise = puppeteerInstance.close();

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
