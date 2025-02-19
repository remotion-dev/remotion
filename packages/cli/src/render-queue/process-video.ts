import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {JobProgressCallback, RenderJob} from '@remotion/studio-server';
import {getRendererPortFromConfigFile} from '../config/preview-server';
import {convertEntryPointToServeUrl} from '../convert-entry-point-to-serve-url';
import {getCliOptions} from '../get-cli-options';
import {parsedCli} from '../parsed-cli';
import {renderVideoFlow} from '../render-flows/render';

const {publicDirOption} = BrowserSafeApis.options;

export const processVideoJob = async ({
	job,
	remotionRoot,
	entryPoint,
	onProgress,
	addCleanupCallback,
	logLevel,
}: {
	job: RenderJob;
	remotionRoot: string;
	entryPoint: string;
	onProgress: JobProgressCallback;
	addCleanupCallback: (label: string, cb: () => void) => void;
	logLevel: LogLevel;
}) => {
	if (job.type !== 'video' && job.type !== 'sequence') {
		throw new Error('Expected video job');
	}

	const publicDir = publicDirOption.getValue({
		commandLine: parsedCli,
	}).value;

	const {browserExecutable, ffmpegOverride} = getCliOptions({
		isStill: true,
		logLevel,
		indent: true,
	});
	const fullEntryPoint = convertEntryPointToServeUrl(entryPoint);
	await renderVideoFlow({
		remotionRoot,
		browser: 'chrome',
		browserExecutable,
		chromiumOptions: job.chromiumOptions,
		entryPointReason: 'same as Studio',
		envVariables: job.envVariables,
		height: null,
		fullEntryPoint,
		serializedInputPropsWithCustomSchema:
			job.serializedInputPropsWithCustomSchema,
		overwrite: true,
		port: getRendererPortFromConfigFile(),
		publicDir,
		puppeteerTimeout: job.delayRenderTimeout,
		jpegQuality: job.jpegQuality ?? undefined,
		remainingArgs: [],
		scale: job.scale,
		width: null,
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
	});
};
