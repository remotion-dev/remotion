import {
	getCompositions,
	renderFrames,
	RenderInternals,
	renderMedia,
	RenderMediaOnProgress,
} from '@remotion/renderer';
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals} from 'remotion';
import {deleteDirectory} from './delete-directory';
import {getCliOptions} from './get-cli-options';
import {getCompositionId} from './get-composition-id';
import {initializeRenderCli} from './initialize-render-cli';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {
	createOverwriteableCliOutput,
	makeRenderingAndStitchingProgress,
} from './progress-bar';
import {bundleOnCli} from './setup-cache';
import {checkAndValidateFfmpegVersion} from './validate-ffmpeg-version';

export const render = async () => {
	const startTime = Date.now();
	const file = parsedCli._[1];
	const fullPath = path.join(process.cwd(), file);

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
		parallelEncoding,
	} = await getCliOptions({isLambda: false, type: 'series'});

	if (!absoluteOutputFile) {
		throw new Error(
			'assertion error - expected absoluteOutputFile to not be null'
		);
	}

	await checkAndValidateFfmpegVersion({
		ffmpegExecutable: Internals.getCustomFfmpegExecutable(),
	});

	const browserInstance = RenderInternals.openBrowser(browser, {
		browserExecutable,
		shouldDumpIo: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
	});

	const hasStitching = !shouldOutputImageSequence;

	const steps = hasStitching ? 3 : 2;

	const bundled = await bundleOnCli(fullPath, steps);

	const {port, close} = await RenderInternals.serveStatic(bundled);

	const serveUrl = `http://localhost:${port}`;

	const openedBrowser = await browserInstance;

	const comps = await getCompositions(serveUrl, {
		browser,
		inputProps,
		browserInstance: openedBrowser,
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

	if (!outputDir) {
		throw new Error('Assertion error: Expected outputDir to not be null');
	}

	Log.verbose('Output dir', outputDir);

	const renderProgress = createOverwriteableCliOutput();
	let totalFrames: number | null = 0;
	const updateRenderProgress: RenderMediaOnProgress = ({
		encodedFrames,
		renderedFrames,
		encodedDoneIn,
		renderedDoneIn,
		stitchStage,
	}) => {
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
			onFrameUpdate: (renderedFrames) => {
				updateRenderProgress({
					encodedDoneIn: null,
					encodedFrames: 0,
					renderedDoneIn: null,
					renderedFrames,
					stitchStage: 'encoding',
				});
			},
			onStart: ({frameCount}) => {
				totalFrames = frameCount;
				return updateRenderProgress({
					encodedDoneIn: null,
					encodedFrames: 0,
					renderedDoneIn: null,
					renderedFrames: 0,
					stitchStage: 'encoding',
				});
			},
			outputDir,
			serveUrl,
			browser,
			dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
			envVariables,
			frameRange,
			parallelism,
			puppeteerInstance: openedBrowser,
			quality,
		});
		const doneIn = Date.now() - startTime;
		updateRenderProgress({
			encodedDoneIn: doneIn,
			encodedFrames: 0,
			renderedDoneIn: null,
			renderedFrames: totalFrames,
			stitchStage: 'encoding',
		});
		Log.info();
		Log.info();
		Log.info(chalk.green('\nYour image sequence is ready!'));
		return;
	}

	await renderMedia({
		absoluteOutputFile,
		browser,
		codec,
		config,
		crf,
		envVariables,
		ffmpegExecutable,
		frameRange,
		imageFormat,
		inputProps,
		onProgress: updateRenderProgress,
		openedBrowser,
		outputDir,
		overwrite,
		parallelism,
		pixelFormat,
		proResProfile,
		quality,
		serveUrl,
		onDownload: (src) => {
			Log.info('Downloading asset... ', src);
		},
		dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		onStart: ({frameCount}) => {
			totalFrames = frameCount;
		},
		parallelEncoding,
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
	close();
	Log.verbose('Cleaning up...');
	try {
		if (process.platform === 'win32') {
			// Properly delete directories because Windows doesn't seem to like fs.
			await deleteDirectory(outputDir);
			await deleteDirectory(bundled);
		} else {
			await Promise.all([
				(fs.promises.rm ?? fs.promises.rmdir)(outputDir, {
					recursive: true,
				}),
				(fs.promises.rm ?? fs.promises.rmdir)(bundled, {
					recursive: true,
				}),
			]);
		}
	} catch (err) {
		Log.warn('Could not clean up directory.');
		Log.warn(err);
		Log.warn('Do you have minimum required Node.js version?');
	}

	Log.info(chalk.green('\nYour video is ready!'));
};
