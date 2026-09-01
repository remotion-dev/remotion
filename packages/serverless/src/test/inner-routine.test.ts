import {expect, test} from 'bun:test';
import type {
	CloudProvider,
	ProviderSpecifics,
} from '@remotion/serverless-client';
import {VERSION} from '@remotion/serverless-client';
import {innerHandler, innerRoutine} from '../inner-routine';
import type {InsideFunctionSpecifics} from '../provider-implementation';

type MockProvider = CloudProvider<
	'mock-region',
	Record<string, never>,
	Record<string, never>,
	'normal',
	Record<string, never>
>;

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
			awsRequestId: 'request-id',
			invokedFunctionArn:
				'arn:aws:lambda:mock-region:123456789012:function:test',
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
			awsRequestId: 'request-id',
			invokedFunctionArn:
				'arn:aws:lambda:mock-region:123456789012:function:test',
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
