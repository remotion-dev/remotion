import {
	getCompositions,
	renderFrames,
	RenderInternals,
	renderVideo,
	RenderVideoOnProgress,
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
import {getUserPassedFileExtension} from './user-passed-output-location';
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
		parallelEncoding,
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
	const totalFrames = config.durationInFrames;
	const updateRenderProgress: RenderVideoOnProgress = ({
		encodedFrames,
		renderedFrames,
		encodedDoneIn,
		renderedDoneIn,
		stitchStage,
	}) =>
		renderProgress.update(
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
			// TODO
			onFrameUpdate: () => void 0,
			// TODO
			onStart: () => void 0,
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
	} else {
		await renderVideo({
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
			parallelEncoding,
			parallelism,
			pixelFormat,
			proResProfile,
			quality,
			serveUrl,
			fileExtension: getUserPassedFileExtension(),
			bundled,
			onDownload: (src) => {
				Log.info('Downloading asset... ', src);
			},
			dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		});
	}

	Log.info();
	Log.info();
	const seconds = Math.round((Date.now() - startTime) / 1000);
	if (shouldOutputImageSequence) {
		Log.info(chalk.green('\nYour image sequence is ready!'));
	} else {
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
	}
};
