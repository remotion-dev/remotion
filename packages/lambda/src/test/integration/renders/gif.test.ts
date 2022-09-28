import {RenderInternals} from '@remotion/renderer';
import {createWriteStream} from 'fs';
import {VERSION} from 'remotion/version';
import {LambdaRoutines} from '../../../defaults';
import {handler} from '../../../functions';
import {lambdaReadFile} from '../../../functions/helpers/io';
import type {LambdaReturnValues} from '../../../shared/return-values';
import {disableLogs, enableLogs} from '../../disable-logs';

jest.setTimeout(30000);

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

test('Should make a distributed GIF', async () => {
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

	const res = await handler(
		{
			type: LambdaRoutines.start,
			serveUrl: 'https://gleaming-wisp-de5d2a.netlify.app/',
			chromiumOptions: {},
			codec: 'gif',
			composition: 'framer',
			crf: 9,
			envVariables: {},
			// 61 frames, which is uneven, to challenge the frame planner
			frameRange: [0, 60],
			framesPerLambda: 8,
			imageFormat: 'png',
			inputProps: {},
			logLevel: 'warn',
			maxRetries: 3,
			outName: 'out.mp4',
			pixelFormat: 'yuv420p',
			privacy: 'public',
			proResProfile: undefined,
			quality: undefined,
			scale: 1,
			timeoutInMilliseconds: 12000,
			numberOfGifLoops: null,
			everyNthFrame: 2,
			concurrencyPerLambda: 1,
			downloadBehavior: {type: 'play-in-browser'},
			muted: false,
			version: VERSION,
			overwrite: true,
		},
		extraContext
	);
	const startRes = res as Await<LambdaReturnValues[LambdaRoutines.start]>;

	const progress = (await handler(
		{
			type: LambdaRoutines.status,
			bucketName: startRes.bucketName,
			renderId: startRes.renderId,
			version: VERSION,
		},
		extraContext
	)) as Await<LambdaReturnValues[LambdaRoutines.status]>;

	const file = await lambdaReadFile({
		bucketName: progress.outBucket as string,
		key: progress.outKey as string,
		expectedBucketOwner: 'abc',
		region: 'eu-central-1',
	});
	await new Promise<void>((resolve) => {
		file.pipe(createWriteStream('gif.gif')).on('close', () => resolve());
	});
	const probe = await RenderInternals.execa('ffprobe', ['gif.gif']);
	expect(probe.stderr).toMatch(/Video: gif, bgra, 1080x1080/);
}, 90000);
