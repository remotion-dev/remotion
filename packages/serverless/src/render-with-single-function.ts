import {rename} from 'node:fs/promises';
import {join} from 'node:path';
import type {
	CloudProvider,
	ProviderSpecifics,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {
	deserializeArtifact,
	ServerlessRoutines,
} from '@remotion/serverless-client';
import type {OnArtifactFromRenderer} from './artifact-registry';
import type {RequestContext} from './handlers/renderer';
import {rendererHandler} from './handlers/renderer';
import type {OverallProgressHelper} from './overall-render-progress';
import type {InsideFunctionSpecifics} from './provider-implementation';

export const renderWithSingleFunction = async <Provider extends CloudProvider>({
	payload,
	files,
	outdir,
	overallProgress,
	onArtifact,
	providerSpecifics,
	insideFunctionSpecifics,
	expectedBucketOwner,
	requestContext,
}: {
	payload: ServerlessPayload<Provider>;
	files: string[];
	outdir: string;
	overallProgress: OverallProgressHelper<Provider>;
	onArtifact: OnArtifactFromRenderer;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
	expectedBucketOwner: string;
	requestContext: RequestContext;
}): Promise<void> => {
	if (payload.type !== ServerlessRoutines.renderer) {
		throw new Error('Expected renderer type');
	}

	const rendererState: {
		error: {
			error: string;
			shouldRetry: boolean;
		} | null;
	} = {error: null};
	const renderedFiles: string[] = [];

	await rendererHandler({
		params: payload,
		options: {
			expectedBucketOwner,
			isWarm: true,
		},
		onStream: (message) => {
			if (message.type === 'lambda-invoked') {
				overallProgress.setLambdaInvoked(payload.chunk);
				return Promise.resolve();
			}

			if (message.type === 'frames-rendered') {
				overallProgress.setFrames({
					index: payload.chunk,
					encoded: message.payload.encoded,
					rendered: message.payload.rendered,
				});
				return Promise.resolve();
			}

			if (message.type === 'chunk-complete') {
				overallProgress.addChunkCompleted(
					payload.chunk,
					message.payload.start,
					message.payload.rendered,
				);
				return Promise.resolve();
			}

			if (message.type === 'artifact-emitted') {
				const artifact = deserializeArtifact(message.payload.artifact);
				const registration = onArtifact({
					artifact,
					chunk: payload.chunk,
					attempt: payload.attempt,
				});
				if (registration.type === 'conflict') {
					rendererState.error = {
						error: `Chunk ${payload.chunk} emitted an asset filename ${artifact.filename} at frame ${artifact.frame} but there is already another artifact with the same name. https://remotion.dev/docs/artifacts`,
						shouldRetry: false,
					};
				}

				return Promise.resolve();
			}

			if (message.type === 'error-occurred') {
				overallProgress.addErrorWithoutUpload(message.payload.errorInfo);
				overallProgress.setFrames({
					encoded: 0,
					index: payload.chunk,
					rendered: 0,
				});
				rendererState.error = {
					error: message.payload.error,
					shouldRetry: message.payload.shouldRetry,
				};
				return Promise.resolve();
			}

			throw new Error(`Unexpected ${message.type} event from direct renderer`);
		},
		requestContext,
		providerSpecifics,
		insideFunctionSpecifics,
		executionMode: 'direct',
		onMediaFiles: async ({
			videoOutputLocation,
			audioOutputLocation,
			isAudioOnly,
		}) => {
			const chunkName = `chunk:${String(payload.chunk).padStart(8, '0')}`;
			const videoDestination = join(outdir, `${chunkName}:video`);
			const audioDestination = join(outdir, `${chunkName}:audio`);

			if (isAudioOnly) {
				await rename(videoOutputLocation, audioDestination);
				renderedFiles.push(audioDestination);
				return;
			}

			await rename(videoOutputLocation, videoDestination);
			renderedFiles.push(videoDestination);
			if (audioOutputLocation) {
				await rename(audioOutputLocation, audioDestination);
				renderedFiles.push(audioDestination);
			}
		},
	});

	if (rendererState.error) {
		if (!rendererState.error.shouldRetry || payload.retriesLeft <= 0) {
			throw new Error(rendererState.error.error);
		}

		overallProgress.addRetry({
			attempt: payload.attempt + 1,
			time: Date.now(),
			chunk: payload.chunk,
		});
		await renderWithSingleFunction({
			payload: {
				...payload,
				attempt: payload.attempt + 1,
				retriesLeft: payload.retriesLeft - 1,
			},
			files,
			outdir,
			overallProgress,
			onArtifact,
			providerSpecifics,
			insideFunctionSpecifics,
			expectedBucketOwner,
			requestContext,
		});
		return;
	}

	files.push(...renderedFiles);
};
