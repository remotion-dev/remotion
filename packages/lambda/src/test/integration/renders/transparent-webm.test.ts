import {RenderInternals} from '@remotion/renderer';
import fs, {createWriteStream} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {VERSION} from 'remotion/version';
import {afterAll, beforeAll, expect, test} from 'vitest';
import {deleteRender} from '../../../api/delete-render';
import {LambdaRoutines, rendersPrefix} from '../../../defaults';
import {handler} from '../../../functions';
import {lambdaLs, lambdaReadFile} from '../../../functions/helpers/io';
import type {
	LambdaReturnValues,
	StreamedResponse,
} from '../../../shared/return-values';
import {disableLogs, enableLogs} from '../../disable-logs';

const extraContext = {
	invokedFunctionArn: 'arn:fake',
	getRemainingTimeInMillis: () => 12000,
};

type Await<T> = T extends PromiseLike<infer U> ? U : T;

beforeAll(() => {
	disableLogs();
});

afterAll(async () => {
	enableLogs();
	await RenderInternals.killAllBrowsers();
});

test('Should make a transparent video', async () => {
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

	const res = (await handler(
		{
			type: LambdaRoutines.start,
			serveUrl:
				'https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/',
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
			forceHeight: null,
			forceWidth: null,
			rendererFunctionName: null,
			bucketName: null,
			audioCodec: null,
			dumpBrowserLogs: false,
		},
		extraContext
	)) as StreamedResponse;
	const startRes = JSON.parse(res.body) as Await<
		LambdaReturnValues[LambdaRoutines.start]
	>;

	const progress = (await handler(
		{
			type: LambdaRoutines.status,
			bucketName: startRes.bucketName,
			renderId: startRes.renderId,
			version: VERSION,
		},
		extraContext
	)) as StreamedResponse;

	const parsed = JSON.parse(progress.body) as Await<
		LambdaReturnValues[LambdaRoutines.status]
	>;

	const file = await lambdaReadFile({
		bucketName: startRes.bucketName,
		key: parsed.outKey as string,
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
	const probe = await RenderInternals.callFf('ffprobe', [out]);
	expect(probe.stderr).toMatch(/ALPHA_MODE(\s+): 1/);
	expect(probe.stderr).toMatch(/Video: vp8, yuv420p/);
	expect(probe.stderr).toMatch(/Audio: opus, 48000 Hz/);
	fs.unlinkSync(out);

	const files = await lambdaLs({
		bucketName: parsed.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: rendersPrefix(startRes.renderId),
	});

	expect(files.length).toBe(4);

	await deleteRender({
		bucketName: parsed.outBucket as string,
		region: 'eu-central-1',
		renderId: startRes.renderId,
	});

	const expectFiles = await lambdaLs({
		bucketName: parsed.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: rendersPrefix(startRes.renderId),
	});

	RenderInternals.deleteDirectory(tmpdir);
	expect(expectFiles.length).toBe(0);
});
