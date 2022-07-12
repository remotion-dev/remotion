import {RenderInternals} from '@remotion/renderer';
import {createWriteStream} from 'fs';
import {LambdaRoutines} from '../../../defaults';
import {handler} from '../../../functions';
import {lambdaReadFile} from '../../../functions/helpers/io';
import type {LambdaReturnValues} from '../../../shared/return-values';

jest.setTimeout(30000);

const extraContext = {
	invokedFunctionArn: 'arn:fake',
	getRemainingTimeInMillis: () => 12000,
};

type Await<T> = T extends PromiseLike<infer U> ? U : T;

beforeAll(() => {
	//	disableLogs();
});

afterAll(async () => {
	//	enableLogs();

	await RenderInternals.killAllBrowsers();
});

test('Should make a distributed GIF', async () => {
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

	const res = await handler(
		{
			type: LambdaRoutines.start,
			serveUrl:
				'https://6297949544e290044cecb257--cute-kitsune-214ea5.netlify.app/',
			chromiumOptions: {},
			codec: 'gif',
			composition: 'framer',
			crf: 9,
			envVariables: {},
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
		},
		extraContext
	);
	const startRes = res as Await<LambdaReturnValues[LambdaRoutines.start]>;

	const progress = (await handler(
		{
			type: LambdaRoutines.status,
			bucketName: startRes.bucketName,
			renderId: startRes.renderId,
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
