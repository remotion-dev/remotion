import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {JobProgressCallback, RenderJob} from '@remotion/studio-server';
import {convertEntryPointToServeUrl} from '../convert-entry-point-to-serve-url';
import {getCliOptions} from '../get-cli-options';
import {parsedCli} from '../parsed-cli';
import {renderVideoFlow} from '../render-flows/render';
import type {StudioRenderJobFixedConfig} from './studio-render-job-fixed-config';

const {
	askAIOption,
	keyboardShortcutsOption,
	browserExecutableOption,
	bundleCacheOption,
	sampleRateOption,
} = BrowserSafeApis.options;

export const processVideoJob = async ({
	job,
	remotionRoot,
	entryPoint,
	onProgress,
	addCleanupCallback,
	logLevel,
	fixedConfig,
}: {
	job: RenderJob;
	remotionRoot: string;
	entryPoint: string;
	onProgress: JobProgressCallback;
	addCleanupCallback: (label: string, cb: () => void) => void;
	logLevel: LogLevel;
	fixedConfig: StudioRenderJobFixedConfig;
}) => {
	if (job.type !== 'video' && job.type !== 'sequence') {
		throw new Error('Expected video job');
	}

	const askAIEnabled = askAIOption.getValue({commandLine: parsedCli}).value;
	const keyboardShortcutsEnabled = keyboardShortcutsOption.getValue({
		commandLine: parsedCli,
	}).value;
	const shouldCache = bundleCacheOption.getValue({
		commandLine: parsedCli,
	}).value;

	const {ffmpegOverride} = getCliOptions({
		isStill: true,
		logLevel,
		indent: true,
	});
	const browserExecutable = browserExecutableOption.getValue({
		commandLine: parsedCli,
	}).value;
	const sampleRate =
		job.type === 'video'
			? job.sampleRate
			: sampleRateOption.getValue({commandLine: parsedCli}).value;
	const fullEntryPoint = convertEntryPointToServeUrl(entryPoint);

	await renderVideoFlow({
		remotionRoot,
		sampleRate,
		browser: 'chrome',
		browserExecutable,
		chromiumOptions: job.chromiumOptions,
		entryPointReason: 'same as Studio',
		envVariables: job.envVariables,
		height: null,
		width: null,
		fps: null,
		durationInFrames: null,
		fullEntryPoint,
		serializedInputPropsWithCustomSchema:
			job.serializedInputPropsWithCustomSchema,
		overwrite: true,
		port: fixedConfig.rendererPort,
		publicDir: fixedConfig.publicDir,
		puppeteerTimeout: job.delayRenderTimeout,
		jpegQuality: job.jpegQuality ?? undefined,
		remainingArgs: [],
		scale: job.scale,
		compositionIdFromUi: job.compositionId,
		logLevel: job.logLevel,
		onProgress,
		indent: true,
		concurrency: job.concurrency,
		everyNthFrame: job.type === 'video' ? job.everyNthFrame : 1,
		frameRange: [job.startFrame, job.endFrame],
		quiet: false,
		shouldOutputImageSequence: job.type === 'sequence',
		addCleanupCallback,
		outputLocationFromUI: job.outName,
		uiCodec: job.type === 'video' ? job.codec : null,
		uiImageFormat: job.imageFormat,
		cancelSignal: job.cancelToken.cancelSignal,
		crf: job.type === 'video' ? job.crf : null,
		gopSize: job.type === 'video' ? job.gopSize : null,
		ffmpegOverride,
		audioBitrate: job.type === 'video' ? job.audioBitrate : null,
		muted: job.type === 'video' ? job.muted : true,
		enforceAudioTrack: job.type === 'video' ? job.enforceAudioTrack : false,
		proResProfile:
			job.type === 'video' ? (job.proResProfile ?? undefined) : undefined,
		x264Preset: job.type === 'video' ? (job.x264Preset ?? null) : null,
		pixelFormat: job.type === 'video' ? job.pixelFormat : 'yuv420p',
		videoBitrate: job.type === 'video' ? job.videoBitrate : null,
		encodingBufferSize: job.type === 'video' ? job.encodingBufferSize : null,
		encodingMaxRate: job.type === 'video' ? job.encodingMaxRate : null,
		numberOfGifLoops: job.type === 'video' ? job.numberOfGifLoops : null,
		audioCodec: job.type === 'video' ? job.audioCodec : null,
		disallowParallelEncoding:
			job.type === 'video' ? job.disallowParallelEncoding : false,
		offthreadVideoCacheSizeInBytes: job.offthreadVideoCacheSizeInBytes,
		colorSpace: job.type === 'video' ? job.colorSpace : null,
		repro: job.repro,
		binariesDirectory: job.binariesDirectory,
		forSeamlessAacConcatenation:
			job.type === 'video' ? job.forSeamlessAacConcatenation : false,
		separateAudioTo: job.type === 'video' ? job.separateAudioTo : null,
		publicPath: null,
		metadata: job.metadata,
		hardwareAcceleration:
			job.type === 'video' ? job.hardwareAcceleration : 'disable',
		chromeMode: job.chromeMode,
		offthreadVideoThreads: job.offthreadVideoThreads,
		mediaCacheSizeInBytes: job.mediaCacheSizeInBytes,
		audioLatencyHint: null,
		imageSequencePattern: null,
		askAIEnabled,
		keyboardShortcutsEnabled,
		rspack: fixedConfig.rspack,
		shouldCache,
		bundlerOverride: fixedConfig.bundlerOverride,
		rspackOverride: fixedConfig.rspackOverride,
		webpackOverride: fixedConfig.webpackOverride,
	});
};
