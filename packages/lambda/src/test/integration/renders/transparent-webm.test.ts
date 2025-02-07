import {LambdaClientInternals} from '@remotion/lambda-client';
import {ensureBrowser, RenderInternals} from '@remotion/renderer';
import {rendersPrefix} from '@remotion/serverless';
import {beforeAll, expect, test} from 'bun:test';
import fs, {createWriteStream} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {mockImplementation} from '../../mocks/mock-implementation';
import {simulateLambdaRender} from '../simulate-lambda-render';

beforeAll(async () => {
	await ensureBrowser();
});

test(
	'Should make a transparent video',
	async () => {
		const {close, file, progress, renderId} = await simulateLambdaRender({
			codec: 'vp8',
			composition: 'ten-frame-tester',
			frameRange: [0, 9],
			imageFormat: 'png',
			framesPerLambda: 5,
			logLevel: 'error',
			region: 'eu-central-1',
			outName: 'out.webm',
			pixelFormat: 'yuva420p',
			scale: 0.25,
		});

		// We create a temporary directory for storing the frames
		const tmpdir = await fs.promises.mkdtemp(
			path.join(os.tmpdir(), 'remotion-'),
		);
		const out = path.join(tmpdir, 'hithere.webm');
		file.pipe(createWriteStream(out));

		await new Promise<void>((resolve) => {
			file.on('close', () => resolve());
		});
		const probe = await RenderInternals.callFf({
			bin: 'ffprobe',
			args: [out],
			indent: false,
			logLevel: 'info',
			binariesDirectory: null,
			cancelSignal: undefined,
		});
		expect(probe.stderr).toMatch(/ALPHA_MODE(\s+): 1/);
		expect(probe.stderr).toMatch(/Video: vp8, yuv420p/);
		expect(probe.stderr).toMatch(/Audio: opus, 48000 Hz/);
		fs.unlinkSync(out);

		const files = await mockImplementation.listObjects({
			bucketName: progress.outBucket as string,
			region: 'eu-central-1',
			expectedBucketOwner: 'abc',
			prefix: rendersPrefix(renderId),
			forcePathStyle: false,
		});

		expect(files.length).toBe(2);

		await LambdaClientInternals.internalDeleteRender({
			bucketName: progress.outBucket as string,
			region: 'eu-central-1',
			renderId,
			providerSpecifics: mockImplementation,
			forcePathStyle: false,
		});

		const expectFiles = await mockImplementation.listObjects({
			bucketName: progress.outBucket as string,
			region: 'eu-central-1',
			expectedBucketOwner: 'abc',
			prefix: rendersPrefix(renderId),
			forcePathStyle: false,
		});

		RenderInternals.deleteDirectory(tmpdir);
		expect(expectFiles.length).toBe(0);

		await close();
	},
	{timeout: 60000},
);
