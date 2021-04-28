import {bundle, BundlerInternals} from '@remotion/bundler';
import {
	getCompositions,
	OnStartData,
	renderFrames,
	RenderInternals,
	stitchFramesToVideo,
} from '@remotion/renderer';
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Config, Internals} from 'remotion';
import {getCompositionId} from './get-composition-id';
import {getConfigFileName} from './get-config-file-name';
import {getOutputFilename} from './get-filename';
import {getInputProps} from './get-input-props';
import {getImageFormat} from './image-formats';
import {loadConfigFile} from './load-config';
import {Log} from './log';
import {parseCommandLine, parsedCli} from './parse-command-line';
import {
	createProgressBar,
	makeBundlingProgress,
	makeRenderingProgress,
	makeStitchingProgres,
} from './progress-bar';
import {getUserPassedFileExtension} from './user-passed-output-location';
import {warnAboutFfmpegVersion} from './warn-about-ffmpeg-version';

export const render = async () => {
	const startTime = Date.now();
	const file = parsedCli._[1];
	const fullPath = path.join(process.cwd(), file);

	const configFileName = getConfigFileName();
	const appliedName = loadConfigFile(configFileName);
	parseCommandLine();
	if (appliedName) {
		Log.Verbose(`Applied configuration from ${appliedName}.`);
	}
	const parallelism = Internals.getConcurrency();
	const frameRange = Internals.getRange();
	if (typeof frameRange === 'number') {
		Log.Warn('Selected a single frame. Assuming you want to output an image.');
		Log.Warn(
			`If you want to render a video, pass a range:  '--frames=${frameRange}-${frameRange}'.`
		);
		Log.Warn("To dismiss this message, add the '--sequence' flag explicitly.");
		Config.Output.setImageSequence(true);
	}
	const shouldOutputImageSequence = Internals.getShouldOutputImageSequence();
	const userCodec = Internals.getOutputCodecOrUndefined();

	const codec = Internals.getFinalOutputCodec({
		codec: userCodec,
		fileExtension: getUserPassedFileExtension(),
		emitWarning: true,
	});

	const ffmpegVersion = await RenderInternals.getFfmpegVersion();
	Log.Verbose(
		'Your FFMPEG version:',
		ffmpegVersion ? ffmpegVersion.join('.') : 'Built from source'
	);
	warnAboutFfmpegVersion(ffmpegVersion);
	if (
		codec === 'vp8' &&
		!(await RenderInternals.ffmpegHasFeature('enable-libvpx'))
	) {
		Log.Error(
			"The Vp8 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-lipvpx flag."
		);
		Log.Error(
			'This does not work, please switch out your FFMPEG binary or choose a different codec.'
		);
	}
	if (
		codec === 'h265' &&
		!(await RenderInternals.ffmpegHasFeature('enable-gpl'))
	) {
		Log.Error(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-gpl flag."
		);
		Log.Error(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}
	if (
		codec === 'h265' &&
		!(await RenderInternals.ffmpegHasFeature('enable-libx265'))
	) {
		Log.Error(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-libx265 flag."
		);
		Log.Error(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}

	const outputFile = getOutputFilename(codec, shouldOutputImageSequence);
	const overwrite = Internals.getShouldOverwrite();
	const inputProps = getInputProps();
	const quality = Internals.getQuality();
	const browser = Internals.getBrowser() ?? Internals.DEFAULT_BROWSER;
	const browserInstance = RenderInternals.openBrowser(browser, {
		shouldDumpIo: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
	});

	const absoluteOutputFile = path.resolve(process.cwd(), outputFile);
	if (fs.existsSync(absoluteOutputFile) && !overwrite) {
		Log.Error(
			`File at ${absoluteOutputFile} already exists. Use --overwrite to overwrite.`
		);
		process.exit(1);
	}
	if (!shouldOutputImageSequence) {
		await RenderInternals.validateFfmpeg();
	}
	const crf = shouldOutputImageSequence ? null : Internals.getActualCrf(codec);
	if (crf !== null) {
		Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	}
	const pixelFormat = Internals.getPixelFormat();
	const imageFormat = getImageFormat(
		shouldOutputImageSequence ? undefined : codec
	);

	Internals.validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);
	Internals.validateSelectedPixelFormatAndImageFormatCombination(
		pixelFormat,
		imageFormat
	);
	try {
		await RenderInternals.ensureLocalBrowser(browser);
	} catch (err) {
		Log.Error('Could not download a browser for rendering frames.');
		Log.Error(err);
		process.exit(1);
	}
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
	const bundlingProgress = createProgressBar('');
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
	Log.Verbose('Bundled under', bundled);
	const cacheExistedAfter = BundlerInternals.cacheExists('production', null);
	if (cacheExistedAfter && !cacheExistedBefore) {
		Log.Info('⚡️ Cached bundle. Subsequent builds will be faster.');
	}
	const openedBrowser = await browserInstance;
	const comps = await getCompositions(bundled, {
		browser: Internals.getBrowser() || Internals.DEFAULT_BROWSER,
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

	Log.Verbose('Output dir', outputDir);

	const renderProgress = createProgressBar('');
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
	if (!shouldOutputImageSequence) {
		if (typeof crf !== 'number') {
			throw TypeError('CRF is unexpectedly not a number');
		}
		const stitchingProgress = createProgressBar(
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
				Log.Info('Downloading asset... ', src);
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

		Log.Verbose('Cleaning up...');
		try {
			await Promise.all([
				fs.promises.rmdir(outputDir, {
					recursive: true,
				}),
				fs.promises.rmdir(bundled, {
					recursive: true,
				}),
			]);
		} catch (err) {
			Log.Error('Could not clean up directory.');
			Log.Error(err);
			Log.Error('Do you have minimum required Node.js version?');
			process.exit(1);
		}
		Log.Info(chalk.green('\n✅ Your video is ready!'));
	} else {
		Log.Info(chalk.green('\n✅ Your image sequence is ready!'));
	}
	const seconds = Math.round((Date.now() - startTime) / 1000);
	Log.Info(
		[
			'- Total render time:',
			seconds,
			seconds === 1 ? 'second' : 'seconds',
		].join(' ')
	);
	Log.Info('-', outputFile, 'can be found in:');
	Log.Info(chalk.cyan(`▶️ ${absoluteOutputFile}`));
	await closeBrowserPromise;
};
