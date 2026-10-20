import type {
	BrowserLog,
	CancelSignal,
	ChromiumOptions,
	HeadlessBrowser,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	CloudProvider,
	OnStream,
	ProviderSpecifics,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {
	getImageSequenceFrameKey,
	serializeArtifact,
	ServerlessRoutines,
} from '@remotion/serverless-client';
import {onDownloadsHelper} from './on-downloads-helpers';
import type {InsideFunctionSpecifics} from './provider-implementation';

export const renderImageSequenceChunk = async <Provider extends CloudProvider>({
	params,
	browser,
	chromiumOptions,
	serializedInputProps,
	serializedResolvedProps,
	expectedBucketOwner,
	onStream,
	logs,
	cancelSignal,
	providerSpecifics,
	insideFunctionSpecifics,
}: {
	params: ServerlessPayload<Provider>;
	browser: HeadlessBrowser;
	chromiumOptions: ChromiumOptions;
	serializedInputProps: string;
	serializedResolvedProps: string;
	expectedBucketOwner: string | null;
	onStream: OnStream<Provider>;
	logs: BrowserLog[];
	cancelSignal: CancelSignal | null;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
}) => {
	if (
		params.type !== ServerlessRoutines.renderer ||
		params.output.type !== 'sequence'
	) {
		throw new Error('Expected an image sequence renderer payload');
	}

	const {output} = params;
	const start = Date.now();
	await onStream({type: 'lambda-invoked', payload: {attempt: params.attempt}});
	const uploadedFrames = new Set<number>();
	let sizeInBytes = 0;
	let progressQueue = Promise.resolve();
	const artifactUploads: Promise<void>[] = [];
	let artifactError: Error | null = null;
	// Each worker awaits its uploads before freeing a browser page. This bounds
	// the number of image buffers to concurrencyPerLambda.
	await RenderInternals.internalRenderFrames({
		composition: {
			id: params.composition,
			width: params.width,
			height: params.height,
			fps: params.fps,
			durationInFrames: params.durationInFrames,
			defaultCodec: null,
			defaultOutName: null,
			defaultPixelFormat: null,
			defaultVideoImageFormat: null,
			defaultProResProfile: null,
			defaultSampleRate: null,
		},
		webpackBundleOrServeUrl: params.serveUrl,
		serializedInputPropsWithCustomSchema: serializedInputProps,
		serializedResolvedPropsWithCustomSchema: serializedResolvedProps,
		puppeteerInstance: browser,
		chromiumOptions,
		outputDir: null,
		imageFormat: output.imageFormat,
		jpegQuality: params.jpegQuality ?? 80,
		frameRange: params.frameRange,
		frames: null,
		everyNthFrame: params.everyNthFrame,
		outputFramesInSequence: false,
		envVariables: params.envVariables ?? {},
		concurrency: params.concurrencyPerLambda,
		scale: params.scale,
		timeoutInMilliseconds: params.timeoutInMilliseconds,
		cancelSignal: cancelSignal ?? undefined,
		muted: true,
		logLevel: params.logLevel,
		indent: false,
		onStart: null,
		onFrameUpdate: null,
		onFrameBuffer: async (buffer, frame) => {
			await providerSpecifics.writeFile({
				bucketName: output.bucketName,
				key: getImageSequenceFrameKey({...output, frame}),
				body: new Uint8Array(
					buffer.buffer,
					buffer.byteOffset,
					buffer.byteLength,
				),
				region: insideFunctionSpecifics.getCurrentRegionInFunction(),
				privacy: params.privacy,
				expectedBucketOwner,
				downloadBehavior: output.downloadBehavior,
				customCredentials: output.customCredentials,
				forcePathStyle: params.forcePathStyle,
				storageClass: output.storageClass,
				requestHandler: null,
			});
			if (!uploadedFrames.has(frame)) {
				uploadedFrames.add(frame);
				sizeInBytes += buffer.length;
			}

			if (uploadedFrames.size % params.progressEveryNthFrame === 0) {
				const uploaded = uploadedFrames.size;
				const size = sizeInBytes;
				progressQueue = progressQueue.then(async () => {
					await onStream({
						type: 'frames-rendered',
						payload: {rendered: uploaded, encoded: 0},
					});
					await onStream({
						type: 'frames-uploaded',
						payload: {uploaded, sizeInBytes: size},
					});
				});
				await progressQueue;
			}
		},
		onFrame: null,
		remotionSharedMemory: null,
		onArtifact: (artifact) => {
			artifactUploads.push(
				onStream({
					type: 'artifact-emitted',
					payload: {artifact: serializeArtifact(artifact)},
				}).catch((err) => {
					artifactError ??= err as Error;
				}),
			);
		},
		onDownload: onDownloadsHelper(params.logLevel),
		onBrowserLog: (log) => logs.push(log),
		onBrowserDownload: () => {
			throw new Error('Should not download a browser in a function');
		},
		browserExecutable: null,
		port: null,
		server: undefined,
		parallelEncodingEnabled: false,
		compositionStart: params.compositionStart,
		forSeamlessAacConcatenation: false,
		binariesDirectory: null,
		chromeMode: 'headless-shell',
		offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
		offthreadVideoThreads: params.offthreadVideoThreads,
		mediaCacheSizeInBytes: params.mediaCacheSizeInBytes,
		imageSequencePattern: null,
		sampleRate: params.sampleRate,
		onLog: RenderInternals.defaultOnLog,
	});
	await progressQueue;
	await Promise.all(artifactUploads);
	if (artifactError !== null) {
		throw artifactError;
	}

	const expectedFrames = RenderInternals.getFramesToRender(
		params.frameRange,
		params.everyNthFrame,
	).length;
	if (uploadedFrames.size !== expectedFrames) {
		throw new Error(
			`Expected ${expectedFrames} uploaded frames, got ${uploadedFrames.size}`,
		);
	}

	await onStream({
		type: 'frames-rendered',
		payload: {rendered: uploadedFrames.size, encoded: 0},
	});
	await onStream({
		type: 'frames-uploaded',
		payload: {uploaded: uploadedFrames.size, sizeInBytes},
	});
	await onStream({
		type: 'chunk-complete',
		payload: {start, rendered: Date.now()},
	});
};
