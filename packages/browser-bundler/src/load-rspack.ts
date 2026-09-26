import type * as RspackBrowser from '@rspack/browser';
import type {BrowserBundlerProgress} from './types';

let rspackBrowserPromise: Promise<typeof RspackBrowser> | null = null;

export const loadRspackBrowser = (
	onProgress: ((progress: BrowserBundlerProgress) => void) | null,
) => {
	const workerGlobal = globalThis as Record<string, unknown>;
	workerGlobal.window ??= globalThis;
	if (rspackBrowserPromise) {
		return rspackBrowserPromise;
	}

	const originalFetch = globalThis.fetch.bind(globalThis);
	workerGlobal.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		const response = await originalFetch(input, init);
		const inputUrl =
			typeof input === 'string'
				? input
				: input instanceof URL
					? input.href
					: input.url;
		if (!inputUrl.split(/[?#]/)[0].endsWith('.wasm')) {
			return response;
		}

		if (!response.ok) {
			throw new Error(`Failed to load Rspack WASM: ${response.status}`);
		}

		const contentLength = Number(response.headers.get('content-length'));
		const totalBytes =
			Number.isFinite(contentLength) && contentLength > 0
				? contentLength
				: null;
		onProgress?.({
			asset: 'rspack-wasm',
			loadedBytes: 0,
			totalBytes,
		});
		if (!response.body) {
			onProgress?.({
				asset: 'rspack-wasm',
				loadedBytes: totalBytes ?? 0,
				totalBytes,
			});
			return response;
		}

		const reader = response.body.getReader();
		let loadedBytes = 0;
		let lastProgressUpdate = 0;
		const body = new ReadableStream<Uint8Array>({
			async pull(controller) {
				try {
					const result = await reader.read();
					if (result.done) {
						onProgress?.({
							asset: 'rspack-wasm',
							loadedBytes,
							totalBytes: totalBytes ?? loadedBytes,
						});
						controller.close();
						return;
					}

					loadedBytes += result.value.byteLength;
					const now = performance.now();
					if (now - lastProgressUpdate >= 50) {
						lastProgressUpdate = now;
						onProgress?.({
							asset: 'rspack-wasm',
							loadedBytes,
							totalBytes,
						});
					}

					controller.enqueue(result.value);
				} catch (error) {
					controller.error(error);
				}
			},
			cancel(reason) {
				return reader.cancel(reason);
			},
		});

		return new Response(body, {
			headers: response.headers,
			status: response.status,
			statusText: response.statusText,
		});
	};

	rspackBrowserPromise = import('@rspack/browser').finally(() => {
		workerGlobal.fetch = originalFetch;
	});
	return rspackBrowserPromise;
};
