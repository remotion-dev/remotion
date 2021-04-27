import {bundle, cacheExists, clearCache} from '@remotion/bundler';
import {
	ensureLocalBrowser,
	ffmpegHasFeature,
	getActualConcurrency,
	getCompositions,
	getFfmpegVersion,
	OnStartData,
	openBrowser,
	renderFrames,
	stitchFramesToVideo,
	validateFfmpeg,
} from '@remotion/renderer';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Config, Internals} from 'remotion';
import {getFinalOutputCodec} from 'remotion/dist/config/codec';
import {getCompositionId} from './get-composition-id';
import {getConfigFileName} from './get-config-file-name';
import {getOutputFilename} from './get-filename';
import {getInputProps} from './get-input-props';
import {getImageFormat} from './image-formats';
import {loadConfigFile} from './load-config';
import {Log} from './log';
import {parseCommandLine, parsedCli} from './parse-command-line';
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

	const codec = getFinalOutputCodec({
		codec: userCodec,
		fileExtension: getUserPassedFileExtension(),
		emitWarning: true,
	});

	const ffmpegVersion = await getFfmpegVersion();
	Log.Verbose(
		'Your FFMPEG version:',
		ffmpegVersion ? ffmpegVersion.join('.') : 'Built from source'
	);
	warnAboutFfmpegVersion(ffmpegVersion);
	if (codec === 'vp8' && !(await ffmpegHasFeature('enable-libvpx'))) {
		Log.Error(
			"The Vp8 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-lipvpx flag."
		);
		Log.Error(
			'This does not work, please switch out your FFMPEG binary or choose a different codec.'
		);
	}
	if (codec === 'h265' && !(await ffmpegHasFeature('enable-gpl'))) {
		Log.Error(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-gpl flag."
		);
		Log.Error(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}
	if (codec === 'h265' && !(await ffmpegHasFeature('enable-libx265'))) {
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
	const browserInstance = openBrowser(browser, {
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
		await validateFfmpeg();
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
		await ensureLocalBrowser(browser);
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
	process.stdout.write(`📦 (1/${steps}) Bundling video...\n`);

	const bundlingProgress = new cliProgress.Bar(
		{
			clearOnComplete: true,
			format: '[{bar}] {percentage}%',
		},
		cliProgress.Presets.shades_grey
	);

	const shouldCache = Internals.getWebpackCaching();
	const cacheExistedBefore = cacheExists('production', null);
	if (cacheExistedBefore && !shouldCache) {
		process.stdout.write('🧹 Cache disabled but found. Deleting... ');
		await clearCache('production', null);
		process.stdout.write('done. \n');
	}
	bundlingProgress.start(100, 0);
	const bundled = await bundle(
		fullPath,
		(progress) => {
			bundlingProgress.update(progress);
		},
		{
			enableCaching: shouldCache,
		}
	);
	bundlingProgress.stop();
	Log.Verbose('Bundled under', bundled);
	const cacheExistedAfter = cacheExists('production', null);
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

	const renderProgress = new cliProgress.Bar(
		{
			clearOnComplete: true,
			etaBuffer: 50,
			format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
		},
		cliProgress.Presets.shades_grey
	);
	const {assetsInfo, frameCount} = await renderFrames({
		config,
		onFrameUpdate: (frame: number) => renderProgress.update(frame),
		parallelism,
		compositionId,
		outputDir,
		onStart: ({frameCount: fc}: OnStartData) => {
			process.stdout.write(
				`📼 (2/${steps}) Rendering frames (${getActualConcurrency(
					parallelism
				)}x concurrency)...\n`
			);
			renderProgress.start(fc, 0);
		},
		inputProps,
		webpackBundle: bundled,
		imageFormat,
		quality,
		browser,
		frameRange: frameRange ?? null,
		assetsOnly: Internals.isAudioCodec(codec),
		dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		puppeteerInstance: openedBrowser,
	});

	const closeBrowserPromise = openedBrowser.close();
	renderProgress.stop();
	if (process.env.DEBUG) {
		Internals.perf.logPerf();
	}
	if (!shouldOutputImageSequence) {
		process.stdout.write(`🧵 (3/${steps}) Stitching frames together...\n`);
		if (typeof crf !== 'number') {
			throw TypeError('CRF is unexpectedly not a number');
		}
		const stitchingProgress = new cliProgress.Bar(
			{
				clearOnComplete: true,
				etaBuffer: 50,
				format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
			},
			cliProgress.Presets.shades_grey
		);
		stitchingProgress.start(frameCount, 0);
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
				stitchingProgress.update(frame);
			},
			onDownload: (src: string) => {
				Log.Info('\n');
				Log.Info('Downloading asset... ', src);
			},
			verbose: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		});
		stitchingProgress.stop();

		Log.Info('Cleaning up...');
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
	Log.Info(
		[
			'\n- Total render time:',
			Math.round((Date.now() - startTime) / 1000),
			'second(s)',
		].join(' ')
	);
	Log.Info('-', outputFile, 'can be found in:');
	Log.Info(chalk.cyan(`  ▶️ ${absoluteOutputFile}`));
	await closeBrowserPromise;
};
