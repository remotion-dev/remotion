import {useContext} from 'react';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import type {LogLevel} from './log.js';
import {Log} from './log.js';
import {playbackLogging} from './playback-logging.js';
import {PreloadContext, setPreloads} from './prefetch-state.js';

export const usePreload = (src: string): string => {
	const preloads = useContext(PreloadContext);

	return preloads[src] ?? src;
};

type FetchAndPreload = {
	free: () => void;
	waitUntilDone: () => Promise<string>;
};

const blobToBase64 = function (blob: Blob): Promise<string> {
	const reader = new FileReader();

	return new Promise((resolve, reject) => {
		reader.onload = function () {
			const dataUrl = reader.result as string;
			resolve(dataUrl);
		};

		reader.onerror = (err) => {
			return reject(err);
		};

		reader.readAsDataURL(blob);
	});
};

export type PrefetchOnProgress = (options: {
	totalBytes: number | null;
	loadedBytes: number;
}) => void;

const getBlobFromReader = async ({
	reader,
	contentType,
	contentLength,
	onProgress,
}: {
	reader: ReadableStreamDefaultReader<Uint8Array>;
	contentType: string | null;
	contentLength: number | null;
	onProgress: PrefetchOnProgress | undefined;
}): Promise<Blob> => {
	let receivedLength = 0;
	const chunks = [];
	while (true) {
		const {done, value} = await reader.read();

		if (done) {
			break;
		}

		chunks.push(value);
		receivedLength += value.length;
		if (onProgress) {
			onProgress({loadedBytes: receivedLength, totalBytes: contentLength});
		}
	}

	const chunksAll = new Uint8Array(receivedLength);
	let position = 0;

	for (const chunk of chunks) {
		chunksAll.set(chunk, position);
		position += chunk.length;
	}

	return new Blob([chunksAll], {
		type: contentType ?? undefined,
	});
};

/*
 * @description When you call the prefetch() function, an asset will be fetched and kept in memory so it is ready when you want to play it in a <Player>.
 * @see [Documentation](https://www.remotion.dev/docs/prefetch)
 */
export const prefetch = (
	src: string,
	options?: {
		method?: 'blob-url' | 'base64';
		contentType?: string;
		onProgress?: PrefetchOnProgress;
		credentials?: RequestCredentials;
		logLevel?: LogLevel;
	},
): FetchAndPreload => {
	const method = options?.method ?? 'blob-url';
	const logLevel = options?.logLevel ?? 'info';

	if (getRemotionEnvironment().isRendering) {
		return {
			free: () => undefined,
			waitUntilDone: () => Promise.resolve(src),
		};
	}

	Log.verbose(logLevel, `[prefetch] Starting prefetch ${src}`);

	let canceled = false;
	let objectUrl: string | null = null;
	let resolve: (src: string) => void = () => undefined;
	let reject: (err: Error) => void = () => undefined;

	const waitUntilDone = new Promise<string>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	const controller = new AbortController();
	let canBeAborted = true;

	fetch(src, {
		signal: controller.signal,
		credentials: options?.credentials ?? undefined,
	})
		.then((res) => {
			canBeAborted = false;
			if (canceled) {
				return null;
			}

			if (!res.ok) {
				throw new Error(`HTTP error, status = ${res.status}`);
			}

			const headerContentType = res.headers.get('Content-Type');

			const contentType = options?.contentType ?? headerContentType;
			const hasProperContentType =
				contentType &&
				(contentType.startsWith('video/') ||
					contentType.startsWith('audio/') ||
					contentType.startsWith('image/'));

			if (!hasProperContentType) {
				// eslint-disable-next-line no-console
				console.warn(
					`Called prefetch() on ${src} which returned a "Content-Type" of ${headerContentType}. Prefetched content should have a proper content type (video/... or audio/...) or a contentType passed the options of prefetch(). Otherwise, prefetching will not work properly in all browsers.`,
				);
			}

			if (!res.body) {
				throw new Error(`HTTP response of ${src} has no body`);
			}

			const reader = res.body.getReader();

			return getBlobFromReader({
				reader,
				contentType: options?.contentType ?? headerContentType ?? null,
				contentLength: res.headers.get('Content-Length')
					? parseInt(res.headers.get('Content-Length')!, 10)
					: null,
				onProgress: options?.onProgress,
			});
		})
		.then((buf) => {
			if (!buf) {
				return;
			}

			const actualBlob = options?.contentType
				? new Blob([buf], {type: options.contentType})
				: buf;

			if (method === 'base64') {
				return blobToBase64(actualBlob);
			}

			return URL.createObjectURL(actualBlob);
		})
		.then((url) => {
			if (canceled) {
				return;
			}

			playbackLogging({
				logLevel,
				tag: 'prefetch',
				message: `Finished prefetch ${src} with method ${method}`,
				mountTime: null,
			});

			objectUrl = url as string;

			setPreloads((p) => ({
				...p,
				[src]: objectUrl as string,
			}));
			resolve(objectUrl);
		})
		.catch((err) => {
			if (err?.message.includes('free() called')) {
				return;
			}

			reject(err);
		});

	return {
		free: () => {
			playbackLogging({
				logLevel,
				tag: 'prefetch',
				message: `Freeing ${src}`,
				mountTime: null,
			});
			if (objectUrl) {
				if (method === 'blob-url') {
					URL.revokeObjectURL(objectUrl);
				}

				setPreloads((p) => {
					const copy = {...p};
					delete copy[src];
					return copy;
				});
			} else {
				canceled = true;
				if (canBeAborted) {
					try {
						controller.abort(new Error('free() called'));
					} catch {}
				}
			}
		},
		waitUntilDone: () => {
			return waitUntilDone;
		},
	};
};
