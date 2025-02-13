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
	ServerlessRoutines,
} from '@remotion/serverless-client';
import {writeFileSync} from 'fs';
import {join} from 'path';
import type {OverallProgressHelper} from './overall-render-progress';
import type {InsideFunctionSpecifics} from './provider-implementation';

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
				writeFileSync(filename, message.payload);
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

				writeFileSync(filename, message.payload);
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
			})
			.then(() => {
				resolve({
					type: 'success',
				});
			})
			.catch((err) => {
				const shouldRetry =
					(err as Error).stack?.includes('Error: aborted') ?? false;

				resolve({
					type: 'error',
					error: (err as Error).stack as string,
					shouldRetry,
				});
			});
	});
};

export const streamRendererFunctionWithRetry = async <
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
}): Promise<unknown> => {
	if (payload.type !== ServerlessRoutines.renderer) {
		throw new Error('Expected renderer type');
	}

	const result = await streamRenderer({
		files,
		functionName,
		outdir,
		overallProgress,
		payload,
		logLevel,
		onArtifact,
		providerSpecifics,
		insideFunctionSpecifics,
	});

	if (result.type === 'error') {
		if (!result.shouldRetry) {
			throw new Error(result.error);
		}

		overallProgress.addRetry({
			attempt: payload.attempt + 1,
			time: Date.now(),
			chunk: payload.chunk,
		});

		return streamRendererFunctionWithRetry({
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
		});
	}
};
