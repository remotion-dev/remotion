import {randomUUID} from 'crypto';
import {stat, readFile, rename, writeFile} from 'fs/promises';
import type {InternalRenderMediaOptions} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {put} from '@vercel/blob';
import {NoReactInternals} from 'remotion/no-react';
import type {SandboxRenderMediaMessage, VercelBlobAccess} from '../types';

const PROGRESS_FILE = '/vercel/sandbox/progress.json';

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
	gopSize: InternalRenderMediaOptions['gopSize'];
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
	vercelBlob: {
		blobPath: string | null;
		access: VercelBlobAccess;
	} | null;
};

const config: RenderVideoConfig = JSON.parse(process.argv[2]);

const noop = () => undefined;
let progressWrite = Promise.resolve();

function getExtension(filePath: string): string {
	const lastDot = filePath.lastIndexOf('.');
	if (lastDot === -1) {
		return '';
	}

	return filePath.slice(lastDot);
}

const writeProgress = (message: SandboxRenderMediaMessage) => {
	const tmpFile = `${PROGRESS_FILE}.tmp`;
	progressWrite = progressWrite.then(async () => {
		await writeFile(tmpFile, JSON.stringify(message));
		await rename(tmpFile, PROGRESS_FILE);
	});

	return progressWrite;
};

const reportProgress = async (message: SandboxRenderMediaMessage) => {
	console.log(JSON.stringify(message));
	await writeProgress(message);
};

const uploadToVercelBlob = async ({
	sandboxFilePath,
	contentType,
	access,
	blobPath,
}: {
	sandboxFilePath: string;
	contentType: string;
	access: VercelBlobAccess;
	blobPath: string | null;
}): Promise<{url: string; size: number}> => {
	const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
	if (!blobToken) {
		throw new Error('BLOB_READ_WRITE_TOKEN is not set.');
	}

	const actualBlobPath =
		blobPath ?? `renders/${randomUUID()}${getExtension(sandboxFilePath)}`;
	const fileBuffer = await readFile(sandboxFilePath);
	const {size} = await stat(sandboxFilePath);
	const blob = await put(actualBlobPath, fileBuffer, {
		access,
		contentType,
		token: blobToken,
	});

	return {url: blob.downloadUrl, size};
};

try {
	const serializedInputProps = NoReactInternals.serializeJSONWithSpecialTypes({
		data: config.inputProps,
		indent: undefined,
		staticBase: null,
	}).serializedString;

	await reportProgress({stage: 'opening-browser', overallProgress: 0});

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

	await reportProgress({stage: 'selecting-composition', overallProgress: 0.02});

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
		gopSize: config.gopSize,
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
			reportProgress({
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
				overallProgress: 0.04 + progress.progress * 0.94,
			}).catch((error) => {
				console.error((error as Error).message);
			});
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

	await progressWrite;
	console.log(
		JSON.stringify({stage: 'render-complete', overallProgress: 0.98}),
	);
	await browser.close({silent: false});

	const sandboxFilePath = config.outputLocation ?? '/tmp/video.mp4';
	if (config.vercelBlob) {
		await reportProgress({stage: 'uploading', overallProgress: 0.99});
		const {url, size} = await uploadToVercelBlob({
			sandboxFilePath,
			contentType,
			access: config.vercelBlob.access,
			blobPath: config.vercelBlob.blobPath,
		});
		await reportProgress({
			stage: 'done',
			url,
			size,
			contentType,
			overallProgress: 1,
		});
	} else {
		const {size} = await stat(sandboxFilePath);
		await reportProgress({
			stage: 'done',
			size,
			contentType,
			overallProgress: 1,
		});
	}
} catch (err) {
	const message = (err as Error).message;
	await writeProgress({
		stage: 'error',
		message,
		overallProgress: 1,
	}).catch(() => undefined);
	console.error(message);
	process.exit(1);
}
