import {afterEach, beforeEach, describe, expect, mock, test} from 'bun:test';
import {
	resumablePrefetch,
	type ResumablePrefetchHandle,
} from '../resumable-prefetch.js';

const originalFetch = globalThis.fetch;
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
const originalWindowProcess = window.process;

let createdBlob: Blob | null = null;

beforeEach(() => {
	Object.defineProperty(window, 'process', {
		configurable: true,
		value: undefined,
	});
});

const mockObjectUrls = () => {
	URL.createObjectURL = (blob: Blob | MediaSource) => {
		if (!(blob instanceof Blob)) {
			throw new Error('Expected a Blob');
		}

		createdBlob = blob;
		return 'blob:prefetched';
	};

	URL.revokeObjectURL = () => undefined;
};

const mockFetch = (
	implementation: (
		input: Parameters<typeof fetch>[0],
		init?: RequestInit,
	) => Response | Promise<Response>,
) => {
	const fn = mock((input: Parameters<typeof fetch>[0], init?: RequestInit) =>
		Promise.resolve(implementation(input, init)),
	);
	globalThis.fetch = Object.assign(fn, {
		preconnect: originalFetch.preconnect,
	}) as typeof fetch;
	return fn;
};

const getBytes = async () => {
	if (!createdBlob) {
		throw new Error('No blob was created');
	}

	return Array.from(new Uint8Array(await createdBlob.arrayBuffer()));
};

afterEach(() => {
	globalThis.fetch = originalFetch;
	URL.createObjectURL = originalCreateObjectURL;
	URL.revokeObjectURL = originalRevokeObjectURL;
	Object.defineProperty(window, 'process', {
		configurable: true,
		value: originalWindowProcess,
	});
	createdBlob = null;
});

describe('resumablePrefetch()', () => {
	test('resumes a validated partial download', async () => {
		mockObjectUrls();
		let firstRequestWasCanceled = false;
		const firstBody = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(new Uint8Array([1, 2, 3]));
			},
			cancel() {
				firstRequestWasCanceled = true;
			},
		});
		let requestCount = 0;
		mockFetch((_input, init) => {
			requestCount++;
			if (requestCount === 1) {
				return new Response(firstBody, {
					headers: {
						'Content-Length': '6',
						'Content-Type': 'video/mp4',
						ETag: '"version-1"',
					},
				});
			}

			const headers = new Headers(init?.headers);
			expect(headers.get('Range')).toBe('bytes=3-');
			expect(headers.get('If-Range')).toBe('"version-1"');
			return new Response(new Uint8Array([4, 5, 6]), {
				headers: {
					'Content-Range': 'bytes 3-5/6',
					'Content-Type': 'video/mp4',
				},
				status: 206,
			});
		});
		let markPaused: () => void = () => undefined;
		const paused = new Promise<void>((resolve) => {
			markPaused = resolve;
		});
		const handle: ResumablePrefetchHandle = resumablePrefetch(
			'https://example.com/video.mp4',
			{
				onProgress: ({loadedBytes}) => {
					if (loadedBytes === 3) {
						handle.pause();
						markPaused();
					}
				},
			},
		);

		await paused;
		expect(firstRequestWasCanceled).toBe(true);
		handle.resume();
		expect(await handle.waitUntilDone()).toBe('blob:prefetched');
		expect(await getBytes()).toEqual([1, 2, 3, 4, 5, 6]);
	});

	test('restarts when the server ignores the range request', async () => {
		mockObjectUrls();
		const firstBody = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(new Uint8Array([1, 2, 3]));
			},
		});
		let requestCount = 0;
		mockFetch(() => {
			requestCount++;
			if (requestCount === 1) {
				return new Response(firstBody, {
					headers: {'Content-Length': '6', ETag: '"version-1"'},
				});
			}

			return new Response(new Uint8Array([7, 8, 9]), {
				headers: {'Content-Length': '3', ETag: '"version-2"'},
			});
		});
		let markPaused: () => void = () => undefined;
		const paused = new Promise<void>((resolve) => {
			markPaused = resolve;
		});
		const handle: ResumablePrefetchHandle = resumablePrefetch(
			'https://example.com/video.mp4',
			{
				onProgress: ({loadedBytes}) => {
					if (loadedBytes === 3 && requestCount === 1) {
						handle.pause();
						markPaused();
					}
				},
			},
		);

		await paused;
		handle.resume();
		await handle.waitUntilDone();
		expect(await getBytes()).toEqual([7, 8, 9]);
	});

	test('restarts without a validator instead of combining unsafe chunks', async () => {
		mockObjectUrls();
		const firstBody = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(new Uint8Array([1, 2, 3]));
			},
		});
		let requestCount = 0;
		mockFetch((_input, init) => {
			requestCount++;
			if (requestCount === 1) {
				return new Response(firstBody, {
					headers: {'Content-Length': '6'},
				});
			}

			expect(new Headers(init?.headers).has('Range')).toBe(false);
			return new Response(new Uint8Array([4, 5, 6]), {
				headers: {'Content-Length': '3'},
			});
		});
		let markPaused: () => void = () => undefined;
		const paused = new Promise<void>((resolve) => {
			markPaused = resolve;
		});
		const handle: ResumablePrefetchHandle = resumablePrefetch(
			'https://example.com/video.mp4',
			{
				onProgress: ({loadedBytes}) => {
					if (loadedBytes === 3 && requestCount === 1) {
						handle.pause();
						markPaused();
					}
				},
			},
		);

		await paused;
		handle.resume();
		await handle.waitUntilDone();
		expect(await getBytes()).toEqual([4, 5, 6]);
	});
});
