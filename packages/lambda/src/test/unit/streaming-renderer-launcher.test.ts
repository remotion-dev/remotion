import {afterEach, expect, spyOn, test} from 'bun:test';
import {join} from 'node:path';
import {
	LambdaClientInternals,
	ServerlessRoutines,
	type OnMessage,
	type ServerlessPayload,
} from '@remotion/lambda-client';
import type {EmittedArtifact} from '@remotion/renderer';
import * as callLambdaStreaming from '../../../../lambda-client/src/call-lambda-streaming';
import * as rendererTransport from '../../../../lambda-client/src/renderer-transport';
import {makeArtifactRegistry} from '../../functions/artifact-registry';
import * as currentRegion from '../../functions/helpers/get-current-region';
import type {OverallProgressHelper} from '../../functions/overall-render-progress';
import {renderRendererFunctionWithRetry} from '../../functions/stream-renderer';

const spies: {mockRestore: () => void}[] = [];

afterEach(() => {
	spies.splice(0).forEach((spy) => spy.mockRestore());
});

const useStreamingTransport = (
	callFunctionStreaming: (options: {
		payload: ServerlessPayload;
		receivedStreamingPayload: OnMessage;
	}) => Promise<void>,
) => {
	spies.push(
		spyOn(rendererTransport, 'getRendererFunctionTransport').mockImplementation(
			() => 'response-streaming',
		),
		spyOn(
			callLambdaStreaming,
			'callFunctionWithStreamingImplementation',
		).mockImplementation(
			callFunctionStreaming as typeof callLambdaStreaming.callFunctionWithStreamingImplementation,
		),
		spyOn(currentRegion, 'getCurrentRegionInFunction').mockImplementation(
			() => 'eu-central-1',
		),
	);
};

test('an artifact replayed by a retried streaming chunk is idempotent', async () => {
	const attempts: number[] = [];
	useStreamingTransport(({payload, receivedStreamingPayload}) => {
		if (payload.type !== ServerlessRoutines.renderer) {
			throw new Error('Expected renderer payload');
		}

		attempts.push(payload.attempt);
		receivedStreamingPayload({
			successType: 'success',
			message: {
				type: 'artifact-emitted',
				payload: {
					artifact: LambdaClientInternals.serializeArtifact({
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
	});
	const retries: number[] = [];
	let completedChunks = 0;
	const overallProgress = {
		setFrames: () => undefined,
		addErrorWithoutUpload: () => undefined,
		addRetry: ({attempt}: {attempt: number}) => retries.push(attempt),
		addChunkCompleted: () => {
			completedChunks++;
		},
	} as unknown as OverallProgressHelper;
	const artifactRegistry = makeArtifactRegistry();
	const acceptedArtifacts: EmittedArtifact[] = [];

	await renderRendererFunctionWithRetry({
		payload: {
			type: 'renderer',
			output: {type: 'media'},
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

test('a chunk file replayed by a retried streaming chunk is only merged once', async () => {
	useStreamingTransport(({payload, receivedStreamingPayload}) => {
		if (payload.type !== ServerlessRoutines.renderer) {
			throw new Error('Expected renderer payload');
		}

		receivedStreamingPayload({
			successType: 'success',
			message: {type: 'audio-chunk-rendered', payload: new Uint8Array()},
		});

		if (payload.attempt === 1) {
			return Promise.reject(new Error('socket hang up'));
		}

		receivedStreamingPayload({
			successType: 'success',
			message: {type: 'video-chunk-rendered', payload: new Uint8Array()},
		});
		receivedStreamingPayload({
			successType: 'success',
			message: {
				type: 'chunk-complete',
				payload: {start: 100, rendered: 200},
			},
		});

		return Promise.resolve();
	});
	const overallProgress = {
		addRetry: () => undefined,
		addChunkCompleted: () => undefined,
	} as unknown as OverallProgressHelper;
	const files: string[] = [];

	await renderRendererFunctionWithRetry({
		payload: {
			type: 'renderer',
			output: {type: 'media'},
			bucketName: 'bucket',
			renderId: 'render-id',
			chunk: 0,
			attempt: 1,
			retriesLeft: 1,
			forcePathStyle: false,
		} as never,
		files,
		functionName: 'renderer-function',
		outdir: '/tmp',
		overallProgress,
		logLevel: 'info',
		onArtifact: () => {
			throw new Error('No artifacts expected');
		},
		requestHandler: null,
		expectedBucketOwner: 'owner',
	});

	expect(files).toEqual([
		join('/tmp', 'chunk:00000000:audio'),
		join('/tmp', 'chunk:00000000:video'),
	]);
});
