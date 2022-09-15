import {useContext} from 'react';
import {getRemotionEnvironment} from './get-environment';
import {PreloadContext, preloadRef} from './preload-state';

export const usePreload = (src: string): string => {
	const {preloads} = useContext(PreloadContext);

	return preloads[src] ?? src;
};

type FetchAndPreload = {
	unpreload: () => void;
	waitForDone: () => Promise<string>;
};

export const prefetch = (src: string): FetchAndPreload => {
	if (getRemotionEnvironment() === 'rendering') {
		return {
			unpreload: () => undefined,
			waitForDone: () => Promise.resolve(src),
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
			if (canceled) {
				return;
			}

			if (buf) {
				objectUrl = URL.createObjectURL(buf);
				preloadRef.current?.setPreloads((p) => ({
					...p,
					[src]: objectUrl as string,
				}));
				resolve(objectUrl);
			}
		})
		.catch((err) => {
			reject(err);
		});

	return {
		unpreload: () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
				preloadRef.current?.setPreloads((p) => {
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
		waitForDone: () => {
			return waitUntilDone;
		},
	};
};
