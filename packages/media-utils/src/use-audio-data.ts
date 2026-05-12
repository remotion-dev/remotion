import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {cancelRender, useDelayRender} from 'remotion';
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

	const mountState = useRef({isMounted: true});

	useEffect(() => {
		const {current} = mountState;
		current.isMounted = true;
		return () => {
			current.isMounted = false;
		};
	}, []);

	const [metadata, setMetadata] = useState<MediaUtilsAudioData | null>(null);
	const {delayRender, continueRender} = useDelayRender();
	const sampleRate = options?.sampleRate;
	const [initialRequestInit] = useState(options?.requestInit);

	const fetchMetadata = useCallback(async () => {
		const handle = delayRender(
			`Waiting for audio metadata with src="${src}" to be loaded`,
		);

		try {
			const data = await getAudioData(
				src,
				sampleRate === undefined && initialRequestInit === undefined
					? undefined
					: {sampleRate, requestInit: initialRequestInit},
			);
			if (mountState.current.isMounted) {
				setMetadata(data);
			}
		} catch (err) {
			cancelRender(err);
		}

		continueRender(handle);
	}, [src, sampleRate, initialRequestInit, delayRender, continueRender]);

	useLayoutEffect(() => {
		fetchMetadata();
	}, [fetchMetadata]);

	return metadata;
};
