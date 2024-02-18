import type {InternalRenderMediaOptions, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactInternals} from 'remotion/no-react';
import {chalk} from './chalk';
import {registerCleanupJob} from './cleanup-before-quit';
import {ConfigInternals} from './config';
import {getRendererPortFromConfigFileAndCliFlag} from './config/preview-server';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {getFinalOutputCodec} from './get-final-output-codec';
import {getVideoImageFormat} from './image-formats';
import {Log} from './log';
import {makeProgressBar} from './make-progress-bar';
import {parsedCli, quietFlagProvided} from './parse-command-line';
import {createOverwriteableCliOutput} from './progress-bar';
import {bundleOnCliOrTakeServeUrl} from './setup-cache';
import {shouldUseNonOverlayingLogger} from './should-use-non-overlaying-logger';
import {showMultiCompositionsPicker} from './show-compositions-picker';
import {truthy} from './truthy';

const DEFAULT_RUNS = 3;

const {
	audioBitrateOption,
	x264Option,
	offthreadVideoCacheSizeInBytesOption,
	scaleOption,
	crfOption,
	jpegQualityOption,
	videoBitrateOption,
	enforceAudioOption,
	mutedOption,
} = BrowserSafeApis.options;

const getValidConcurrency = (cliConcurrency: number | string | null) => {
	const {concurrencies} = parsedCli;

	if (!concurrencies) {
		return [RenderInternals.getActualConcurrency(cliConcurrency)];
	}

	return (concurrencies as string)
		.split(',')
		.map((c) => parseInt(c.trim(), 10));
};

const runBenchmark = async (
	runs: number,
	options: Omit<InternalRenderMediaOptions, 'onProgress'>,
	onProgress?: (run: number, progress: number) => void,
) => {
	const timeTaken: number[] = [];
	for (let run = 0; run < runs; ++run) {
		const startTime = performance.now();
		await RenderInternals.internalRenderMedia({
			onProgress: ({progress}) => onProgress?.(run, progress),
			...options,
		});
		const endTime = performance.now();

		timeTaken.push(endTime - startTime);
	}

	return timeTaken;
};

const formatTime = (time: number) => {
	let ret = '';
	const hours = Math.floor(time / (60 * 60 * 1000));
	if (hours) {
		ret = `${hours}h`;
	}

	time %= 60 * 60 * 1000;
	const minutes = Math.floor(time / (60 * 1000));

	if (minutes) {
		ret = `${ret}${minutes}m`;
	}

	time %= 60 * 1000;
	const seconds = (time / 1000).toFixed(5);

	if (seconds) {
		ret = `${ret}${seconds}s`;
	}

	return ret;
};

const avg = (time: number[]) =>
	time.reduce((prev, curr) => prev + curr) / time.length;

const stdDev = (time: number[]) => {
	const mean = avg(time);
	return Math.sqrt(
		time.map((x) => (x - mean) ** 2).reduce((a, b) => a + b) / time.length,
	);
};

const getResults = (results: number[], runs: number) => {
	const mean = avg(results);
	const dev = stdDev(results);
	const max = Math.max(...results);
	const min = Math.min(...results);

	return `    Time (${chalk.green('mean')} ± ${chalk.green(
		'σ',
	)}):         ${chalk.green(formatTime(mean))} ± ${chalk.green(
		formatTime(dev),
	)}\n    Range (${chalk.blue('min')} ... ${chalk.red(
		'max',
	)}):     ${chalk.blue(formatTime(min))} ... ${chalk.red(
		formatTime(max),
	)} \t ${chalk.gray(`${runs} runs`)}
	`;
};

type BenchmarkProgressBarOptions = {
	totalRuns: number;
	run: number;
	progress: number;
	doneIn: string | null;
};

const makeBenchmarkProgressBar = ({
	totalRuns,
	run,
	progress,
	doneIn,
}: BenchmarkProgressBarOptions) => {
	const totalProgress = (run + progress) / totalRuns;

	return [
		`Rendering (${run + 1} out of ${totalRuns} runs)`,
		makeProgressBar(totalProgress),
		doneIn === null
			? `${(totalProgress * 100).toFixed(2)}% `
			: chalk.gray(doneIn),
	].join(' ');
};

export const benchmarkCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	const runs: number = parsedCli.runs ?? DEFAULT_RUNS;

	const {file, reason, remainingArgs} = findEntryPoint(
		args,
		remotionRoot,
		logLevel,
	);

	if (!file) {
		Log.error('No entry file passed.');
		Log.infoAdvanced(
			{indent: false, logLevel},
			'Pass an additional argument specifying the entry file',
		);
		Log.infoAdvanced({indent: false, logLevel});
		Log.infoAdvanced(
			{indent: false, logLevel},
			`$ remotion benchmark <entry file>`,
		);
		process.exit(1);
	}

	const fullEntryPoint = convertEntryPointToServeUrl(file);

	const {
		inputProps,
		envVariables,
		browserExecutable,
		chromiumOptions,
		puppeteerTimeout,
		publicDir,
		proResProfile,
		frameRange: defaultFrameRange,
		overwrite,
		pixelFormat,
		numberOfGifLoops,
		everyNthFrame,
		ffmpegOverride,
		encodingMaxRate,
		encodingBufferSize,
		height,
		width,
		concurrency: unparsedConcurrency,
		colorSpace,
	} = getCliOptions({
		isLambda: false,
		type: 'series',
		remotionRoot,
		logLevel,
	});

	Log.verbose(
		{indent: false, logLevel},
		'Entry point:',
		fullEntryPoint,
		'reason:',
		reason,
	);

	const scale = scaleOption.getValue({commandLine: parsedCli}).value;

	const browserInstance = RenderInternals.internalOpenBrowser({
		browser: 'chrome',
		browserExecutable,
		chromiumOptions,
		forceDeviceScaleFactor: scale,
		indent: false,
		viewport: null,
		logLevel,
	});

	const {urlOrBundle: bundleLocation, cleanup: cleanupBundle} =
		await bundleOnCliOrTakeServeUrl({
			fullPath: fullEntryPoint,
			publicDir,
			remotionRoot,
			onProgress: () => undefined,
			indentOutput: false,
			logLevel: ConfigInternals.Logging.getLogLevel(),
			bundlingStep: 0,
			steps: 1,
			onDirectoryCreated: (dir) => {
				registerCleanupJob(() => RenderInternals.deleteDirectory(dir));
			},
			quietProgress: false,
			quietFlag: quietFlagProvided(),
			outDir: null,
			// Not needed for benchmark
			gitSource: null,
			bufferStateDelayInMilliseconds: null,
			maxTimlineTracks: null,
		});

	registerCleanupJob(() => cleanupBundle());

	const puppeteerInstance = await browserInstance;

	const serializedInputPropsWithCustomSchema =
		NoReactInternals.serializeJSONWithDate({
			data: inputProps ?? {},
			indent: undefined,
			staticBase: null,
		}).serializedString;

	const comps = await RenderInternals.internalGetCompositions({
		serveUrlOrWebpackUrl: bundleLocation,
		serializedInputPropsWithCustomSchema,
		envVariables,
		chromiumOptions,
		timeoutInMilliseconds: puppeteerTimeout,
		port: getRendererPortFromConfigFileAndCliFlag(),
		puppeteerInstance,
		browserExecutable,
		indent: false,
		onBrowserLog: null,
		//  Intentionally disabling server to not cache results
		server: undefined,
		logLevel,
		offthreadVideoCacheSizeInBytes:
			offthreadVideoCacheSizeInBytesOption.getValue({
				commandLine: parsedCli,
			}).value,
	});

	const ids = (
		remainingArgs[0]
			? remainingArgs[0]
					.split(',')
					.map((c) => c.trim())
					.filter(truthy)
			: await showMultiCompositionsPicker(comps)
	) as string[];

	const compositions = ids.map((compId) => {
		const composition = comps.find((c) => c.id === compId);

		if (!composition) {
			throw new Error(`No composition with the ID "${compId}" found.`);
		}

		return composition;
	});

	if (compositions.length === 0) {
		Log.error(
			'No composition IDs passed. Add another argument to the command specifying at least 1 composition ID.',
		);
	}

	const benchmark: Record<string, Record<string, number[]>> = {};

	let count = 1;

	const x264Preset = x264Option.getValue({commandLine: parsedCli}).value;
	const audioBitrate = audioBitrateOption.getValue({
		commandLine: parsedCli,
	}).value;
	const configFileCrf = crfOption.getValue({commandLine: parsedCli}).value;
	const jpegQuality = jpegQualityOption.getValue({
		commandLine: parsedCli,
	}).value;
	const videoBitrate = videoBitrateOption.getValue({
		commandLine: parsedCli,
	}).value;
	const enforceAudioTrack = enforceAudioOption.getValue({
		commandLine: parsedCli,
	}).value;
	const muted = mutedOption.getValue({commandLine: parsedCli}).value;

	for (const composition of compositions) {
		const {codec, reason: codecReason} = getFinalOutputCodec({
			cliFlag: parsedCli.codec,
			downloadName: null,
			outName: null,
			configFile: ConfigInternals.getOutputCodecOrUndefined() ?? null,
			uiCodec: null,
			compositionCodec: composition.defaultCodec ?? null,
		});
		const concurrency = getValidConcurrency(unparsedConcurrency);

		benchmark[composition.id] = {};
		for (const con of concurrency) {
			const benchmarkProgress = createOverwriteableCliOutput({
				quiet: quietFlagProvided(),
				cancelSignal: null,
				updatesDontOverwrite: shouldUseNonOverlayingLogger({logLevel}),
				indent: false,
			});
			Log.infoAdvanced({indent: false, logLevel});
			Log.infoAdvanced(
				{indent: false, logLevel},
				`${chalk.bold(`Benchmark #${count++}:`)} ${chalk.gray(
					`composition=${composition.id} concurrency=${con} codec=${codec} (${codecReason})`,
				)}`,
			);

			const timeTaken = await runBenchmark(
				runs,
				{
					outputLocation: null,
					composition: {
						...composition,
						width: width ?? composition.width,
						height: height ?? composition.height,
					},
					crf: configFileCrf ?? null,
					envVariables,
					frameRange: defaultFrameRange,
					imageFormat: getVideoImageFormat({
						codec,
						uiImageFormat: null,
					}),
					serializedInputPropsWithCustomSchema,
					overwrite,
					pixelFormat,
					proResProfile,
					x264Preset,
					jpegQuality,
					chromiumOptions,
					timeoutInMilliseconds: ConfigInternals.getCurrentPuppeteerTimeout(),
					scale,
					port: getRendererPortFromConfigFileAndCliFlag(),
					numberOfGifLoops,
					everyNthFrame,
					logLevel,
					muted,
					enforceAudioTrack,
					browserExecutable,
					ffmpegOverride,
					serveUrl: bundleLocation,
					codec,
					audioBitrate,
					videoBitrate,
					encodingMaxRate,
					encodingBufferSize,
					puppeteerInstance,
					concurrency: con,
					audioCodec: null,
					cancelSignal: undefined,
					disallowParallelEncoding: false,
					indent: false,
					onBrowserLog: null,
					onCtrlCExit: () => undefined,
					onDownload: () => undefined,
					onStart: () => undefined,
					preferLossless: false,
					server: undefined,
					serializedResolvedPropsWithCustomSchema:
						NoReactInternals.serializeJSONWithDate({
							data: composition.props,
							indent: undefined,
							staticBase: null,
						}).serializedString,
					offthreadVideoCacheSizeInBytes:
						offthreadVideoCacheSizeInBytesOption.getValue({
							commandLine: parsedCli,
						}).value,
					colorSpace,
					repro: false,
					finishRenderProgress: () => undefined,
				},
				(run, progress) => {
					benchmarkProgress.update(
						makeBenchmarkProgressBar({
							totalRuns: runs,
							run,
							doneIn: null,
							progress,
						}),
						false,
					);
				},
			);

			benchmarkProgress.update('', false);
			benchmarkProgress.update(getResults(timeTaken, runs), false);

			benchmark[composition.id][`${con}`] = timeTaken;
		}
	}

	Log.infoAdvanced({indent: false, logLevel});
};
