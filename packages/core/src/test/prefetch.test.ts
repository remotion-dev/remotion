import {afterEach, beforeEach, describe, expect, mock, test} from 'bun:test';
import {prefetch} from '../prefetch.js';

const originalFetch = globalThis.fetch;
const originalNodeEnv = window.process.env.NODE_ENV;

beforeEach(() => {
	window.process.env.NODE_ENV = 'development';
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	window.process.env.NODE_ENV = originalNodeEnv;
});

describe('prefetch cancellation', () => {
	test('aborts before receiving the response', async () => {
		const request: {signal: AbortSignal | null} = {signal: null};
		globalThis.fetch = mock((_input: RequestInfo | URL, init?: RequestInit) => {
			request.signal = init?.signal ?? null;
			return new Promise<Response>(() => undefined);
		}) as unknown as typeof fetch;

		const prefetchHandle = prefetch('https://example.com/video.mp4');
		const waitUntilDone = prefetchHandle.waitUntilDone();
		prefetchHandle.free();

		expect(request.signal?.aborted).toBe(true);
		await expect(waitUntilDone).rejects.toThrow('free() called');
	});

	test('cancels the response body after receiving the response', async () => {
		const request: {signal: AbortSignal | null} = {signal: null};
		let bodyWasCanceled = false;
		let reportProgress: () => void = () => undefined;
		const progressReported = new Promise<void>((resolve) => {
			reportProgress = resolve;
		});
		let sentFirstChunk = false;
		const body = new ReadableStream<Uint8Array>({
			pull(controller) {
				if (!sentFirstChunk) {
					sentFirstChunk = true;
					controller.enqueue(new Uint8Array([1, 2, 3]));
				}
			},
			cancel() {
				bodyWasCanceled = true;
			},
		});

		globalThis.fetch = mock((_input: RequestInfo | URL, init?: RequestInit) => {
			request.signal = init?.signal ?? null;
			return Promise.resolve(
				new Response(body, {
					headers: {
						'Content-Length': '6',
						'Content-Type': 'video/mp4',
					},
				}),
			);
		}) as unknown as typeof fetch;

		const prefetchHandle = prefetch('https://example.com/video.mp4', {
			onProgress: () => reportProgress(),
		});
		const waitUntilDone = prefetchHandle.waitUntilDone();
		await progressReported;
		prefetchHandle.free();

		expect(request.signal?.aborted).toBe(true);
		await expect(waitUntilDone).rejects.toThrow('free() called');
		expect(bodyWasCanceled).toBe(true);
	});
});
