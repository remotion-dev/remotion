import {getIsRendering} from './is-rendering.js';
import type {LogLevel} from './log.js';
import {playbackLogging} from './playback-logging.js';
import {setPreloads} from './prefetch-state-shared.js';
import {getSrcWithoutHash} from './prefetch-utils.js';
import type {PrefetchOnProgress} from './prefetch.js';

export type ResumablePrefetchOptions = {
	contentType?: string;
	onProgress?: PrefetchOnProgress;
	credentials?: RequestCredentials;
	logLevel?: LogLevel;
};

export type ResumablePrefetchHandle = {
	pause: () => void;
	resume: () => void;
	free: () => void;
	waitUntilDone: () => Promise<string>;
};

type State = 'paused' | 'downloading' | 'done' | 'freed' | 'failed';

type ParsedContentRange = {
	start: number;
	end: number;
	totalBytes: number | null;
};

const parseContentRange = (value: string | null): ParsedContentRange | null => {
	if (!value) {
		return null;
	}

	const match = value.match(/^bytes (\d+)-(\d+)\/(\d+|\*)$/);
	if (!match) {
		return null;
	}

	const parsed = {
		start: Number(match[1]),
		end: Number(match[2]),
		totalBytes: match[3] === '*' ? null : Number(match[3]),
	};
	if (
		parsed.end < parsed.start ||
		(parsed.totalBytes !== null && parsed.end >= parsed.totalBytes)
	) {
		return null;
	}

	return parsed;
};

const parseUnsatisfiedContentRange = (value: string | null): number | null => {
	const match = value?.match(/^bytes \*\/(\d+)$/);
	return match ? Number(match[1]) : null;
};

const getValidator = (response: Response): string | null => {
	const etag = response.headers.get('ETag');
	if (etag && !etag.trimStart().startsWith('W/')) {
		return etag;
	}

	return response.headers.get('Last-Modified');
};

const getContentLength = (response: Response): number | null => {
	const value = response.headers.get('Content-Length');
	if (value === null) {
		return null;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const getError = (error: unknown): Error => {
	if (error instanceof Error) {
		return error;
	}

	return new Error(String(error));
};

/*
 * @description Prefetches an asset and allows an in-progress download to be paused and resumed.
 * @see [Documentation](https://www.remotion.dev/docs/resumable-prefetch)
 */
export const resumablePrefetch = (
	src: string,
	options?: ResumablePrefetchOptions,
): ResumablePrefetchHandle => {
	const srcWithoutHash = getSrcWithoutHash(src);

	if (getIsRendering()) {
		return {
			pause: () => undefined,
			resume: () => undefined,
			free: () => undefined,
			waitUntilDone: () => Promise.resolve(srcWithoutHash),
		};
	}

	const logLevel = options?.logLevel ?? 'info';
	let state: State = 'paused';
	let chunks: Uint8Array[] = [];
	let loadedBytes = 0;
	let totalBytes: number | null = null;
	let validator: string | null = null;
	let contentType: string | null = options?.contentType ?? null;
	let objectUrl: string | null = null;
	let activeController: AbortController | null = null;
	let activeReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
	let requestId = 0;
	let resolve: (url: string) => void = () => undefined;
	let reject: (error: Error) => void = () => undefined;

	const waitUntilDone = new Promise<string>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	waitUntilDone.catch(() => undefined);

	const invalidateActiveRequest = (reason: Error) => {
		requestId++;
		try {
			activeController?.abort(reason);
		} catch {}

		activeReader?.cancel(reason).catch(() => undefined);
		activeController = null;
		activeReader = null;
	};

	const resetPartialDownload = () => {
		chunks = [];
		loadedBytes = 0;
		totalBytes = null;
		validator = null;
	};

	const finish = () => {
		const bytes = new Uint8Array(loadedBytes);
		let offset = 0;
		for (const chunk of chunks) {
			bytes.set(chunk, offset);
			offset += chunk.byteLength;
		}

		const blob = new Blob([bytes], {type: contentType ?? undefined});
		chunks = [];
		const url = URL.createObjectURL(blob);
		objectUrl = url;
		state = 'done';
		setPreloads((preloads) => ({
			...preloads,
			[srcWithoutHash]: url,
		}));
		playbackLogging({
			logLevel,
			tag: 'prefetch',
			message: `Finished resumable prefetch ${srcWithoutHash}`,
			mountTime: null,
		});
		resolve(url);
	};

	const startRequest = async () => {
		if (state !== 'paused') {
			return;
		}

		if (loadedBytes > 0 && validator === null) {
			resetPartialDownload();
		}

		state = 'downloading';
		const requestedStart = loadedBytes;
		const currentRequestId = ++requestId;
		const controller = new AbortController();
		activeController = controller;
		const headers = new Headers();
		if (requestedStart > 0) {
			headers.set('Range', `bytes=${requestedStart}-`);
			headers.set('If-Range', validator as string);
		}

		playbackLogging({
			logLevel,
			tag: 'prefetch',
			message:
				requestedStart === 0
					? `Starting resumable prefetch ${srcWithoutHash}`
					: `Resuming prefetch ${srcWithoutHash} from byte ${requestedStart}`,
			mountTime: null,
		});

		try {
			const response = await fetch(srcWithoutHash, {
				credentials: options?.credentials,
				headers,
				signal: controller.signal,
			});

			if (currentRequestId !== requestId) {
				await response.body?.cancel();
				return;
			}

			if (response.status === 416 && requestedStart > 0) {
				const actualTotalBytes = parseUnsatisfiedContentRange(
					response.headers.get('Content-Range'),
				);
				if (actualTotalBytes === loadedBytes) {
					activeController = null;
					finish();
					return;
				}
			}

			if (!response.ok) {
				throw new Error(`HTTP error, status = ${response.status}`);
			}

			const parsedContentRange = parseContentRange(
				response.headers.get('Content-Range'),
			);

			if (response.status === 206) {
				if (
					!parsedContentRange ||
					parsedContentRange.start !== requestedStart
				) {
					throw new Error(
						`Expected a Content-Range starting at byte ${requestedStart}`,
					);
				}

				if (
					totalBytes !== null &&
					parsedContentRange.totalBytes !== null &&
					totalBytes !== parsedContentRange.totalBytes
				) {
					throw new Error('The asset size changed while resuming the prefetch');
				}

				totalBytes = parsedContentRange.totalBytes;
				if (requestedStart === 0) {
					validator = getValidator(response);
				}
			} else if (response.status === 200) {
				if (requestedStart > 0) {
					resetPartialDownload();
				}

				totalBytes = getContentLength(response);
				validator = getValidator(response);
			} else {
				throw new Error(`Unexpected HTTP status ${response.status}`);
			}

			contentType =
				options?.contentType ??
				response.headers.get('Content-Type') ??
				contentType;

			if (!response.body) {
				throw new Error(`HTTP response of ${srcWithoutHash} has no body`);
			}

			const reader = response.body.getReader();
			activeReader = reader;
			while (true) {
				const {done, value} = await reader.read();
				if (currentRequestId !== requestId) {
					return;
				}

				if (done) {
					break;
				}

				const retainedChunk = value.slice();
				chunks.push(retainedChunk);
				loadedBytes += retainedChunk.byteLength;
				options?.onProgress?.({loadedBytes, totalBytes});
			}

			activeController = null;
			activeReader = null;
			if (
				response.status === 206 &&
				parsedContentRange !== null &&
				loadedBytes !== parsedContentRange.end + 1
			) {
				throw new Error(
					'The resumed response body did not match Content-Range',
				);
			}

			if (
				response.status === 206 &&
				parsedContentRange !== null &&
				parsedContentRange.totalBytes !== null &&
				loadedBytes < parsedContentRange.totalBytes
			) {
				state = 'paused';
				startRequest();
				return;
			}

			finish();
		} catch (error) {
			if (currentRequestId !== requestId) {
				return;
			}

			activeController = null;
			activeReader = null;
			state = 'failed';
			chunks = [];
			reject(getError(error));
		}
	};

	const pause = () => {
		if (state !== 'downloading') {
			return;
		}

		state = 'paused';
		invalidateActiveRequest(new Error('pause() called'));
	};

	const resume = () => {
		startRequest();
	};

	const free = () => {
		if (state === 'freed') {
			return;
		}

		const wasDone = state === 'done';
		state = 'freed';
		invalidateActiveRequest(new Error('free() called'));
		chunks = [];
		loadedBytes = 0;
		totalBytes = null;
		validator = null;

		if (objectUrl) {
			URL.revokeObjectURL(objectUrl);
			objectUrl = null;
			setPreloads((preloads) => {
				const copy = {...preloads};
				delete copy[srcWithoutHash];
				return copy;
			});
		}

		if (!wasDone) {
			reject(new Error('free() called'));
		}
	};

	resume();

	return {
		pause,
		resume,
		free,
		waitUntilDone: () => waitUntilDone,
	};
};
