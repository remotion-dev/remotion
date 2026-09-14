import fs from 'node:fs';
import {join} from 'node:path';
import {
	makeCancelSignal,
	renderMedia,
	RenderInternals,
} from '@remotion/renderer';
import type {
	Bitrate,
	ChromiumOptions,
	ResolvedFrameRange,
} from '@remotion/renderer';
import type {
	CloudProvider,
	ProviderSpecifics,
	ServerlessPayload,
	VideoConfig,
} from '@remotion/serverless-client';
import {ServerlessRoutines} from '@remotion/serverless-client';
import type {OnArtifactFromRenderer} from './artifact-registry';
import {startCancellationPolling} from './cancellation-polling';
import type {LaunchedBrowser} from './get-browser-instance';
import {onDownloadsHelper} from './on-downloads-helpers';
import type {OverallProgressHelper} from './overall-render-progress';
import type {InsideFunctionSpecifics} from './provider-implementation';

export const renderWithSingleFunction = async <Provider extends CloudProvider>({
	params,
	composition,
	serializedInputPropsWithCustomSchema,
	frameRange,
	browserInstance,
	chromiumOptions,
	overallProgress,
	onArtifact,
	providerSpecifics,
	insideFunctionSpecifics,
}: {
	params: ServerlessPayload<Provider>;
	composition: VideoConfig;
	serializedInputPropsWithCustomSchema: string;
	frameRange: ResolvedFrameRange;
	browserInstance: LaunchedBrowser['instance'];
	chromiumOptions: ChromiumOptions;
	overallProgress: OverallProgressHelper<Provider>;
	onArtifact: OnArtifactFromRenderer;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
}): Promise<{
	outputFile: string;
	cleanup: () => Promise<void>;
}> => {
	if (params.type !== ServerlessRoutines.launch) {
		throw new Error('Expected launch type');
	}

	const outputDirectory = RenderInternals.tmpDir('remotion-direct-render-');
	const outputFile = join(
		outputDirectory,
		`output.${RenderInternals.getFileExtensionFromCodec(
			params.codec,
			params.audioCodec,
		)}`,
	);
	const cleanup = () =>
		fs.promises.rm(outputDirectory, {recursive: true, force: true});
	const frameCount = RenderInternals.getFramesToRender(
		frameRange,
		params.everyNthFrame,
	).length;
	const startedAt = Date.now();
	const {cancel, cancelSignal} = makeCancelSignal();
	const stopCancellationPolling = params.enableCancellation
		? startCancellationPolling({
				bucketName: params.bucketName,
				renderId: params.renderId,
				region: insideFunctionSpecifics.getCurrentRegionInFunction(),
				providerSpecifics,
				forcePathStyle: params.forcePathStyle,
				intervalInMilliseconds: 1000,
				logLevel: params.logLevel,
				onCancelled: cancel,
			})
		: () => undefined;

	try {
		await renderMedia({
			composition,
			serveUrl: params.serveUrl,
			codec: params.codec,
			outputLocation: outputFile,
			inputProps: JSON.parse(serializedInputPropsWithCustomSchema) as Record<
				string,
				unknown
			>,
			imageFormat: params.imageFormat,
			frameRange,
			concurrency: params.concurrencyPerFunction,
			puppeteerInstance: browserInstance,
			jpegQuality: params.jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
			envVariables: params.envVariables ?? {},
			logLevel: params.logLevel,
			crf: params.crf,
			pixelFormat: params.pixelFormat ?? undefined,
			proResProfile: params.proResProfile ?? undefined,
			x264Preset: params.x264Preset,
			gopSize: params.gopSize ?? null,
			onDownload: onDownloadsHelper(params.logLevel),
			overwrite: true,
			chromiumOptions,
			scale: params.scale,
			timeoutInMilliseconds: params.timeoutInMilliseconds,
			everyNthFrame: params.everyNthFrame,
			numberOfGifLoops: params.numberOfGifLoops,
			muted: params.muted,
			enforceAudioTrack: true,
			audioBitrate: params.audioBitrate as Bitrate | null,
			videoBitrate: params.videoBitrate as Bitrate | null,
			encodingBufferSize: params.encodingBufferSize as Bitrate | null,
			encodingMaxRate: params.encodingMaxRate as Bitrate | null,
			audioCodec: params.audioCodec,
			preferLossless: params.preferLossless,
			browserExecutable: providerSpecifics.getChromiumPath(),
			cancelSignal: params.enableCancellation ? cancelSignal : undefined,
			disallowParallelEncoding: false,
			offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
			colorSpace: params.colorSpace ?? undefined,
			repro: false,
			binariesDirectory: null,
			onBrowserDownload: () => {
				throw new Error('Should not download a browser in Lambda');
			},
			onArtifact: (artifact) => {
				const registration = onArtifact({
					artifact,
					chunk: 0,
					attempt: 1,
				});
				if (registration.type === 'conflict') {
					throw new Error(
						`The artifact filename ${artifact.filename} was emitted more than once. https://remotion.dev/docs/artifacts`,
					);
				}
			},
			metadata: params.metadata,
			hardwareAcceleration: 'disable',
			chromeMode: 'headless-shell',
			offthreadVideoThreads: params.offthreadVideoThreads,
			mediaCacheSizeInBytes: params.mediaCacheSizeInBytes,
			licenseKey: null,
			isProduction: false,
			sampleRate: params.sampleRate,
			onProgress: ({renderedFrames, encodedFrames}) => {
				overallProgress.setFrames({
					index: 0,
					rendered: renderedFrames,
					encoded: encodedFrames,
				});
			},
		});

		overallProgress.setFrames({
			index: 0,
			rendered: frameCount,
			encoded: frameCount,
		});
		overallProgress.addChunkCompleted(0, startedAt, Date.now());
		overallProgress.setCombinedFrames(frameCount);

		return {outputFile, cleanup};
	} catch (err) {
		await cleanup();
		throw err;
	} finally {
		stopCancellationPolling();
	}
};
