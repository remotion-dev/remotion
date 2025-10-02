import type {
	WebhookErrorPayload,
	WebhookSuccessPayload,
	WebhookTimeoutPayload,
} from '@remotion/serverless-client';
import {expect, test} from 'bun:test';
import type {
	Request as ExpressRequest,
	Response as ExpressResponse,
} from 'express';
import type {NextApiRequest, NextApiResponse} from 'next';
import {appRouterWebhook} from '../app-router-webhook';
import {expressWebhook} from '../express-webhook';
import {pagesRouterWebhook} from '../pages-router-webhook';

const TEST_SECRET = 'test-secret';

// Helper function to calculate the webhook signature
const calculateSignature = (payload: unknown, secret: string): string => {
	const Crypto = require('crypto');
	const hmac = Crypto.createHmac('sha512', secret);
	return `sha512=${hmac.update(JSON.stringify(payload)).digest('hex')}`;
};

const createMockSuccessPayload = (): WebhookSuccessPayload => ({
	type: 'success',
	renderId: 'test-render-id',
	expectedBucketOwner: 'test-owner',
	bucketName: 'test-bucket',
	customData: null,
	lambdaErrors: [],
	outputUrl: 'https://example.com/output.mp4',
	outputFile: 'output.mp4',
	timeToFinish: 1000,
	costs: {
		currency: 'USD',
		disclaimer: 'Test disclaimer',
		estimatedCost: 0.01,
		estimatedDisplayCost: '$0.01',
	},
});

const createMockTimeoutPayload = (): WebhookTimeoutPayload => ({
	type: 'timeout',
	renderId: 'test-render-id',
	expectedBucketOwner: 'test-owner',
	bucketName: 'test-bucket',
	customData: null,
});

const createMockErrorPayload = (): WebhookErrorPayload => ({
	type: 'error',
	renderId: 'test-render-id',
	expectedBucketOwner: 'test-owner',
	bucketName: 'test-bucket',
	customData: null,
	errors: [
		{
			message: 'Test error',
			name: 'TestError',
			stack: 'Error stack',
		},
	],
});

test('appRouterWebhook should await async onSuccess callback', async () => {
	let callbackCompleted = false;
	let callbackValue = '';

	const webhook = appRouterWebhook({
		secret: TEST_SECRET,
		onSuccess: async (payload) => {
			// Simulate async operation
			await new Promise<void>((resolve) => {
				setTimeout(() => resolve(), 50);
			});
			callbackValue = payload.renderId;
			callbackCompleted = true;
		},
	});

	const mockPayload = createMockSuccessPayload();
	const mockRequest = new Request('http://localhost:3000/webhook', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Remotion-Signature': calculateSignature(mockPayload, TEST_SECRET),
		},
		body: JSON.stringify(mockPayload),
	});

	// The webhook should await the async callback
	await webhook(mockRequest);

	// Callback should have completed before the function returns
	expect(callbackCompleted).toBe(true);
	expect(callbackValue).toBe('test-render-id');
});

test('appRouterWebhook should await async onTimeout callback', async () => {
	let callbackCompleted = false;

	const webhook = appRouterWebhook({
		secret: TEST_SECRET,
		onTimeout: async () => {
			await new Promise<void>((resolve) => {
				setTimeout(() => resolve(), 50);
			});
			callbackCompleted = true;
		},
	});

	const mockPayload = createMockTimeoutPayload();
	const mockRequest = new Request('http://localhost:3000/webhook', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Remotion-Signature': calculateSignature(mockPayload, TEST_SECRET),
		},
		body: JSON.stringify(mockPayload),
	});

	await webhook(mockRequest);

	expect(callbackCompleted).toBe(true);
});

test('appRouterWebhook should await async onError callback', async () => {
	let callbackCompleted = false;

	const webhook = appRouterWebhook({
		secret: TEST_SECRET,
		onError: async () => {
			await new Promise<void>((resolve) => {
				setTimeout(() => resolve(), 50);
			});
			callbackCompleted = true;
		},
	});

	const mockPayload = createMockErrorPayload();
	const mockRequest = new Request('http://localhost:3000/webhook', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Remotion-Signature': calculateSignature(mockPayload, TEST_SECRET),
		},
		body: JSON.stringify(mockPayload),
	});

	await webhook(mockRequest);

	expect(callbackCompleted).toBe(true);
});

test('pagesRouterWebhook should await async onSuccess callback', async () => {
	let callbackCompleted = false;
	let callbackValue = '';

	const webhook = pagesRouterWebhook({
		secret: TEST_SECRET,
		onSuccess: async (payload) => {
			await new Promise<void>((resolve) => {
				setTimeout(() => resolve(), 50);
			});
			callbackValue = payload.renderId;
			callbackCompleted = true;
		},
	});

	const mockPayload = createMockSuccessPayload();

	// Mock NextApiRequest and NextApiResponse
	const mockReq = {
		method: 'POST',
		body: mockPayload,
		headers: {
			'x-remotion-signature': calculateSignature(mockPayload, TEST_SECRET),
		},
	} as unknown as NextApiRequest;

	const mockRes = {
		setHeader: () => {},
		status: () => ({
			json: () => {},
		}),
	} as unknown as NextApiResponse;

	await webhook(mockReq, mockRes);

	expect(callbackCompleted).toBe(true);
	expect(callbackValue).toBe('test-render-id');
});

test('expressWebhook should await async onSuccess callback', async () => {
	let callbackCompleted = false;
	let callbackValue = '';

	const webhook = expressWebhook({
		secret: TEST_SECRET,
		onSuccess: async (payload) => {
			await new Promise<void>((resolve) => {
				setTimeout(() => resolve(), 50);
			});
			callbackValue = payload.renderId;
			callbackCompleted = true;
		},
	});

	const mockPayload = createMockSuccessPayload();

	// Mock Express Request and Response
	const mockReq = {
		method: 'POST',
		body: mockPayload,
		header: () => calculateSignature(mockPayload, TEST_SECRET),
	} as unknown as ExpressRequest;

	const mockRes = {
		setHeader: () => {},
		status: () => ({
			json: () => {},
		}),
	} as unknown as ExpressResponse;

	await webhook(mockReq, mockRes);

	expect(callbackCompleted).toBe(true);
	expect(callbackValue).toBe('test-render-id');
});

test('appRouterWebhook should work with sync callbacks', async () => {
	let callbackCompleted = false;

	const webhook = appRouterWebhook({
		secret: TEST_SECRET,
		onSuccess: () => {
			callbackCompleted = true;
		},
	});

	const mockPayload = createMockSuccessPayload();
	const mockRequest = new Request('http://localhost:3000/webhook', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Remotion-Signature': calculateSignature(mockPayload, TEST_SECRET),
		},
		body: JSON.stringify(mockPayload),
	});

	await webhook(mockRequest);

	expect(callbackCompleted).toBe(true);
});

test('pagesRouterWebhook should work with sync callbacks', async () => {
	let callbackCompleted = false;

	const webhook = pagesRouterWebhook({
		secret: TEST_SECRET,
		onSuccess: () => {
			callbackCompleted = true;
		},
	});

	const mockPayload = createMockSuccessPayload();
	const mockReq = {
		method: 'POST',
		body: mockPayload,
		headers: {
			'x-remotion-signature': calculateSignature(mockPayload, TEST_SECRET),
		},
	} as unknown as NextApiRequest;

	const mockRes = {
		setHeader: () => {},
		status: () => ({
			json: () => {},
		}),
	} as unknown as NextApiResponse;

	await webhook(mockReq, mockRes);

	expect(callbackCompleted).toBe(true);
});
