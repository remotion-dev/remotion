import execa from 'execa';
import {LambdaRoutines} from '../../defaults';
import {handler} from '../../functions';
import {killBrowserInstancesForIntegrationTest} from '../../functions/helpers/get-browser-instance';
import {lambdaReadFile} from '../../functions/helpers/io';
import {LambdaReturnValues} from '../../shared/return-values';

jest.setTimeout(30000);

const extraContext = {
	invokedFunctionArn: 'arn:fake',
	getRemainingTimeInMillis: () => 12000,
};

type Await<T> = T extends PromiseLike<infer U> ? U : T;

beforeAll(() => {});

afterAll(async () => {
	await killBrowserInstancesForIntegrationTest();
});

test('Render handler manually', async () => {
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

	const res = await handler(
		{
			type: LambdaRoutines.start,
			serveUrl: 'https://competent-mccarthy-56f7c9.netlify.app/',
			chromiumOptions: {},
			codec: 'h264',
			composition: 'react-svg',
			crf: 9,
			enableChunkOptimization: false,
			envVariables: {},
			frameRange: [0, 12],
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
		bucketName: startRes.bucketName,
		key: progress.outKey as string,
		expectedBucketOwner: 'abc',
		region: 'eu-central-1',
	});
	const probe = await execa('ffprobe', ['-'], {
		stdin: file,
	});
	expect(probe.stderr).toMatch(/Stream #0:0/);
	expect(probe.stderr).toMatch(/Video: h264/);
	expect(probe.stderr).toMatch(/Stream #0:1/);
	expect(probe.stderr).toMatch(/Audio: aac/);
});
