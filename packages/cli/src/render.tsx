import {
	getCompositions,
	openBrowser,
	renderFrames,
	RenderInternals,
	renderMedia,
	StitchingState,
} from '@remotion/renderer';
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals} from 'remotion';
import {getCliOptions} from './get-cli-options';
import {getCompositionId} from './get-composition-id';
import {initializeRenderCli} from './initialize-render-cli';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {
	createOverwriteableCliOutput,
	DownloadProgress,
	makeRenderingAndStitchingProgress,
} from './progress-bar';
import {bundleOnCli} from './setup-cache';
import {RenderStep} from './step';
import {checkAndValidateFfmpegVersion} from './validate-ffmpeg-version';

export const render = async () => {
	const startTime = Date.now();
	const file = parsedCli._[1];
	const fullPath = RenderInternals.isServeUrl(file)
		? file
		: path.join(process.cwd(), file);

	await initializeRenderCli('sequence');

	const {
		codec,
		proResProfile,
		parallelism,
		frameRange,
		shouldOutputImageSequence,
		absoluteOutputFile,
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
	} = await getCliOptions({isLambda: false, type: 'series'});

	if (!absoluteOutputFile) {
		throw new Error(
			'assertion error - expected absoluteOutputFile to not be null'
		);
	}

	await checkAndValidateFfmpegVersion({
		ffmpegExecutable: Internals.getCustomFfmpegExecutable(),
	});

	const browserInstance = openBrowser(browser, {
		browserExecutable,
		shouldDumpIo: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
	});

	const steps: RenderStep[] = [
		RenderInternals.isServeUrl(fullPath) ? null : ('bundling' as const),
		'rendering' as const,
		shouldOutputImageSequence ? null : ('stitching' as const),
	].filter(Internals.truthy);

	const urlOrBundle = RenderInternals.isServeUrl(fullPath)
		? Promise.resolve(fullPath)
		: await bundleOnCli(fullPath, steps);
	const {serveUrl, closeServer} = await RenderInternals.prepareServer(
		await urlOrBundle
	);

	const puppeteerInstance = await browserInstance;

	const comps = await getCompositions(serveUrl, {
		inputProps,
		puppeteerInstance,
		envVariables,
	});
	const compositionId = getCompositionId(comps);

	const config = comps.find((c) => c.id === compositionId);
	if (!config) {
		throw new Error(`Cannot find composition with ID ${compositionId}`);
	}

	RenderInternals.validateEvenDimensionsWithCodec({
		width: config.width,
		height: config.height,
		codec,
	});

	const outputDir = shouldOutputImageSequence
		? absoluteOutputFile
		: await fs.promises.mkdtemp(path.join(os.tmpdir(), 'react-motion-render'));

	Log.verbose('Output dir', outputDir);

	const renderProgress = createOverwriteableCliOutput();
	let totalFrames: number | null = 0;
	let encodedFrames = 0;
	let renderedFrames = 0;
	let encodedDoneIn: number | null = null;
	let renderedDoneIn: number | null = null;
	let stitchStage: StitchingState = 'encoding';
	const downloads: DownloadProgress[] = [];

	const updateRenderProgress = () => {
		if (totalFrames === null) {
			throw new Error('totalFrames should not be 0');
		}

		return renderProgress.update(
			makeRenderingAndStitchingProgress({
				rendering: {
					frames: renderedFrames,
					totalFrames,
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
							totalFrames,
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
			onStart: ({frameCount}) => {
				totalFrames = frameCount;
				return updateRenderProgress();
			},
			outputDir,
			serveUrl,
			dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
			envVariables,
			frameRange,
			parallelism,
			puppeteerInstance,
			quality,
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
		serveUrl,
		onDownload: (src) => {
			const id = Math.random();
			const download: DownloadProgress = {
				id,
				name: src,
				progress: 0,
			};
			downloads.push(download);
			updateRenderProgress();

			return ({percent}) => {
				download.progress = percent;
				updateRenderProgress();
			};
		},
		dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		onStart: ({frameCount}) => {
			totalFrames = frameCount;
		},
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
	Log.info(chalk.cyan(`▶️ ${absoluteOutputFile}`));
	Log.verbose('Cleaning up...');
	try {
		await RenderInternals.deleteDirectory(await urlOrBundle);
	} catch (err) {
		Log.warn('Could not clean up directory.');
		Log.warn(err);
		Log.warn('Do you have minimum required Node.js version?');
	}

	Log.info(chalk.green('\nYour video is ready!'));
	closeServer().catch((err) => {
		Log.error('Could not close web server', err);
	});
};
