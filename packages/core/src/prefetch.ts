import {useContext} from 'react';
import {getRemotionEnvironment} from './get-remotion-environment.js';
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

/**
 * @description When you call the preFetch() function, an asset will be fetched and kept in memory so it is ready when you want to play it in a <Player>.
 * @see [Documentation](https://www.remotion.dev/docs/prefetch)
 */
export const prefetch = (
	src: string,
	options?: {
		method?: 'blob-url' | 'base64';
		contentType?: string;
	},
): FetchAndPreload => {
	const method = options?.method ?? 'blob-url';

	if (getRemotionEnvironment().isRendering) {
		return {
			free: () => undefined,
			waitUntilDone: () => Promise.resolve(src),
		};
	}

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
	})
		.then((res) => {
			canBeAborted = false;
			if (canceled) {
				return null;
			}

			if (!res.ok) {
				throw new Error(`HTTP error, status = ${res.status}`);
			}

			return res.blob();
		})
		.then((buf) => {
			if (!buf) {
				return;
			}

			if (
				!buf.type.startsWith('video/') &&
				!buf.type.startsWith('audio/') &&
				!buf.type.startsWith('image/') &&
				!options?.contentType
			) {
				// eslint-disable-next-line no-console
				console.warn(
					`Called prefetch() on ${src} which returned a "Content-Type" of ${buf.type}. Prefetched content should have a proper content type (video/... or audio/...) or a contentType passed the options of prefetch(). Otherwise, prefetching will not work properly in all browsers.`,
				);
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

			objectUrl = url as string;

			setPreloads((p) => ({
				...p,
				[src]: objectUrl as string,
			}));
			resolve(objectUrl);
		})
		.catch((err) => {
			reject(err);
		});

	return {
		free: () => {
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
						controller.abort();
					} catch (e) {}
				}
			}
		},
		waitUntilDone: () => {
			return waitUntilDone;
		},
	};
};
