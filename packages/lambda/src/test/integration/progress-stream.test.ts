import {expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {
	LambdaClientInternals,
	renderMediaOnLambdaAndStream,
	speculateFunctionName,
	type RenderProgress,
} from '@remotion/lambda-client';
import {
	ensureBrowser,
	getVideoMetadata,
	RenderInternals,
} from '@remotion/renderer';
import {fakeAws, fakeAwsDefaults, useFakeAws} from '../mocks/fake-aws';
import {readMockS3File} from '../mocks/mock-store';

useFakeAws();

test('streams changed progress and completes real renders through idle and busy periods', async () => {
	const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'progress-stream-'));
	let close: (() => Promise<void>) | null = null;
	try {
		await ensureBrowser();
		await bundle({
			entryPoint: path.join(__dirname, 'webhooks.tsx'),
			outDir,
			publicDir: null,
		});
		const server = await RenderInternals.serveStatic(outDir, {
			binariesDirectory: null,
			offthreadVideoThreads: 1,
			downloadMap: RenderInternals.makeDownloadMap(48000),
			indent: false,
			logLevel: 'error',
			offthreadVideoCacheSizeInBytes: null,
			port: null,
			remotionRoot: process.cwd(),
			forceIPv4: false,
		});
		close = server.close;
		for (const idle of [false, true]) {
			const updates: {time: number; progress: RenderProgress}[] = [];
			let workerUpdates = 0;
			let duplicateWorkerUpdates = 0;
			let workerBytes = 0;
			fakeAws().callFunctionStreaming.mockImplementation((input) => {
				let previous: string | null = null;
				return fakeAwsDefaults.callFunctionStreaming({
					...input,
					receivedStreamingPayload: (message) => {
						if (message.message.type === 'frames-rendered') {
							const payload = JSON.stringify(message.message.payload);
							workerUpdates++;
							workerBytes += LambdaClientInternals.makeStreamPayload({
								message: message.message,
							}).byteLength;
							if (payload === previous) {
								duplicateWorkerUpdates++;
							}

							previous = payload;
						}

						input.receivedStreamingPayload(message);
					},
				});
			});
			const start = performance.now();
			const result = await renderMediaOnLambdaAndStream({
				functionName: speculateFunctionName({
					diskSizeInMb: 10240,
					memorySizeInMb: 3009,
					timeoutInSeconds: 120,
				}),
				region: 'eu-central-1',
				serveUrl: `http://localhost:${server.port}`,
				composition: idle ? 'webhook-timeout' : 'webhook-success',
				forceDurationInFrames: idle ? 1 : 120,
				concurrency: idle ? 1 : 3,
				codec: 'h264',
				muted: true,
				logLevel: 'error',
				onProgress: (progress) => {
					updates.push({
						time: performance.now(),
						progress: structuredClone(progress),
					});
				},
			});
			const file = readMockS3File({
				bucketName: result.outBucket,
				key: result.outKey,
				region: 'eu-central-1',
			});
			expect(file).not.toBeNull();
			const filename = path.join(outDir, `${idle ? 'idle' : 'busy'}.mp4`);
			fs.writeFileSync(filename, file!.content);
			const metadata = await getVideoMetadata(filename);
			expect(metadata.durationInSeconds).toBeCloseTo(idle ? 1 / 30 : 4, 1);
			expect(result.done).toBe(true);
			expect(result.framesRendered).toBe(idle ? 1 : 120);
			expect(updates.at(-1)?.progress.done).toBe(true);
			const intermediate = updates.filter(({progress}) => !progress.done);
			for (let i = 1; i < intermediate.length; i++) {
				expect(
					intermediate[i].time - intermediate[i - 1].time,
				).toBeGreaterThanOrEqual(80);
			}

			const keys = intermediate.map(({progress}) =>
				JSON.stringify({
					framesRendered: progress.framesRendered,
					encoding: progress.encodingStatus,
					chunks: progress.chunks,
					lambdasInvoked: progress.lambdasInvoked,
					compositionValidated: progress.compositionValidated,
					serveUrlOpened: progress.serveUrlOpened,
				}),
			);
			const duplicates = keys.filter(
				(key, i) => i > 0 && key === keys[i - 1],
			).length;
			console.log(
				JSON.stringify({
					idle,
					durationMs: performance.now() - start,
					clientUpdates: updates.length,
					duplicates,
					workerUpdates,
					duplicateWorkerUpdates,
					workerBytes,
				}),
			);
			expect(duplicateWorkerUpdates).toBe(0);
			if (idle) {
				expect(duplicates).toBe(0);
			}
		}
	} finally {
		await close?.();
		fs.rmSync(outDir, {recursive: true, force: true});
	}
}, 120000);
