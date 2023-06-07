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
import type {
	LambdaReturnValues,
	StreamedResponse,
} from '../../shared/return-values';
import {disableLogs, enableLogs} from '../disable-logs';

const extraContext = {
	invokedFunctionArn: 'arn:fake',
	getRemainingTimeInMillis: () => 120000,
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
				serveUrl:
					'https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/',
				chromiumOptions: {},
				codec: 'h264',
				composition: 'react-svg',
				crf: 9,
				envVariables: {},
				frameRange: [0, 2],
				framesPerLambda: 8,
				imageFormat: 'png',
				inputProps: {
					type: 'payload',
					payload: '{}',
				},
				logLevel: 'warn',
				maxRetries: 3,
				outName: 'out.mp4',
				pixelFormat: 'yuv420p',
				privacy: 'public',
				proResProfile: undefined,
				jpegQuality: undefined,
				scale: 1,
				timeoutInMilliseconds: 40000,
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
				forceHeight: null,
				forceWidth: null,
				rendererFunctionName: null,
				bucketName: null,
				audioCodec: null,
				dumpBrowserLogs: false,
			},
			extraContext
		);
		const startRes = res as StreamedResponse;

		const parsed = JSON.parse(startRes.body) as Await<
			LambdaReturnValues[LambdaRoutines.start]
		>;

		await handler(
			{
				type: LambdaRoutines.status,
				bucketName: parsed.bucketName,
				renderId: parsed.renderId,
				version: VERSION,
			},
			extraContext
		);

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

		await handler(
			{
				type: LambdaRoutines.launch,
				serveUrl:
					'https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/',
				chromiumOptions: {},
				codec: 'h264',
				composition: 'react-svg',
				crf: 9,
				envVariables: {},
				frameRange: [0, 10],
				framesPerLambda: 8,
				imageFormat: 'png',
				inputProps: {
					type: 'payload',
					payload: '{}',
				},
				logLevel: 'warn',
				maxRetries: 3,
				outName: 'out.mp4',
				pixelFormat: 'yuv420p',
				privacy: 'public',
				proResProfile: undefined,
				jpegQuality: undefined,
				scale: 1,
				timeoutInMilliseconds: 3000,
				numberOfGifLoops: null,
				everyNthFrame: 1,
				concurrencyPerLambda: 1,
				downloadBehavior: {
					type: 'play-in-browser',
				},
				muted: false,
				overwrite: true,
				webhook: {url: TEST_URL, secret: 'TEST_SECRET'},
				audioBitrate: null,
				videoBitrate: null,
				bucketName: 'abc',
				renderId: 'abc',
				forceHeight: null,
				forceWidth: null,
				rendererFunctionName: null,
				audioCodec: null,
				dumpBrowserLogs: false,
			},
			{
				...extraContext,
				getRemainingTimeInMillis: () => 1000,
			}
		);

		await new Promise((resolve) => {
			setTimeout(resolve, 2000);
		});
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
					'Content-Length': 54,
				},
				timeout: 5000,
			},
			expect.anything()
		);
	});
});
