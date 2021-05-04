import {bundle, BundlerInternals} from '@remotion/bundler';
import {
	getCompositions,
	OnErrorInfo,
	OnStartData,
	renderFrames,
	RenderInternals,
	stitchFramesToVideo,
} from '@remotion/renderer';
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals} from 'remotion';
import {getCliOptions} from './get-cli-options';
import {getCompositionId} from './get-composition-id';
import {getConfigFileName} from './get-config-file-name';
import {loadConfigFile} from './load-config';
import {Log} from './log';
import {parseCommandLine, parsedCli} from './parse-command-line';
import {
	createProgressBar,
	makeBundlingProgress,
	makeRenderingProgress,
	makeStitchingProgres,
} from './progress-bar';
import {checkAndValidateFfmpegVersion} from './validate-ffmpeg-version';

const onError = async (info: OnErrorInfo) => {
	Log.error();
	if (info.frame === null) {
		Log.error(
			'The following error occured when trying to initialize the video rendering:'
		);
	} else {
		Log.error(
			`The following error occurred when trying to render frame ${info.frame}:`
		);
	}

	Log.error(info.error.message);
	if (info.error.message.includes('Could not play video with')) {
		Log.info();
		Log.info(
			'💡 Get help for this issue at https://remotion.dev/docs/media-playback-error.'
		);
	}

	if (info.error.message.includes('A delayRender was called')) {
		Log.info();
		Log.info(
			'💡 Get help for this issue at https://remotion.dev/docs/timeout.'
		);
	}

	process.exit(1);
};

export const render = async () => {
	const startTime = Date.now();
	const file = parsedCli._[1];
	const fullPath = path.join(process.cwd(), file);

	const configFileName = getConfigFileName();
	const appliedName = loadConfigFile(configFileName);
	parseCommandLine();
	if (appliedName) {
		Log.verbose(`Applied configuration from ${appliedName}.`);
	}

	const {
		codec,
		parallelism,
		frameRange,
		shouldOutputImageSequence,
		absoluteOutputFile,
		overwrite,
		inputProps,
		quality,
		browser,
		crf,
		pixelFormat,
		imageFormat,
	} = await getCliOptions();

	await checkAndValidateFfmpegVersion();

	const browserInstance = RenderInternals.openBrowser(browser, {
		shouldDumpIo: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
	});
	if (shouldOutputImageSequence) {
		fs.mkdirSync(absoluteOutputFile, {
			recursive: true,
		});
	}

	const steps = shouldOutputImageSequence ? 2 : 3;

	const shouldCache = Internals.getWebpackCaching();
	const cacheExistedBefore = BundlerInternals.cacheExists('production', null);
	if (cacheExistedBefore && !shouldCache) {
		process.stdout.write('🧹 Cache disabled but found. Deleting... ');
		await BundlerInternals.clearCache('production', null);
		process.stdout.write('done. \n');
	}

	const bundleStartTime = Date.now();
	const bundlingProgress = createProgressBar();
	const bundled = await bundle(
		fullPath,
		(progress) => {
			bundlingProgress.update(
				makeBundlingProgress({progress: progress / 100, steps, doneIn: null})
			);
		},
		{
			enableCaching: shouldCache,
		}
	);
	bundlingProgress.update(
		makeBundlingProgress({
			progress: 1,
			steps,
			doneIn: Date.now() - bundleStartTime,
		}) + '\n'
	);
	Log.verbose('Bundled under', bundled);
	const cacheExistedAfter = BundlerInternals.cacheExists('production', null);
	if (cacheExistedAfter && !cacheExistedBefore) {
		Log.info('⚡️ Cached bundle. Subsequent builds will be faster.');
	}

	const openedBrowser = await browserInstance;
	const comps = await getCompositions(bundled, {
		browser,
		inputProps,
		browserInstance: openedBrowser,
	});
	const compositionId = getCompositionId(comps);

	const config = comps.find((c) => c.id === compositionId);
	if (!config) {
		throw new Error(`Cannot find composition with ID ${compositionId}`);
	}

	const outputDir = shouldOutputImageSequence
		? absoluteOutputFile
		: await fs.promises.mkdtemp(path.join(os.tmpdir(), 'react-motion-render'));

	Log.verbose('Output dir', outputDir);

	const renderProgress = createProgressBar();
	let totalFrames = 0;
	const renderStart = Date.now();
	const {assetsInfo} = await renderFrames({
		config,
		onFrameUpdate: (frame: number) => {
			renderProgress.update(
				makeRenderingProgress({
					frames: frame,
					totalFrames,
					concurrency: RenderInternals.getActualConcurrency(parallelism),
					doneIn: null,
					steps,
				})
			);
		},
		parallelism,
		compositionId,
		outputDir,
		onError,
		onStart: ({frameCount: fc}: OnStartData) => {
			renderProgress.update(
				makeRenderingProgress({
					frames: 0,
					totalFrames: fc,
					concurrency: RenderInternals.getActualConcurrency(parallelism),
					doneIn: null,
					steps,
				})
			);
			totalFrames = fc;
		},
		inputProps,
		webpackBundle: bundled,
		imageFormat,
		quality,
		browser,
		frameRange: frameRange ?? null,
		dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		puppeteerInstance: openedBrowser,
	});

	const closeBrowserPromise = openedBrowser.close();
	renderProgress.update(
		makeRenderingProgress({
			frames: totalFrames,
			totalFrames,
			steps,
			concurrency: RenderInternals.getActualConcurrency(parallelism),
			doneIn: Date.now() - renderStart,
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

		const stitchingProgress = createProgressBar();

		stitchingProgress.update(
			makeStitchingProgres({
				doneIn: null,
				frames: 0,
				steps,
				totalFrames,
			})
		);
		const stitchStart = Date.now();
		await stitchFramesToVideo({
			dir: outputDir,
			width: config.width,
			height: config.height,
			fps: config.fps,
			outputLocation: absoluteOutputFile,
			force: overwrite,
			imageFormat,
			pixelFormat,
			codec,
			crf,
			assetsInfo,
			parallelism,
			onProgress: (frame: number) => {
				stitchingProgress.update(
					makeStitchingProgres({
						doneIn: null,
						frames: frame,
						steps,
						totalFrames,
					})
				);
			},
			onDownload: (src: string) => {
				Log.info('Downloading asset... ', src);
			},
			verbose: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		});
		stitchingProgress.update(
			makeStitchingProgres({
				doneIn: Date.now() - stitchStart,
				frames: totalFrames,
				steps,
				totalFrames,
			}) + '\n'
		);

		Log.verbose('Cleaning up...');
		try {
			await Promise.all([
				(fs.promises.rm ?? fs.promises.rmdir)(outputDir, {
					recursive: true,
				}),
				(fs.promises.rm ?? fs.promises.rmdir)(bundled, {
					recursive: true,
				}),
			]);
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
};
