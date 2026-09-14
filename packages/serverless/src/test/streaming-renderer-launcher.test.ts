import {expect, test} from 'bun:test';
import type {EmittedArtifact} from '@remotion/renderer';
import type {
	OnMessage,
	ProviderSpecifics,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {
	serializeArtifact,
	ServerlessRoutines,
} from '@remotion/serverless-client';
import {makeArtifactRegistry} from '../artifact-registry';
import type {OverallProgressHelper} from '../overall-render-progress';
import type {InsideFunctionSpecifics} from '../provider-implementation';
import {renderRendererFunctionWithRetry} from '../stream-renderer';

type MockProvider = {
	type: 'mock';
	region: 'mock-region';
	receivedArtifactType: never;
	creationFunctionOptions: never;
	storageClass: never;
	requestHandler: never;
};

test('an artifact replayed by a retried streaming chunk is idempotent', async () => {
	const attempts: number[] = [];
	const providerSpecifics = {
		getRendererFunctionTransport: () => 'response-streaming',
		callFunctionStreaming: ({
			payload,
			receivedStreamingPayload,
		}: {
			payload: ServerlessPayload<MockProvider>;
			receivedStreamingPayload: OnMessage<MockProvider>;
		}) => {
			if (payload.type !== ServerlessRoutines.renderer) {
				throw new Error('Expected renderer payload');
			}

			attempts.push(payload.attempt);
			receivedStreamingPayload({
				successType: 'success',
				message: {
					type: 'artifact-emitted',
					payload: {
						artifact: serializeArtifact({
							filename: 'thumbnail.jpeg',
							frame: 0,
							content: 'thumbnail',
							downloadBehavior: null,
						}),
					},
				},
			});

			if (payload.attempt === 1) {
				receivedStreamingPayload({
					successType: 'error',
					message: {
						type: 'error-occurred',
						payload: {
							error: 'Flaky renderer error',
							shouldRetry: true,
							errorInfo: {} as never,
						},
					},
				});
			} else {
				receivedStreamingPayload({
					successType: 'success',
					message: {
						type: 'chunk-complete',
						payload: {start: 100, rendered: 200},
					},
				});
			}

			return Promise.resolve();
		},
	} as unknown as ProviderSpecifics<MockProvider>;
	const retries: number[] = [];
	let completedChunks = 0;
	const overallProgress = {
		setFrames: () => undefined,
		addErrorWithoutUpload: () => undefined,
		addRetry: ({attempt}: {attempt: number}) => retries.push(attempt),
		addChunkCompleted: () => {
			completedChunks++;
		},
	} as unknown as OverallProgressHelper<MockProvider>;
	const insideFunctionSpecifics = {
		getCurrentRegionInFunction: () => 'mock-region',
	} as unknown as InsideFunctionSpecifics<MockProvider>;
	const artifactRegistry = makeArtifactRegistry();
	const acceptedArtifacts: EmittedArtifact[] = [];

	await renderRendererFunctionWithRetry({
		payload: {
			type: 'renderer',
			bucketName: 'bucket',
			renderId: 'render-id',
			chunk: 0,
			attempt: 1,
			retriesLeft: 1,
			forcePathStyle: false,
		} as never,
		files: [],
		functionName: 'renderer-function',
		outdir: '/tmp',
		overallProgress,
		logLevel: 'info',
		onArtifact: ({artifact, chunk, attempt}) => {
			const result = artifactRegistry.registerArtifact({
				chunk,
				frame: artifact.frame,
				attempt,
				filename: artifact.filename,
			});
			if (result.type === 'accepted') {
				acceptedArtifacts.push(artifact);
			}

			return result;
		},
		providerSpecifics,
		insideFunctionSpecifics,
		requestHandler: null,
		expectedBucketOwner: 'owner',
	});

	expect(attempts).toEqual([1, 2]);
	expect(retries).toEqual([2]);
	expect(completedChunks).toBe(1);
	expect(acceptedArtifacts).toEqual([
		{
			filename: 'thumbnail.jpeg',
			frame: 0,
			content: 'thumbnail',
			downloadBehavior: null,
		},
	]);
});
