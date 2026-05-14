import {statSync} from 'fs';
import type {InternalRenderMediaOptions} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';

type RenderVideoConfig = {
	compositionId: string;
	inputProps: Record<string, unknown>;
	outputLocation: InternalRenderMediaOptions['outputLocation'];
	serveUrl: InternalRenderMediaOptions['serveUrl'];
	crf: InternalRenderMediaOptions['crf'];
	imageFormat: InternalRenderMediaOptions['imageFormat'];
	pixelFormat: InternalRenderMediaOptions['pixelFormat'];
	envVariables: InternalRenderMediaOptions['envVariables'];
	frameRange: InternalRenderMediaOptions['frameRange'];
	everyNthFrame: InternalRenderMediaOptions['everyNthFrame'];
	proResProfile: NonNullable<
		InternalRenderMediaOptions['proResProfile']
	> | null;
	chromiumOptions: InternalRenderMediaOptions['chromiumOptions'];
	scale: InternalRenderMediaOptions['scale'];
	browserExecutable: InternalRenderMediaOptions['browserExecutable'];
	preferLossless: InternalRenderMediaOptions['preferLossless'];
	enforceAudioTrack: InternalRenderMediaOptions['enforceAudioTrack'];
	disallowParallelEncoding: InternalRenderMediaOptions['disallowParallelEncoding'];
	concurrency: InternalRenderMediaOptions['concurrency'];
	binariesDirectory: InternalRenderMediaOptions['binariesDirectory'];
	metadata: InternalRenderMediaOptions['metadata'];
	licenseKey: InternalRenderMediaOptions['licenseKey'];
	codec: InternalRenderMediaOptions['codec'];
	videoBitrate: InternalRenderMediaOptions['videoBitrate'];
	audioBitrate: InternalRenderMediaOptions['audioBitrate'];
	encodingMaxRate: InternalRenderMediaOptions['encodingMaxRate'];
	encodingBufferSize: InternalRenderMediaOptions['encodingBufferSize'];
	muted: InternalRenderMediaOptions['muted'];
	numberOfGifLoops: InternalRenderMediaOptions['numberOfGifLoops'];
	x264Preset: InternalRenderMediaOptions['x264Preset'];
	colorSpace: InternalRenderMediaOptions['colorSpace'];
	jpegQuality: InternalRenderMediaOptions['jpegQuality'];
	audioCodec: InternalRenderMediaOptions['audioCodec'];
	logLevel: InternalRenderMediaOptions['logLevel'];
	timeoutInMilliseconds: InternalRenderMediaOptions['timeoutInMilliseconds'];
	forSeamlessAacConcatenation: InternalRenderMediaOptions['forSeamlessAacConcatenation'];
	separateAudioTo: InternalRenderMediaOptions['separateAudioTo'];
	hardwareAcceleration: InternalRenderMediaOptions['hardwareAcceleration'];
	chromeMode: InternalRenderMediaOptions['chromeMode'];
	offthreadVideoCacheSizeInBytes: InternalRenderMediaOptions['offthreadVideoCacheSizeInBytes'];
	mediaCacheSizeInBytes: InternalRenderMediaOptions['mediaCacheSizeInBytes'];
	offthreadVideoThreads: InternalRenderMediaOptions['offthreadVideoThreads'];
	repro: InternalRenderMediaOptions['repro'];
	sampleRate: InternalRenderMediaOptions['sampleRate'];
};

const config: RenderVideoConfig = JSON.parse(process.argv[2]);

const noop = () => undefined;

try {
	const serializedInputProps = NoReactInternals.serializeJSONWithSpecialTypes({
		data: config.inputProps,
		indent: undefined,
		staticBase: null,
	}).serializedString;

	console.log(JSON.stringify({stage: 'opening-browser', overallProgress: 0}));

	const browser = await RenderInternals.internalOpenBrowser({
		browser: 'chrome',
		browserExecutable: config.browserExecutable,
		chromiumOptions: config.chromiumOptions,
		forceDeviceScaleFactor: undefined,
		viewport: null,
		indent: false,
		logLevel: config.logLevel,
		onBrowserDownload: () => ({
			version: null,
			onProgress: noop,
		}),
		chromeMode: config.chromeMode,
	});

	console.log(
		JSON.stringify({stage: 'selecting-composition', overallProgress: 0.02}),
	);

	const {metadata: composition} =
		await RenderInternals.internalSelectComposition({
			serializedInputPropsWithCustomSchema: serializedInputProps,
			envVariables: config.envVariables,
			puppeteerInstance: browser,
			onBrowserLog: null,
			browserExecutable: config.browserExecutable,
			chromiumOptions: config.chromiumOptions,
			port: null,
			indent: false,
			server: undefined,
			serveUrl: config.serveUrl,
			id: config.compositionId,
			onServeUrlVisited: noop,
			logLevel: config.logLevel,
			timeoutInMilliseconds: config.timeoutInMilliseconds,
			binariesDirectory: config.binariesDirectory,
			onBrowserDownload: () => ({
				version: null,
				onProgress: noop,
			}),
			chromeMode: config.chromeMode,
			mediaCacheSizeInBytes: config.mediaCacheSizeInBytes,
			offthreadVideoCacheSizeInBytes: config.offthreadVideoCacheSizeInBytes,
			offthreadVideoThreads: config.offthreadVideoThreads,
		});

	const serializedResolvedProps =
		NoReactInternals.serializeJSONWithSpecialTypes({
			data: composition.props,
			indent: undefined,
			staticBase: null,
		}).serializedString;

	const {contentType} = await RenderInternals.internalRenderMedia({
		outputLocation: config.outputLocation,
		composition,
		serializedInputPropsWithCustomSchema: serializedInputProps,
		serializedResolvedPropsWithCustomSchema: serializedResolvedProps,
		serveUrl: config.serveUrl,
		codec: config.codec,
		crf: config.crf,
		imageFormat: config.imageFormat,
		pixelFormat: config.pixelFormat,
		envVariables: config.envVariables,
		frameRange: config.frameRange,
		everyNthFrame: config.everyNthFrame,
		overwrite: true,
		proResProfile: config.proResProfile ?? undefined,
		chromiumOptions: config.chromiumOptions,
		scale: config.scale,
		browserExecutable: config.browserExecutable,
		preferLossless: config.preferLossless,
		enforceAudioTrack: config.enforceAudioTrack,
		disallowParallelEncoding: config.disallowParallelEncoding,
		concurrency: config.concurrency,
		binariesDirectory: config.binariesDirectory,
		metadata: config.metadata,
		licenseKey: config.licenseKey,
		videoBitrate: config.videoBitrate,
		audioBitrate: config.audioBitrate,
		encodingMaxRate: config.encodingMaxRate,
		encodingBufferSize: config.encodingBufferSize,
		muted: config.muted,
		numberOfGifLoops: config.numberOfGifLoops,
		x264Preset: config.x264Preset,
		colorSpace: config.colorSpace,
		jpegQuality: config.jpegQuality,
		audioCodec: config.audioCodec,
		logLevel: config.logLevel,
		timeoutInMilliseconds: config.timeoutInMilliseconds,
		forSeamlessAacConcatenation: config.forSeamlessAacConcatenation,
		separateAudioTo: config.separateAudioTo,
		hardwareAcceleration: config.hardwareAcceleration,
		chromeMode: config.chromeMode,
		offthreadVideoCacheSizeInBytes: config.offthreadVideoCacheSizeInBytes,
		mediaCacheSizeInBytes: config.mediaCacheSizeInBytes,
		offthreadVideoThreads: config.offthreadVideoThreads,
		repro: config.repro,
		sampleRate: config.sampleRate,
		// Non-serializable fields with defaults
		puppeteerInstance: browser,
		onProgress: (progress) => {
			console.log(
				JSON.stringify({
					stage: 'render-progress',
					progress: {
						renderedFrames: progress.renderedFrames,
						encodedFrames: progress.encodedFrames,
						encodedDoneIn: progress.encodedDoneIn,
						renderedDoneIn: progress.renderedDoneIn,
						renderEstimatedTime: progress.renderEstimatedTime,
						progress: progress.progress,
						stitchStage: progress.stitchStage,
					},
					overallProgress: 0.04 + progress.progress * 0.96,
				}),
			);
		},
		onDownload: () => undefined,
		onBrowserLog: null,
		onStart: noop,
		port: null,
		cancelSignal: undefined,
		onCtrlCExit: noop,
		indent: false,
		server: undefined,
		ffmpegOverride: undefined,
		compositionStart: 0,
		onArtifact: null,
		onLog: RenderInternals.defaultOnLog,
		isProduction: true,
		onBrowserDownload: () => ({
			version: null,
			onProgress: noop,
		}),
	});

	console.log(JSON.stringify({stage: 'render-complete', overallProgress: 1}));
	await browser.close({silent: false});

	const {size} = statSync(config.outputLocation ?? '/tmp/video.mp4');
	console.log(
		JSON.stringify({stage: 'done', size, contentType, overallProgress: 1}),
	);
} catch (err) {
	console.error((err as Error).message);
	process.exit(1);
}
