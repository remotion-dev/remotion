import {expect, test} from 'bun:test';
import {Readable} from 'node:stream';
import type {
	CloudProvider,
	ProviderSpecifics,
} from '@remotion/serverless-client';
import {ServerlessRoutines, VERSION} from '@remotion/serverless-client';
import {innerHandler, innerRoutine} from '../inner-routine';
import {makeInitialOverallRenderProgress} from '../overall-render-progress';
import type {InsideFunctionSpecifics} from '../provider-implementation';

type MockProvider = CloudProvider<
	'mock-region',
	Record<string, never>,
	Record<string, never>,
	'normal',
	Record<string, never>
>;

test('progress works without AWS context or a bucket owner', async () => {
	const previousFlag = process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA;
	delete process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA;
	const chunks: Uint8Array[] = [];
	let ended = false;
	const reads: Array<string | null> = [];

	try {
		await innerHandler<MockProvider>({
			params: {
				type: ServerlessRoutines.status,
				version: VERSION,
				logLevel: 'error',
				bucketName: 'render-storage',
				renderId: 'render-id',
				forcePathStyle: false,
				s3OutputProvider: null,
			},
			context: {
				requestId: 'request-id',
				expectedBucketOwner: null,
				getRemainingTimeInMillis: () => 120_000,
			},
			responseWriter: {
				write: (message) => {
					chunks.push(message);
					return Promise.resolve();
				},
				end: () => {
					ended = true;
					return Promise.resolve();
				},
			},
			providerSpecifics: {
				printLoggingHelper: false,
				getBillingCurrency: () => 'USD',
				readFile: ({expectedBucketOwner}) => {
					reads.push(expectedBucketOwner);
					return Promise.resolve(
						Readable.from([
							Buffer.from(
								JSON.stringify(
									makeInitialOverallRenderProgress(Date.now() + 120_000, false),
								),
							),
						]),
					);
				},
			} as Partial<
				ProviderSpecifics<MockProvider>
			> as ProviderSpecifics<MockProvider>,
			insideFunctionSpecifics: {
				deleteTmpDir: () => Promise.resolve(),
				getCurrentRegionInFunction: () => 'mock-region',
				getCurrentMemorySizeInMb: () => 2048,
				getCurrentFunctionName: () => 'render-worker',
			} as InsideFunctionSpecifics<MockProvider>,
		});

		expect(ended).toBe(true);
		expect(JSON.parse(Buffer.concat(chunks).toString())).toMatchObject({
			type: 'success',
			renderId: 'render-id',
			bucket: 'render-storage',
			done: false,
		});
		expect(reads).toEqual([null]);
		expect(process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA).toBeUndefined();
	} finally {
		if (previousFlag === undefined) {
			delete process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA;
		} else {
			process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA = previousFlag;
		}
	}
});

test('buffered still errors are written to the response', async () => {
	const chunks: Uint8Array[] = [];
	let ended = false;

	await innerHandler<MockProvider>({
		params: {
			type: 'still',
			streamed: false,
			version: VERSION,
			downloadBehavior: 'invalid',
			deleteAfter: null,
			maxRetries: 0,
			frame: 0,
			attempt: 1,
			logLevel: 'error',
		} as never,
		responseWriter: {
			write: (message) => {
				chunks.push(message);
				return Promise.resolve();
			},
			end: () => {
				ended = true;
				return Promise.resolve();
			},
		},
		context: {
			requestId: 'request-id',
			expectedBucketOwner: null,
			getRemainingTimeInMillis: () => 120_000,
		},
		providerSpecifics: {
			isFlakyError: () => false,
			printLoggingHelper: false,
			randomHash: () => 'random-hash',
			validateDeleteAfter: () => undefined,
		} as unknown as ProviderSpecifics<MockProvider>,
		insideFunctionSpecifics: {
			deleteTmpDir: () => Promise.resolve(),
			generateRandomId: () => 'render-id',
		} as unknown as InsideFunctionSpecifics<MockProvider>,
	});

	expect(ended).toBe(true);
	expect(chunks).toHaveLength(1);
	const response = JSON.parse(new TextDecoder().decode(chunks[0])) as {
		type: string;
		message: string;
		stack: string;
	};
	expect(response).toMatchObject({
		type: 'error',
		message: 'downloadBehavior must be null or an object',
	});
	expect(response.stack).toContain(
		'Error: downloadBehavior must be null or an object',
	);
});

test('buffered render start exceptions are written to the response', async () => {
	const chunks: Uint8Array[] = [];
	let ended = false;

	await innerRoutine<MockProvider>({
		params: {
			type: 'start',
			version: VERSION,
			logLevel: 'error',
			deleteAfter: null,
		} as never,
		responseWriter: {
			write: (message) => {
				chunks.push(message);
				return Promise.resolve();
			},
			end: () => {
				ended = true;
				return Promise.resolve();
			},
		},
		context: {
			requestId: 'request-id',
			expectedBucketOwner: null,
			getRemainingTimeInMillis: () => 120_000,
		},
		providerSpecifics: {
			printLoggingHelper: false,
			randomHash: () => 'random-hash',
		} as unknown as ProviderSpecifics<MockProvider>,
		insideFunctionSpecifics: {
			deleteTmpDir: () => Promise.resolve(),
			generateRandomId: () => {
				throw new Error('Could not generate a render ID');
			},
		} as unknown as InsideFunctionSpecifics<MockProvider>,
	});

	expect(ended).toBe(true);
	expect(chunks).toHaveLength(1);
	const response = JSON.parse(new TextDecoder().decode(chunks[0])) as {
		type: string;
		message: string;
		stack: string;
	};
	expect(response).toMatchObject({
		type: 'error',
		message: 'Could not generate a render ID',
	});
	expect(response.stack).toContain('Error: Could not generate a render ID');
});
