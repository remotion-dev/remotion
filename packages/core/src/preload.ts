import {createRef, useImperativeHandle, useState} from 'react';
import {getRemotionEnvironment} from './get-environment';

const preloadRef = createRef<{
	setPreloads: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}>();

export const usePreload = (src: string): string => {
	const [preloads, setPreloads] = useState<Record<string, string>>({});

	useImperativeHandle(preloadRef, () => {
		return {
			setPreloads,
		};
	});

	return preloads[src] ?? src;
};

type FetchAndPreload = {
	unpreload: () => void;
	waitForDone: () => Promise<string>;
};

export const fetchAndPreload = (src: string): FetchAndPreload => {
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

	fetch(src)
		.then((res) => {
			if (canceled) {
				reject(new Error('Preloading cancelled'));
				return null;
			}

			if (!res.ok) {
				throw new Error(`HTTP error, status = ${res.status}`);
			}

			return res.blob();
		})
		.then((buf) => {
			if (canceled) {
				reject(new Error('Preloading cancelled'));
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
				reject(new Error('Preloading cancelled'));
			}
		},
		waitForDone: () => {
			return waitUntilDone;
		},
	};
};
