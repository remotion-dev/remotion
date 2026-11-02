import {useLayoutEffect, useState} from 'react';
import {useDelayRender} from 'remotion';
import {getAudioData} from './get-audio-data';
import type {MediaUtilsAudioData} from './types';

export type UseAudioDataOptions = {
	sampleRate?: number;
	/**
	 * Captured only from the first render and passed to `fetch()`.
	 * Updates after mount are ignored so hooks do not depend on a new object
	 * identity every render (e.g. inline `{credentials: 'include'}`).
	 */
	requestInit?: RequestInit;
};

/*
 * @description Wraps the getAudioData() function into a hook and does three things: keeps the audio data in a state, wraps the function in a delayRender() / continueRender() pattern, and handles the case where the component gets unmounted while fetching is in progress to prevent React errors.
 * @see [Documentation](https://www.remotion.dev/docs/use-audio-data)
 */
export const useAudioData = (
	src: string,
	options?: UseAudioDataOptions,
): MediaUtilsAudioData | null => {
	if (!src) {
		throw new TypeError("useAudioData requires a 'src' parameter");
	}

	const [metadata, setMetadata] = useState<MediaUtilsAudioData | null>(null);
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const sampleRate = options?.sampleRate;
	const [initialRequestInit] = useState(options?.requestInit);

	useLayoutEffect(() => {
		let cancelled = false;
		const handle = delayRender(
			`Waiting for audio metadata with src="${src}" to be loaded`,
		);

		const fetchMetadata = async () => {
			try {
				const data = await getAudioData(
					src,
					sampleRate === undefined && initialRequestInit === undefined
						? undefined
						: {sampleRate, requestInit: initialRequestInit},
				);
				if (!cancelled) {
					setMetadata(data);
				}
			} catch (err) {
				if (!cancelled) {
					cancelRender(err);
				}
			}

			continueRender(handle);
		};

		fetchMetadata();

		return () => {
			cancelled = true;
			continueRender(handle);
		};
	}, [
		src,
		sampleRate,
		initialRequestInit,
		delayRender,
		continueRender,
		cancelRender,
	]);

	return metadata;
};
