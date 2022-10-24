import {RenderInternals} from '@remotion/renderer';
import {VERSION} from 'remotion/version';
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest';
import {LambdaRoutines} from '../../defaults';
import {handler} from '../../functions';
import {mockableHttpClients} from '../../shared/invoke-webhook';
import type {LambdaReturnValues} from '../../shared/return-values';
import {disableLogs, enableLogs} from '../disable-logs';

const extraContext = {
	invokedFunctionArn: 'arn:fake',
	getRemainingTimeInMillis: () => 12000,
};

type Await<T> = T extends PromiseLike<infer U> ? U : T;

const originalFetch = mockableHttpClients.http;
beforeEach(() => {
	// @ts-expect-error
	mockableHttpClients.http = vi.fn(
		(
			_url: string,
			_options: unknown,
			cb: (a: {statusCode: number}) => void
		) => {
			cb({
				statusCode: 201,
			});
			return {
				on: () => undefined,
				end: () => undefined,
			};
		}
	);
});

afterEach(() => {
	mockableHttpClients.http = originalFetch;
});

beforeAll(() => {
	disableLogs();
});

afterAll(async () => {
	enableLogs();

	await RenderInternals.killAllBrowsers();
});

const TEST_URL = 'http://localhost:8000';

describe('Webhooks', () => {
	test('Should call webhook upon completion', async () => {
		process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

		const res = await handler(
			{
				type: LambdaRoutines.start,
				serveUrl: 'https://gleaming-wisp-de5d2a.netlify.app/',
				chromiumOptions: {},
				codec: 'h264',
				composition: 'react-svg',
				crf: 9,
				envVariables: {},
				frameRange: [0, 2],
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
				timeoutInMilliseconds: 16000,
				numberOfGifLoops: null,
				everyNthFrame: 1,
				concurrencyPerLambda: 1,
				downloadBehavior: {
					type: 'play-in-browser',
				},
				muted: false,
				version: VERSION,
				overwrite: true,
				webhook: {
					url: TEST_URL,
					secret: 'TEST_SECRET',
				},
				audioBitrate: null,
				videoBitrate: null,
				height: undefined,
				width: undefined,
			},
			extraContext
		);
		const startRes = res as Await<LambdaReturnValues[LambdaRoutines.start]>;

		(await handler(
			{
				type: LambdaRoutines.status,
				bucketName: startRes.bucketName,
				renderId: startRes.renderId,
				version: VERSION,
			},
			extraContext
		)) as Await<LambdaReturnValues[LambdaRoutines.status]>;

		expect(mockableHttpClients.http).toHaveBeenCalledTimes(1);
		expect(mockableHttpClients.http).toHaveBeenCalledWith(
			TEST_URL,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Remotion-Signature': expect.stringContaining('sha512='),
					'X-Remotion-Status': 'success',
					'X-Remotion-Mode': 'production',
					'Content-Length': expect.any(Number),
				},
				timeout: 5000,
			},
			expect.anything()
		);
	});

	test('Should call webhook upon timeout', async () => {
		process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

		const res = await handler(
			{
				type: LambdaRoutines.start,
				serveUrl: 'https://gleaming-wisp-de5d2a.netlify.app/',
				chromiumOptions: {},
				codec: 'h264',
				composition: 'react-svg',
				crf: 9,
				envVariables: {},
				frameRange: [0, 50],
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
				timeoutInMilliseconds: 3000,
				numberOfGifLoops: null,
				everyNthFrame: 1,
				concurrencyPerLambda: 1,
				downloadBehavior: {
					type: 'play-in-browser',
				},
				muted: false,
				version: VERSION,
				overwrite: true,
				webhook: {url: TEST_URL, secret: 'TEST_SECRET'},
				audioBitrate: null,
				videoBitrate: null,
				height: undefined,
				width: undefined,
			},
			extraContext
		);
		const startRes = res as Await<LambdaReturnValues[LambdaRoutines.start]>;

		(await handler(
			{
				type: LambdaRoutines.status,
				bucketName: startRes.bucketName,
				renderId: startRes.renderId,
				version: VERSION,
			},
			extraContext
		)) as Await<LambdaReturnValues[LambdaRoutines.status]>;

		expect(mockableHttpClients.http).toHaveBeenCalledTimes(1);
		expect(mockableHttpClients.http).toHaveBeenCalledWith(
			TEST_URL,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Remotion-Mode': 'production',
					'X-Remotion-Signature': expect.stringContaining('sha512='),
					'X-Remotion-Status': 'timeout',
					'Content-Length': 79,
				},
				timeout: 5000,
			},
			expect.anything()
		);
	});
});
