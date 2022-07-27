import type {RenderMediaOnDownload, StitchingState} from '@remotion/renderer';
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
// eslint-disable-next-line no-restricted-imports
import {Internals} from 'remotion';
import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {
	getAndValidateAbsoluteOutputFile,
	getCliOptions,
} from './get-cli-options';
import {getCompositionId} from './get-composition-id';
import {getOutputFilename} from './get-filename';
import {initializeRenderCli} from './initialize-render-cli';
import {Log} from './log';
import {parsedCli, quietFlagProvided} from './parse-command-line';
import type {DownloadProgress} from './progress-bar';
import {
	createOverwriteableCliOutput,
	makeRenderingAndStitchingProgress,
} from './progress-bar';
import {bundleOnCli} from './setup-cache';
import type {RenderStep} from './step';
import {checkAndValidateFfmpegVersion} from './validate-ffmpeg-version';

export const render = async (remotionRoot: string) => {
	const startTime = Date.now();
	const file = parsedCli._[1];
	if (!file) {
		Log.error('No entry point specified. Pass more arguments:');
		Log.error(
			'   npx remotion render [entry-point] [composition-name] [out-name]'
		);
		Log.error('Documentation: https://www.remotion.dev/docs/render');
		process.exit(1);
	}

	const fullPath = RenderInternals.isServeUrl(file)
		? file
		: path.join(process.cwd(), file);

	const downloadMap = RenderInternals.makeDownloadMap();

	await initializeRenderCli(remotionRoot, 'sequence');

	const {
		codec,
		proResProfile,
		parallelism,
		frameRange,
		shouldOutputImageSequence,
		overwrite,
		inputProps,
		envVariables,
		quality,
		browser,
		crf,
		pixelFormat,
		imageFormat,
		browserExecutable,
		ffmpegExecutable,
		ffprobeExecutable,
		scale,
		chromiumOptions,
		port,
		numberOfGifLoops,
		everyNthFrame,
		puppeteerTimeout,
	} = await getCliOptions({
		isLambda: false,
		type: 'series',
	});

	const relativeOutputLocation = getOutputFilename({
		codec,
		imageSequence: shouldOutputImageSequence,
		compositionName: getCompositionId(),
		defaultExtension: RenderInternals.getFileExtensionFromCodec(codec, 'final'),
	});

	const absoluteOutputFile = getAndValidateAbsoluteOutputFile(
		relativeOutputLocation,
		overwrite
	);

	const compositionId = getCompositionId();

	Log.info(
		chalk.gray(
			`Composition = ${compositionId}, Codec = ${codec}, Output = ${relativeOutputLocation}`
		)
	);

	Log.verbose('Browser executable: ', browserExecutable);

	await checkAndValidateFfmpegVersion({
		ffmpegExecutable,
	});

	const browserInstance = openBrowser(browser, {
		browserExecutable,
		shouldDumpIo: RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		),
		chromiumOptions,
		forceDeviceScaleFactor: scale,
	});

	const steps: RenderStep[] = [
		RenderInternals.isServeUrl(fullPath) ? null : ('bundling' as const),
		'rendering' as const,
		shouldOutputImageSequence ? null : ('stitching' as const),
	].filter(Internals.truthy);

	const urlOrBundle = RenderInternals.isServeUrl(fullPath)
		? fullPath
		: await bundleOnCli({fullPath, remotionRoot, steps});

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
		timeoutInMilliseconds: ConfigInternals.getCurrentPuppeteerTimeout(),
		chromiumOptions,
		browserExecutable,
		downloadMap,
	});

	const config = comps.find((c) => c.id === compositionId);

	if (!config) {
		throw new Error(`Cannot find composition with ID ${compositionId}`);
	}

	RenderInternals.validateEvenDimensionsWithCodec({
		width: config.width,
		height: config.height,
		codec,
		scale,
	});

	const outputDir = shouldOutputImageSequence
		? absoluteOutputFile
		: await fs.promises.mkdtemp(path.join(os.tmpdir(), 'react-motion-render'));

	Log.verbose('Output dir', outputDir);

	const renderProgress = createOverwriteableCliOutput(quietFlagProvided());
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
	const downloads: DownloadProgress[] = [];

	const updateRenderProgress = () => {
		if (totalFrames.length === 0) {
			throw new Error('totalFrames should not be 0');
		}

		return renderProgress.update(
			makeRenderingAndStitchingProgress({
				rendering: {
					frames: renderedFrames,
					totalFrames: totalFrames.length,
					concurrency: RenderInternals.getActualConcurrency(parallelism),
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
			})
		);
	};

	if (shouldOutputImageSequence) {
		fs.mkdirSync(absoluteOutputFile, {
			recursive: true,
		});
		if (imageFormat === 'none') {
			Log.error(
				'Cannot render an image sequence with a codec that renders no images.'
			);
			Log.error(`codec = ${codec}, imageFormat = ${imageFormat}`);
			process.exit(1);
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
					Log.info(
						'\nWriting Data URL to file: ',
						src.substring(0, 30) + '...'
					);
				} else {
					Log.info('\nDownloading asset... ', src);
				}
			},
			outputDir,
			serveUrl: urlOrBundle,
			dumpBrowserLogs: RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'verbose'
			),
			everyNthFrame,
			envVariables,
			frameRange,
			parallelism,
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
		renderedDoneIn = Date.now() - startTime;

		updateRenderProgress();
		Log.info();
		Log.info();
		Log.info(chalk.green('\nYour image sequence is ready!'));
		return;
	}

	await renderMedia({
		outputLocation: absoluteOutputFile,
		codec,
		composition: config,
		crf,
		envVariables,
		ffmpegExecutable,
		ffprobeExecutable,
		frameRange,
		imageFormat,
		inputProps,
		onProgress: (update) => {
			encodedDoneIn = update.encodedDoneIn;
			encodedFrames = update.encodedFrames;
			renderedDoneIn = update.renderedDoneIn;
			stitchStage = update.stitchStage;
			renderedFrames = update.renderedFrames;
			updateRenderProgress();
		},
		puppeteerInstance,
		overwrite,
		parallelism,
		pixelFormat,
		proResProfile,
		quality,
		serveUrl: urlOrBundle,
		onDownload,
		dumpBrowserLogs: RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		),
		chromiumOptions,
		timeoutInMilliseconds: ConfigInternals.getCurrentPuppeteerTimeout(),
		scale,
		port,
		numberOfGifLoops,
		everyNthFrame,
		verbose: RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		),
		downloadMap,
	});

	Log.info();
	Log.info();
	const seconds = Math.round((Date.now() - startTime) / 1000);
	Log.info(
		[
			'- Total render time:',
			seconds,
			seconds === 1 ? 'second' : 'seconds',
		].join(' ')
	);
	Log.info('-', 'Output can be found at:');
	Log.info(chalk.cyan(`▶ ${absoluteOutputFile}`));
	Log.verbose('Cleaning up...');

	try {
		await RenderInternals.deleteDirectory(urlOrBundle);
	} catch (err) {
		Log.warn('Could not clean up directory.');
		Log.warn(err);
		Log.warn('Do you have minimum required Node.js version?');
	}

	Log.info(
		chalk.green(`\nYour ${codec === 'gif' ? 'GIF' : 'video'} is ready!`)
	);

	if (
		RenderInternals.isEqualOrBelowLogLevel(
			ConfigInternals.Logging.getLogLevel(),
			'verbose'
		)
	) {
		RenderInternals.perf.logPerf();
	}
};
