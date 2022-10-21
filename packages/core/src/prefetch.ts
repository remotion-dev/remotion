import {useContext} from 'react';
import {getRemotionEnvironment} from './get-environment';
import {PreloadContext, setPreloads} from './prefetch-state';

export const usePreload = (src: string): Blob => {
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

export const prefetch = (
	src: string,
	options?: {
		method?: 'blob-url' | 'base64';
	}
): FetchAndPreload => {
	const method = options?.method ?? 'blob-url';

	if (getRemotionEnvironment() === 'rendering') {
		return {
			free: () => undefined,
			waitUntilDone: () => Promise.resolve(src),
		};
	}

	let canceled = false;
	const objectUrl: string | null = null;
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

			return buf;
		})
		.then((buf) => {
			if (canceled) {
				return;
			}

			setPreloads((p) => ({
				...p,
				[src]: buf as Blob,
			}));
			resolve(buf);
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
