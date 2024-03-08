import {RenderInternals} from '@remotion/renderer';
import fs, {createWriteStream} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {VERSION} from 'remotion/version';
import {afterAll, beforeAll, expect, test} from 'vitest';
import {deleteRender} from '../../../api/delete-render';
import {LambdaRoutines, rendersPrefix} from '../../../defaults';
import {lambdaLs, lambdaReadFile} from '../../../functions/helpers/io';
import {callLambda} from '../../../shared/call-lambda';
import {disableLogs, enableLogs} from '../../disable-logs';

beforeAll(() => {
	disableLogs();
});

afterAll(async () => {
	enableLogs();
	await RenderInternals.killAllBrowsers();
});

test('Should make a transparent video', async () => {
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

	const res = await callLambda({
		type: LambdaRoutines.start,
		payload: {
			serveUrl:
				'https://64d3734a6bb69052c34d3616--spiffy-kelpie-71657b.netlify.app/',
			chromiumOptions: {},
			codec: 'vp8',
			composition: 'ten-frame-tester',
			crf: 9,
			envVariables: {},
			frameRange: [0, 9],
			framesPerLambda: 5,
			imageFormat: 'png',
			inputProps: {
				type: 'payload',
				payload: '{}',
			},
			logLevel: 'warn',
			maxRetries: 3,
			outName: 'out.webm',
			pixelFormat: 'yuva420p',
			privacy: 'public',
			proResProfile: undefined,
			x264Preset: null,
			jpegQuality: undefined,
			scale: 1,
			timeoutInMilliseconds: 12000,
			numberOfGifLoops: null,
			everyNthFrame: 1,
			concurrencyPerLambda: 1,
			downloadBehavior: {
				type: 'play-in-browser',
			},
			muted: false,
			version: VERSION,
			overwrite: true,
			webhook: null,
			audioBitrate: null,
			videoBitrate: null,
			encodingBufferSize: null,
			encodingMaxRate: null,
			forceHeight: null,
			forceWidth: null,
			rendererFunctionName: null,
			bucketName: null,
			audioCodec: null,
			offthreadVideoCacheSizeInBytes: null,
			deleteAfter: null,
			colorSpace: 'default',
			preferLossless: false,
		},
		functionName: 'remotion-dev-render',
		receivedStreamingPayload: () => undefined,
		region: 'eu-central-1',
		timeoutInTest: 120000,
		retriesRemaining: 0,
	});

	const progress = await callLambda({
		type: LambdaRoutines.status,
		payload: {
			logLevel: 'info',
			bucketName: res.bucketName,
			renderId: res.renderId,
			version: VERSION,
		},
		functionName: 'remotion-dev-render',
		receivedStreamingPayload: () => undefined,
		region: 'eu-central-1',
		timeoutInTest: 120000,
		retriesRemaining: 0,
	});

	const file = await lambdaReadFile({
		bucketName: res.bucketName,
		key: progress.outKey as string,
		expectedBucketOwner: 'abc',
		region: 'eu-central-1',
	});

	// We create a temporary directory for storing the frames
	const tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'remotion-'));
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

	const files = await lambdaLs({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: rendersPrefix(res.renderId),
	});

	expect(files.length).toBe(4);

	await deleteRender({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		renderId: res.renderId,
	});

	const expectFiles = await lambdaLs({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: rendersPrefix(res.renderId),
	});

	RenderInternals.deleteDirectory(tmpdir);
	expect(expectFiles.length).toBe(0);
});
