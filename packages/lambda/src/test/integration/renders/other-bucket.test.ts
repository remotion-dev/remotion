import {RenderInternals} from '@remotion/renderer';
import {VERSION} from 'remotion/version';
import {afterAll, beforeAll, expect, test} from 'vitest';
import {LambdaRoutines} from '../../../defaults';
import {handler} from '../../../functions';
import {lambdaReadFile} from '../../../functions/helpers/io';
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

test('Should be able to render to another bucket', async () => {
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

	const res = (await handler(
		{
			type: LambdaRoutines.start,
			serveUrl:
				'https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/',
			chromiumOptions: {},
			codec: 'h264',
			composition: 'react-svg',
			crf: 9,
			envVariables: {},
			frameRange: [0, 12],
			framesPerLambda: 8,
			imageFormat: 'png',
			inputProps: {
				type: 'payload',
				payload: '{}',
			},
			logLevel: 'warn',
			maxRetries: 3,
			outName: {
				bucketName: 'my-other-bucket',
				key: 'my-key',
			},
			pixelFormat: 'yuv420p',
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
		bucketName: parsed.outBucket as string,
		key: parsed.outKey as string,
		expectedBucketOwner: 'abc',
		region: 'eu-central-1',
	});
	const probe = await RenderInternals.callFf('ffprobe', ['-'], {
		stdin: file,
	});
	expect(probe.stderr).toMatch(/Stream #0:0/);
	expect(probe.stderr).toMatch(/Video: h264/);
	expect(probe.stderr).toMatch(/Stream #0:1/);
	expect(probe.stderr).toMatch(/Audio: aac/);
});
