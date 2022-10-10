import {RenderInternals} from '@remotion/renderer';
import fs, {createWriteStream} from 'fs';
import os from 'os';
import path from 'path';
import {VERSION} from 'remotion/version';
import {deleteRender} from '../../../api/delete-render';
import {LambdaRoutines, rendersPrefix} from '../../../defaults';
import {handler} from '../../../functions';
import {lambdaLs, lambdaReadFile} from '../../../functions/helpers/io';
import type {LambdaReturnValues} from '../../../shared/return-values';
import {disableLogs, enableLogs} from '../../disable-logs';

jest.setTimeout(90000);

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

	const res = await handler(
		{
			type: LambdaRoutines.start,
			serveUrl: 'https://gleaming-wisp-de5d2a.netlify.app/',
			chromiumOptions: {},
			codec: 'vp8',
			composition: 'ten-frame-tester',
			crf: 9,
			envVariables: {},
			frameRange: [0, 9],
			framesPerLambda: 5,
			imageFormat: 'png',
			inputProps: {},
			logLevel: 'warn',
			maxRetries: 3,
			outName: 'out.webm',
			pixelFormat: 'yuva420p',
			privacy: 'public',
			proResProfile: undefined,
			quality: undefined,
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
		bucketName: startRes.bucketName,
		key: progress.outKey as string,
		expectedBucketOwner: 'abc',
		region: 'eu-central-1',
	});

	// We create a temporary directory for storing the frames
	const out = path.join(
		await fs.promises.mkdtemp(path.join(os.tmpdir(), 'remotion-')),
		'hithere.webm'
	);
	file.pipe(createWriteStream(out));

	await new Promise<void>((resolve) => {
		file.on('close', () => resolve());
	});
	const probe = await RenderInternals.execa('ffprobe', [out]);
	expect(probe.stderr).toMatch(/ALPHA_MODE(\s+): 1/);
	expect(probe.stderr).toMatch(/Video: vp8, yuv420p/);
	expect(probe.stderr).toMatch(/Audio: opus, 48000 Hz/);
	fs.unlinkSync(out);

	const files = await lambdaLs({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: rendersPrefix(startRes.renderId),
	});

	expect(files.length).toBe(4);

	await deleteRender({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		renderId: startRes.renderId,
	});

	const expectFiles = await lambdaLs({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: rendersPrefix(startRes.renderId),
	});

	expect(expectFiles.length).toBe(0);
});
