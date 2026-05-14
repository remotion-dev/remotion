import type {Sandbox} from '@vercel/sandbox';
import {REMOTION_SANDBOX_BUNDLE_DIR} from './internals/add-bundle';
import type {
	AudioCodec,
	Bitrate,
	ChromiumOptions,
	Codec,
	ColorSpace,
	FrameRange,
	HardwareAccelerationOption,
	LogLevel,
	PixelFormat,
	ProResProfile,
	RenderMediaOnVercelProgress,
	SandboxRenderMediaMessage,
	VideoImageFormat,
	X264Preset,
} from './types';

export async function renderMediaOnVercel({
	sandbox,
	compositionId,
	inputProps,
	onProgress,
	outputFile = '/tmp/video.mp4',
	codec = 'h264',
	crf,
	imageFormat,
	pixelFormat,
	envVariables = {},
	frameRange,
	everyNthFrame = 1,
	proResProfile,
	chromiumOptions = {},
	scale = 1,
	preferLossless = false,
	enforceAudioTrack = false,
	disallowParallelEncoding = false,
	concurrency,
	metadata,
	licenseKey,
	videoBitrate,
	audioBitrate,
	encodingMaxRate,
	encodingBufferSize,
	muted = false,
	numberOfGifLoops,
	x264Preset,
	colorSpace = 'default',
	jpegQuality = 80,
	audioCodec,
	logLevel = 'info',
	timeoutInMilliseconds = 30000,
	forSeamlessAacConcatenation = false,
	separateAudioTo,
	hardwareAcceleration = 'disable',
	offthreadVideoCacheSizeInBytes,
	mediaCacheSizeInBytes,
	offthreadVideoThreads,
	sampleRate,
}: {
	sandbox: Sandbox;
	compositionId: string;
	inputProps: Record<string, unknown>;
	onProgress?: (progress: RenderMediaOnVercelProgress) => Promise<void> | void;
	outputFile?: string;
	codec?: Codec;
	crf?: number | null;
	imageFormat?: VideoImageFormat | null;
	pixelFormat?: PixelFormat | null;
	envVariables?: Record<string, string>;
	frameRange?: FrameRange | null;
	everyNthFrame?: number;
	proResProfile?: ProResProfile;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
	preferLossless?: boolean;
	enforceAudioTrack?: boolean;
	disallowParallelEncoding?: boolean;
	concurrency?: number | string | null;
	metadata?: Record<string, string> | null;
	licenseKey?: string | null;
	videoBitrate?: Bitrate | null;
	audioBitrate?: Bitrate | null;
	encodingMaxRate?: Bitrate | null;
	encodingBufferSize?: Bitrate | null;
	muted?: boolean;
	numberOfGifLoops?: number | null;
	x264Preset?: X264Preset | null;
	colorSpace?: ColorSpace;
	jpegQuality?: number;
	audioCodec?: AudioCodec | null;
	logLevel?: LogLevel;
	timeoutInMilliseconds?: number;
	forSeamlessAacConcatenation?: boolean;
	separateAudioTo?: string | null;
	hardwareAcceleration?: HardwareAccelerationOption;
	offthreadVideoCacheSizeInBytes?: number | null;
	mediaCacheSizeInBytes?: number | null;
	offthreadVideoThreads?: number | null;
	sampleRate?: number;
}): Promise<{sandboxFilePath: string; contentType: string}> {
	const serveUrl = `/vercel/sandbox/${REMOTION_SANDBOX_BUNDLE_DIR}`;

	const renderConfig = {
		serveUrl,
		compositionId,
		inputProps,
		outputLocation: outputFile,
		codec,
		crf: crf ?? null,
		imageFormat: imageFormat ?? null,
		pixelFormat: pixelFormat ?? null,
		envVariables,
		frameRange: frameRange ?? null,
		everyNthFrame,
		proResProfile: proResProfile ?? null,
		chromiumOptions,
		scale,
		preferLossless,
		enforceAudioTrack,
		disallowParallelEncoding,
		concurrency: concurrency ?? null,
		metadata: metadata ?? null,
		licenseKey: licenseKey ?? null,
		videoBitrate: videoBitrate ?? null,
		audioBitrate: audioBitrate ?? null,
		encodingMaxRate: encodingMaxRate ?? null,
		encodingBufferSize: encodingBufferSize ?? null,
		muted,
		numberOfGifLoops: numberOfGifLoops ?? null,
		x264Preset: x264Preset ?? null,
		colorSpace,
		jpegQuality,
		audioCodec: audioCodec ?? null,
		logLevel,
		timeoutInMilliseconds,
		forSeamlessAacConcatenation,
		separateAudioTo: separateAudioTo ?? null,
		hardwareAcceleration,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
		mediaCacheSizeInBytes: mediaCacheSizeInBytes ?? null,
		offthreadVideoThreads: offthreadVideoThreads ?? null,
		chromeMode: 'headless-shell',
		browserExecutable: null,
		binariesDirectory: null,
		repro: false,
		sampleRate: sampleRate ?? 48000,
	};

	const renderCmd = await sandbox.runCommand({
		cmd: 'node',
		args: ['render-video.mjs', JSON.stringify(renderConfig)],
		detached: true,
	});

	let contentType: string = 'application/octet-stream';

	for await (const log of renderCmd.logs()) {
		if (log.stream === 'stdout') {
			try {
				const message: SandboxRenderMediaMessage = JSON.parse(log.data);
				if (message.stage === 'done') {
					contentType = message.contentType;
				} else if (
					message.stage === 'opening-browser' ||
					message.stage === 'selecting-composition' ||
					message.stage === 'render-progress'
				) {
					await onProgress?.(message);
				}
			} catch {
				// Not JSON, ignore
			}
		}
	}

	const renderResult = await renderCmd.wait();
	if (renderResult.exitCode !== 0) {
		const stderr = await renderResult.stderr();
		const stdout = await renderResult.stdout();
		throw new Error(`Render failed: ${stderr} ${stdout}`);
	}

	return {sandboxFilePath: outputFile, contentType};
}
