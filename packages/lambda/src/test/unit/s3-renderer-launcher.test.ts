import {afterEach, expect, spyOn, test} from 'bun:test';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import {
	LambdaClientInternals,
	type S3RendererStatus,
} from '@remotion/lambda-client';
import type {EmittedArtifact} from '@remotion/renderer';
import * as callLambdaAsync from '../../../../lambda-client/src/call-lambda-async';
import * as deleteFile from '../../../../lambda-client/src/delete-file';
import * as readFileModule from '../../../../lambda-client/src/read-file';
import * as rendererTransport from '../../../../lambda-client/src/renderer-transport';
import * as currentRegion from '../../functions/helpers/get-current-region';
import type {OverallProgressHelper} from '../../functions/overall-render-progress';
import {renderRendererFunctionWithRetry} from '../../functions/stream-renderer';

const spies: {mockRestore: () => void}[] = [];

afterEach(() => {
	spies.splice(0).forEach((spy) => spy.mockRestore());
});

test('S3 launcher invokes, polls, downloads, and normalizes a renderer result', async () => {
	const directory = await mkdtemp(join(tmpdir(), 'remotion-s3-launcher-'));
	try {
		const objects = new Map<string, Uint8Array>();
		const deleted: string[] = [];
		let asyncInvocations = 0;
		const videoKey = LambdaClientInternals.rendererTransportVideoKey({
			renderId: 'render-id',
			chunk: 0,
			attempt: 1,
		});
		const artifactKey = LambdaClientInternals.rendererTransportArtifactKey(
			{renderId: 'render-id', chunk: 0, attempt: 1},
			0,
		);
		const statusKey = LambdaClientInternals.rendererTransportStatusKey({
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
			uploadedFrames: 0,
			uploadedSizeInBytes: 0,
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
		spies.push(
			spyOn(
				rendererTransport,
				'getRendererFunctionTransport',
			).mockImplementation(() => 's3'),
			spyOn(
				callLambdaAsync,
				'callFunctionAsyncImplementation',
			).mockImplementation(() => {
				asyncInvocations++;
				objects.set(videoKey, new TextEncoder().encode('video'));
				objects.set(artifactKey, new TextEncoder().encode('artifact'));
				objects.set(
					statusKey,
					new TextEncoder().encode(JSON.stringify(status)),
				);
				return Promise.resolve();
			}),
			spyOn(readFileModule, 'lambdaReadFileImplementation').mockImplementation(
				({key}) => {
					const value = objects.get(key);
					if (!value) {
						const error = new Error(`Missing ${key}`);
						error.name = 'NoSuchKey';
						throw error;
					}

					return Promise.resolve(Readable.from([value]));
				},
			),
			spyOn(deleteFile, 'lambdaDeleteFileImplementation').mockImplementation(
				({key}) => {
					deleted.push(key);
					objects.delete(key);
					return Promise.resolve();
				},
			),
			spyOn(currentRegion, 'getCurrentRegionInFunction').mockImplementation(
				() => 'eu-central-1',
			),
		);

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
		} as unknown as OverallProgressHelper;
		const files: string[] = [];
		const artifacts: EmittedArtifact[] = [];
		const artifactSources: Array<{chunk: number; attempt: number}> = [];

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
			outdir: directory,
			overallProgress,
			logLevel: 'info',
			onArtifact: ({artifact, chunk, attempt}) => {
				artifacts.push(artifact);
				artifactSources.push({chunk, attempt});
				return {type: 'accepted'};
			},
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
