import {
	getCompositions,
	OnStartData,
	renderFrames,
	RenderInternals,
	stitchFramesToVideo,
} from '@remotion/renderer';
import chalk from 'chalk';
import {ExecaChildProcess} from 'execa';
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

	if (shouldOutputImageSequence) {
		fs.mkdirSync(absoluteOutputFile, {
			recursive: true,
		});
	}

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
	let totalFrames = 0;
	const renderStart = Date.now();

	let stitcherFfmpeg: ExecaChildProcess<string> | undefined;
	let preStitcher;
	let encodedFrames: number | null = null;
	let renderedFrames = 0;
	let preEncodedFileLocation: string | undefined;
	const updateRenderProgress = () =>
		renderProgress.update(
			makeRenderingAndStitchingProgress({
				rendering: {
					frames: renderedFrames,
					totalFrames,
					concurrency: RenderInternals.getActualConcurrency(parallelism),
					doneIn: null,
					steps,
				},
				stitching: {
					doneIn: null,
					frames: encodedFrames ?? 0,
					stage: 'encoding',
					steps,
					totalFrames,
				},
			})
		);
	if (parallelEncoding) {
		if (typeof crf !== 'number') {
			throw new TypeError('CRF is unexpectedly not a number');
		}

		preEncodedFileLocation = path.join(
			outputDir,
			'pre-encode.' + getUserPassedFileExtension()
		);

		preStitcher = await RenderInternals.spawnFfmpeg({
			dir: outputDir,
			width: config.width,
			height: config.height,
			fps: config.fps,
			outputLocation: preEncodedFileLocation,
			force: true,
			imageFormat,
			pixelFormat,
			codec,
			proResProfile,
			crf,
			parallelism,
			onProgress: (frame: number) => {
				encodedFrames = frame;
				updateRenderProgress();
			},
			verbose: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
			parallelEncoding,
			webpackBundle: bundled,
			ffmpegExecutable,
			assetsInfo: {assets: []},
		});
		stitcherFfmpeg = preStitcher.task;
	}

	const renderer = renderFrames({
		config,
		onFrameUpdate: (frame: number) => {
			renderedFrames = frame;
			updateRenderProgress();
		},
		parallelism,
		parallelEncoding,
		outputDir,
		onStart: ({frameCount: fc}: OnStartData) => {
			renderedFrames = 0;
			if (parallelEncoding) encodedFrames = 0;
			totalFrames = fc;
			updateRenderProgress();
		},
		inputProps,
		envVariables,
		imageFormat,
		quality,
		browser,
		frameRange: frameRange ?? null,
		puppeteerInstance: openedBrowser,
		writeFrame: async (buffer) => {
			stitcherFfmpeg?.stdin?.write(buffer);
		},
		serveUrl,
	});
	const {assetsInfo} = await renderer;
	if (stitcherFfmpeg) {
		stitcherFfmpeg?.stdin?.end();
		await stitcherFfmpeg;
		preStitcher?.cleanup?.();
	}

	const closeBrowserPromise = openedBrowser.close();
	const finalizedRenderProgress = {
		frames: totalFrames,
		totalFrames,
		steps,
		concurrency: RenderInternals.getActualConcurrency(parallelism),
		doneIn: Date.now() - renderStart,
	};
	renderProgress.update(
		makeRenderingAndStitchingProgress({
			rendering: finalizedRenderProgress,
			stitching: {
				doneIn: null,
				frames: encodedFrames ?? 0,
				steps: 0,
				stage: 'encoding',
				totalFrames,
			},
		}) + '\n'
	);
	if (process.env.DEBUG) {
		Internals.perf.logPerf();
	}

	if (shouldOutputImageSequence) {
		Log.info(chalk.green('\nYour image sequence is ready!'));
	} else {
		if (typeof crf !== 'number') {
			throw new TypeError('CRF is unexpectedly not a number');
		}

		const dirName = path.dirname(absoluteOutputFile);

		if (!fs.existsSync(dirName)) {
			fs.mkdirSync(dirName, {
				recursive: true,
			});
		}

		const stitchStart = Date.now();
		await stitchFramesToVideo({
			dir: outputDir,
			width: config.width,
			height: config.height,
			fps: config.fps,
			outputLocation: absoluteOutputFile,
			preEncodedFileLocation,
			force: overwrite,
			imageFormat,
			pixelFormat,
			codec,
			proResProfile,
			crf,
			assetsInfo,
			parallelism,
			ffmpegExecutable,
			onProgress: (frame: number) => {
				makeRenderingAndStitchingProgress({
					rendering: finalizedRenderProgress,
					stitching: {
						doneIn: null,
						frames: frame,
						steps,
						totalFrames,
						stage: 'encoding',
					},
				});
			},
			onDownload: (src: string) => {
				Log.info('Downloading asset... ', src);
			},
			webpackBundle: bundled,
			verbose: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		});
		renderProgress.update(
			makeRenderingAndStitchingProgress({
				rendering: finalizedRenderProgress,

				stitching: {
					doneIn: Date.now() - stitchStart,
					frames: totalFrames,
					steps,
					totalFrames,
					stage: 'muxing',
				},
			}) + '\n'
		);

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
	await closeBrowserPromise;
	close();
};
