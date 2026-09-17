import {BrowserBundlerError} from './errors';
import type {
	BrowserBundle,
	BrowserBundler,
	BrowserBundlerOptions,
	BrowserBundlerWorkerRequest,
	BrowserBundlerWorkerResponse,
} from './types';

export const createBrowserBundler = (
	options: BrowserBundlerOptions = {},
): BrowserBundler => {
	if (typeof Worker === 'undefined') {
		throw new Error('createBrowserBundler() must be called in a browser.');
	}

	if (!globalThis.crossOriginIsolated) {
		throw new Error(
			'The browser bundler requires cross-origin isolation. Serve the page with Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp.',
		);
	}

	const worker = options.workerUrl
		? new Worker(options.workerUrl, {type: 'module'})
		: new Worker(new URL('./browser-bundler-worker.js', import.meta.url), {
				type: 'module',
			});
	const dependencyVersions = {...options.dependencyVersions};
	const pending = new Map<
		number,
		{
			resolve: (bundle: BrowserBundle) => void;
			reject: (error: Error) => void;
		}
	>();
	let nextId = 0;
	let terminalError: Error | null = null;

	const stop = (error: Error) => {
		terminalError = error;
		worker.terminate();
		for (const request of pending.values()) {
			request.reject(error);
		}

		pending.clear();
	};

	worker.onmessage = (event: MessageEvent<BrowserBundlerWorkerResponse>) => {
		const response = event.data;
		if (response.type === 'progress') {
			options.onProgress?.(response);
			return;
		}

		const request = pending.get(response.id);
		if (!request) {
			return;
		}

		pending.delete(response.id);
		if (response.type === 'error') {
			const error = new BrowserBundlerError(
				response.error.message,
				response.error.diagnostics,
			);
			if (response.error.stack) {
				error.stack = response.error.stack;
			}

			request.reject(error);
			return;
		}

		request.resolve(response.bundle);
	};

	worker.onerror = (event) => {
		stop(new Error(event.message || 'The browser compiler worker failed.'));
	};

	worker.onmessageerror = () => {
		stop(new Error('Could not read the browser compiler worker response.'));
	};

	return {
		bundle: ({project}) => {
			if (terminalError) {
				return Promise.reject(terminalError);
			}

			const id = nextId++;
			return new Promise<BrowserBundle>((resolve, reject) => {
				pending.set(id, {resolve, reject});
				try {
					worker.postMessage({
						id,
						project,
						dependencyVersions,
					} satisfies BrowserBundlerWorkerRequest);
				} catch (error) {
					pending.delete(id);
					reject(error);
				}
			});
		},
		dispose: () => {
			stop(new Error('The browser bundler has been disposed.'));
		},
	};
};
