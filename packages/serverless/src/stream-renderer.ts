import {createWriteStream, writeFileSync} from 'fs';
import {pipeline} from 'node:stream/promises';
import {join} from 'path';
import type {EmittedArtifact, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	CloudProvider,
	OnMessage,
	ProviderSpecifics,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {
	deserializeArtifact,
	parseS3RendererStatus,
	rendererTransportStatusKey,
	ServerlessRoutines,
	streamToString,
} from '@remotion/serverless-client';
import type {OverallProgressHelper} from './overall-render-progress';
import type {InsideFunctionSpecifics} from './provider-implementation';
import {artifactFromS3} from './s3-renderer-output';

type StreamRendererResponse =
	| {
			type: 'success';
	  }
	| {
			type: 'error';
			error: string;
			shouldRetry: boolean;
	  };

const streamRenderer = <Provider extends CloudProvider>({
	payload,
	functionName,
	outdir,
	overallProgress,
	files,
	logLevel,
	onArtifact,
	providerSpecifics,
	insideFunctionSpecifics,
	requestHandler,
}: {
	payload: ServerlessPayload<Provider>;
	functionName: string;
	outdir: string;
	overallProgress: OverallProgressHelper<Provider>;
	files: string[];
	logLevel: LogLevel;
	onArtifact: (asset: EmittedArtifact) => {alreadyExisted: boolean};
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
	requestHandler: Provider['requestHandler'] | null;
	expectedBucketOwner: string;
}) => {
	if (payload.type !== ServerlessRoutines.renderer) {
		throw new Error('Expected renderer type');
	}

	return new Promise<StreamRendererResponse>((resolve) => {
		const receivedStreamingPayload: OnMessage<Provider> = ({message}) => {
			if (message.type === 'lambda-invoked') {
				overallProgress.setLambdaInvoked(payload.chunk);
				return;
			}

			if (message.type === 'frames-rendered') {
				overallProgress.setFrames({
					index: payload.chunk,
					encoded: message.payload.encoded,
					rendered: message.payload.rendered,
				});
				return;
			}

			if (message.type === 'video-chunk-rendered') {
				const filename = join(
					outdir,
					`chunk:${String(payload.chunk).padStart(8, '0')}:video`,
				);
				writeFileSync(filename, new Uint8Array(message.payload));
				files.push(filename);
				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`Received video chunk for chunk ${payload.chunk}`,
				);

				return;
			}

			if (message.type === 'audio-chunk-rendered') {
				const filename = join(
					outdir,
					`chunk:${String(payload.chunk).padStart(8, '0')}:audio`,
				);

				writeFileSync(filename, new Uint8Array(message.payload));
				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`Received audio chunk for chunk ${payload.chunk}`,
				);
				files.push(filename);
				return;
			}

			if (message.type === 'chunk-complete') {
				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`Finished chunk ${payload.chunk}`,
				);
				overallProgress.addChunkCompleted(
					payload.chunk,
					message.payload.start,
					message.payload.rendered,
				);
				return;
			}

			if (message.type === 'artifact-emitted') {
				const artifact = deserializeArtifact(message.payload.artifact);
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`Received artifact on frame ${message.payload.artifact.frame}:`,
					artifact.filename,
					artifact.content.length + 'bytes.',
				);
				const {alreadyExisted} = onArtifact(artifact);
				if (alreadyExisted) {
					return resolve({
						type: 'error',
						error: `Chunk ${payload.chunk} emitted an asset filename ${message.payload.artifact.filename} at frame ${message.payload.artifact.frame} but there is already another artifact with the same name. https://remotion.dev/docs/artifacts`,
						shouldRetry: false,
					});
				}

				return;
			}

			if (message.type === 'error-occurred') {
				overallProgress.addErrorWithoutUpload(message.payload.errorInfo);
				overallProgress.setFrames({
					encoded: 0,
					index: payload.chunk,
					rendered: 0,
				});

				RenderInternals.Log.error(
					{
						indent: false,
						logLevel,
					},
					`Renderer function of chunk ${payload.chunk} failed with error: ${message.payload.error}`,
				);
				RenderInternals.Log.error(
					{
						indent: false,
						logLevel,
					},
					`Will retry chunk = ${message.payload.shouldRetry}`,
				);

				resolve({
					type: 'error',
					error: message.payload.error,
					shouldRetry: message.payload.shouldRetry,
				});
				return;
			}

			throw new Error(`Unknown message type ${message.type}`);
		};

		providerSpecifics
			.callFunctionStreaming({
				functionName,
				payload,
				retriesRemaining: 1,
				region: insideFunctionSpecifics.getCurrentRegionInFunction(),
				timeoutInTest: 12000,
				type: ServerlessRoutines.renderer,
				receivedStreamingPayload,
				requestHandler,
			})
			.then(() => {
				resolve({
					type: 'success',
				});
			})
			.catch((err) => {
				const shouldRetry =
					(err as Error).stack?.includes('Error: aborted') ||
					(err as Error).stack?.includes('ETIMEDOUT') ||
					(err as Error).stack?.includes('socket hang up') ||
					(err as Error).stack?.includes('ECONNRESET') ||
					false;

				resolve({
					type: 'error',
					error: (err as Error).stack as string,
					shouldRetry,
				});
			});
	});
};

const wait = (duration: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, duration));

const isMissingObjectError = (err: unknown) => {
	const error = err as {name?: string; Code?: string; code?: string};
	return (
		error.name === 'NoSuchKey' ||
		error.name === 'NotFound' ||
		error.Code === 'NoSuchKey' ||
		error.code === 'NoSuchKey'
	);
};

const readStreamAsBytes = async (
	stream: NodeJS.ReadableStream,
): Promise<Uint8Array> => {
	const chunks: Uint8Array[] = [];
	for await (const chunk of stream) {
		chunks.push(
			typeof chunk === 'string'
				? new TextEncoder().encode(chunk)
				: new Uint8Array(chunk),
		);
	}

	const size = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
	const result = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.byteLength;
	}

	return result;
};

const s3Renderer = async <Provider extends CloudProvider>({
	payload,
	functionName,
	outdir,
	overallProgress,
	files,
	logLevel,
	onArtifact,
	providerSpecifics,
	insideFunctionSpecifics,
	requestHandler,
	expectedBucketOwner,
}: {
	payload: ServerlessPayload<Provider>;
	functionName: string;
	outdir: string;
	overallProgress: OverallProgressHelper<Provider>;
	files: string[];
	logLevel: LogLevel;
	onArtifact: (asset: EmittedArtifact) => {alreadyExisted: boolean};
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
	requestHandler: Provider['requestHandler'] | null;
	expectedBucketOwner: string;
}): Promise<StreamRendererResponse> => {
	if (payload.type !== ServerlessRoutines.renderer) {
		throw new Error('Expected renderer type');
	}

	const region = insideFunctionSpecifics.getCurrentRegionInFunction();
	try {
		await providerSpecifics.callFunctionAsync({
			functionName,
			payload,
			region,
			timeoutInTest: 12000,
			type: ServerlessRoutines.renderer,
			requestHandler,
		});
	} catch (err) {
		return {
			type: 'error',
			error: (err as Error).stack ?? (err as Error).message,
			shouldRetry: providerSpecifics.isFlakyError(err as Error),
		};
	}

	const statusKey = rendererTransportStatusKey({
		renderId: payload.renderId,
		chunk: payload.chunk,
		attempt: payload.attempt,
	});
	let lastRendered = 0;
	let lastEncoded = 0;
	let lambdaInvoked = false;
	let pollingInterval = 250;
	const timeoutTimestamp = overallProgress.get().timeoutTimestamp - 1000;

	while (Date.now() < timeoutTimestamp) {
		try {
			const statusStream = await providerSpecifics.readFile({
				bucketName: payload.bucketName,
				key: statusKey,
				region,
				expectedBucketOwner,
				forcePathStyle: payload.forcePathStyle,
				requestHandler,
			});
			const status = parseS3RendererStatus({
				value: JSON.parse(await streamToString(statusStream)),
				expectedChunk: payload.chunk,
				expectedAttempt: payload.attempt,
			});

			if (status.lambdaInvoked && !lambdaInvoked) {
				lambdaInvoked = true;
				overallProgress.setLambdaInvoked(payload.chunk);
			}

			if (
				status.renderedFrames > lastRendered ||
				status.encodedFrames > lastEncoded
			) {
				lastRendered = Math.max(lastRendered, status.renderedFrames);
				lastEncoded = Math.max(lastEncoded, status.encodedFrames);
				overallProgress.setFrames({
					index: payload.chunk,
					rendered: lastRendered,
					encoded: lastEncoded,
				});
			}

			if (status.state === 'failed') {
				overallProgress.addErrorWithoutUpload(status.errorInfo);
				overallProgress.setFrames({
					encoded: 0,
					index: payload.chunk,
					rendered: 0,
				});
				await providerSpecifics
					.deleteFile({
						bucketName: payload.bucketName,
						key: statusKey,
						region,
						customCredentials: null,
						forcePathStyle: payload.forcePathStyle,
						requestHandler,
					})
					.catch(() => undefined);
				return {
					type: 'error',
					error: status.errorInfo.stack,
					shouldRetry: status.shouldRetry,
				};
			}

			if (status.state === 'completed') {
				const downloadedKeys: string[] = [];
				const emittedArtifacts: EmittedArtifact[] = [];
				for (const artifact of status.artifacts) {
					let artifactStream;
					try {
						artifactStream = await providerSpecifics.readFile({
							bucketName: payload.bucketName,
							key: artifact.key,
							region,
							expectedBucketOwner,
							forcePathStyle: payload.forcePathStyle,
							requestHandler,
						});
					} catch (err) {
						if (isMissingObjectError(err)) {
							throw new Error(
								`Renderer completed manifest references missing artifact object ${artifact.key}`,
							);
						}

						throw err;
					}

					emittedArtifacts.push(
						artifactFromS3({
							metadata: artifact.metadata,
							content: await readStreamAsBytes(artifactStream),
						}),
					);
					downloadedKeys.push(artifact.key);
				}

				const downloadedFiles: string[] = [];
				for (const [type, key] of [
					['video', status.videoKey],
					['audio', status.audioKey],
				] as const) {
					if (!key) {
						continue;
					}

					const filename = join(
						outdir,
						`chunk:${String(payload.chunk).padStart(8, '0')}:${type}`,
					);
					let media;
					try {
						media = await providerSpecifics.readFile({
							bucketName: payload.bucketName,
							key,
							region,
							expectedBucketOwner,
							forcePathStyle: payload.forcePathStyle,
							requestHandler,
						});
					} catch (err) {
						if (isMissingObjectError(err)) {
							throw new Error(
								`Renderer completed manifest references missing media object ${key}`,
							);
						}

						throw err;
					}

					await pipeline(media, createWriteStream(filename));
					downloadedFiles.push(filename);
					downloadedKeys.push(key);
				}

				for (const emittedArtifact of emittedArtifacts) {
					const {alreadyExisted} = onArtifact(emittedArtifact);
					if (alreadyExisted) {
						return {
							type: 'error',
							error: `Chunk ${payload.chunk} emitted an asset filename ${emittedArtifact.filename} at frame ${emittedArtifact.frame} but there is already another artifact with the same name. https://remotion.dev/docs/artifacts`,
							shouldRetry: false,
						};
					}
				}

				files.push(...downloadedFiles);
				overallProgress.addChunkCompleted(
					payload.chunk,
					status.startedAt,
					status.completedAt,
				);
				for (const key of [...downloadedKeys, statusKey]) {
					await providerSpecifics
						.deleteFile({
							bucketName: payload.bucketName,
							key,
							region,
							customCredentials: null,
							forcePathStyle: payload.forcePathStyle,
							requestHandler,
						})
						.catch((err) => {
							RenderInternals.Log.warn(
								{indent: false, logLevel},
								`Could not clean up renderer transport object ${key}`,
								err,
							);
						});
				}

				return {type: 'success'};
			}
		} catch (err) {
			if (
				!isMissingObjectError(err) &&
				!providerSpecifics.isFlakyError(err as Error)
			) {
				return {
					type: 'error',
					error: (err as Error).stack ?? (err as Error).message,
					shouldRetry: false,
				};
			}
		}

		await wait(pollingInterval);
		pollingInterval = Math.min(2000, Math.round(pollingInterval * 1.5));
	}

	return {
		type: 'error',
		error: `Renderer chunk ${payload.chunk}, attempt ${payload.attempt} did not publish a status before the launcher deadline. Logs: ${providerSpecifics.getLoggingUrlForRendererFunction(
			{
				region,
				functionName,
				rendererFunctionName: functionName,
				renderId: payload.renderId,
				chunk: payload.chunk,
			},
		)}`,
		shouldRetry: false,
	};
};

export const renderRendererFunctionWithRetry = async <
	Provider extends CloudProvider,
>({
	payload,
	files,
	functionName,
	outdir,
	overallProgress,
	logLevel,
	onArtifact,
	providerSpecifics,
	insideFunctionSpecifics,
	requestHandler,
	expectedBucketOwner,
}: {
	payload: ServerlessPayload<Provider>;
	functionName: string;
	outdir: string;
	overallProgress: OverallProgressHelper<Provider>;
	files: string[];
	logLevel: LogLevel;
	onArtifact: (asset: EmittedArtifact) => {alreadyExisted: boolean};
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
	requestHandler: Provider['requestHandler'] | null;
	expectedBucketOwner: string;
}): Promise<unknown> => {
	if (payload.type !== ServerlessRoutines.renderer) {
		throw new Error('Expected renderer type');
	}

	const transport = providerSpecifics.getRendererFunctionTransport(
		insideFunctionSpecifics.getCurrentRegionInFunction(),
	);
	const result = await (transport === 's3' ? s3Renderer : streamRenderer)({
		files,
		functionName,
		outdir,
		overallProgress,
		payload,
		logLevel,
		onArtifact,
		providerSpecifics,
		insideFunctionSpecifics,
		requestHandler,
		expectedBucketOwner,
	});

	if (result.type === 'error') {
		if (!result.shouldRetry || payload.retriesLeft <= 0) {
			throw new Error(result.error);
		}

		overallProgress.addRetry({
			attempt: payload.attempt + 1,
			time: Date.now(),
			chunk: payload.chunk,
		});

		return renderRendererFunctionWithRetry({
			files,
			functionName,
			outdir,
			overallProgress,
			payload: {
				...payload,
				attempt: payload.attempt + 1,
				retriesLeft: payload.retriesLeft - 1,
			},
			logLevel,
			onArtifact,
			providerSpecifics,
			insideFunctionSpecifics,
			requestHandler,
			expectedBucketOwner,
		});
	}
};
