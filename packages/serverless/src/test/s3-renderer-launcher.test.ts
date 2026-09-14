import {expect, test} from 'bun:test';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import type {EmittedArtifact} from '@remotion/renderer';
import type {
	ProviderSpecifics,
	S3RendererStatus,
} from '@remotion/serverless-client';
import {
	rendererTransportArtifactKey,
	rendererTransportStatusKey,
	rendererTransportVideoKey,
} from '@remotion/serverless-client';
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

test('S3 launcher invokes, polls, downloads, and normalizes a renderer result', async () => {
	const directory = await mkdtemp(join(tmpdir(), 'remotion-s3-launcher-'));
	try {
		const objects = new Map<string, Uint8Array>();
		const deleted: string[] = [];
		let asyncInvocations = 0;
		const videoKey = rendererTransportVideoKey({
			renderId: 'render-id',
			chunk: 0,
			attempt: 1,
		});
		const artifactKey = rendererTransportArtifactKey(
			{renderId: 'render-id', chunk: 0, attempt: 1},
			0,
		);
		const statusKey = rendererTransportStatusKey({
			renderId: 'render-id',
			chunk: 0,
			attempt: 1,
		});
		const status: S3RendererStatus = {
			schema: 1,
			state: 'completed',
			chunk: 0,
			attempt: 1,
			lambdaInvoked: true,
			renderedFrames: 12,
			encodedFrames: 12,
			startedAt: 100,
			completedAt: 200,
			videoKey,
			audioKey: null,
			artifacts: [
				{
					key: artifactKey,
					metadata: {
						filename: 'artifact.txt',
						frame: 3,
						binary: false,
						downloadBehavior: null,
					},
				},
			],
		};
		const providerSpecifics = {
			getRendererFunctionTransport: () => 's3',
			callFunctionAsync: () => {
				asyncInvocations++;
				objects.set(videoKey, new TextEncoder().encode('video'));
				objects.set(artifactKey, new TextEncoder().encode('artifact'));
				objects.set(
					statusKey,
					new TextEncoder().encode(JSON.stringify(status)),
				);
				return Promise.resolve();
			},
			readFile: ({key}: {key: string}) => {
				const value = objects.get(key);
				if (!value) {
					const error = new Error(`Missing ${key}`);
					error.name = 'NoSuchKey';
					throw error;
				}

				return Promise.resolve(Readable.from([value]));
			},
			deleteFile: ({key}: {key: string}) => {
				deleted.push(key);
				objects.delete(key);
				return Promise.resolve();
			},
			isFlakyError: () => false,
			getLoggingUrlForRendererFunction: () => 'https://logs.example.com',
		} as unknown as ProviderSpecifics<MockProvider>;

		const frames: Array<{rendered: number; encoded: number}> = [];
		let lambdasInvoked = 0;
		let completedChunks = 0;
		const overallProgress = {
			get: () => ({timeoutTimestamp: Date.now() + 10_000}),
			setLambdaInvoked: () => {
				lambdasInvoked++;
			},
			setFrames: ({rendered, encoded}: {rendered: number; encoded: number}) => {
				frames.push({rendered, encoded});
			},
			addChunkCompleted: () => {
				completedChunks++;
			},
		} as unknown as OverallProgressHelper<MockProvider>;
		const insideFunctionSpecifics = {
			getCurrentRegionInFunction: () => 'mock-region',
		} as unknown as InsideFunctionSpecifics<MockProvider>;
		const files: string[] = [];
		const artifacts: EmittedArtifact[] = [];
		const artifactSources: Array<{chunk: number; attempt: number}> = [];

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
			files,
			functionName: 'renderer-function',
			outdir: directory,
			overallProgress,
			logLevel: 'info',
			onArtifact: ({artifact, chunk, attempt}) => {
				artifacts.push(artifact);
				artifactSources.push({chunk, attempt});
				return {type: 'accepted'};
			},
			providerSpecifics,
			insideFunctionSpecifics,
			requestHandler: null,
			expectedBucketOwner: 'owner',
		});

		expect(asyncInvocations).toBe(1);
		expect(lambdasInvoked).toBe(1);
		expect(frames).toEqual([{rendered: 12, encoded: 12}]);
		expect(completedChunks).toBe(1);
		expect(artifacts).toEqual([
			{
				filename: 'artifact.txt',
				frame: 3,
				content: 'artifact',
				downloadBehavior: null,
			},
		]);
		expect(artifactSources).toEqual([{chunk: 0, attempt: 1}]);
		expect(files).toHaveLength(1);
		expect(await readFile(files[0]!, 'utf8')).toBe('video');
		expect(deleted.sort()).toEqual([artifactKey, statusKey, videoKey].sort());
	} finally {
		await rm(directory, {recursive: true, force: true});
	}
});
