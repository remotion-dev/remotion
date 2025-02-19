import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {cancelRender, continueRender, delayRender} from 'remotion';
import {getAudioData} from './get-audio-data';
import type {AudioData} from './types';

/*
 * @description Wraps the getAudioData() function into a hook and does three things: keeps the audio data in a state, wraps the function in a delayRender() / continueRender() pattern, and handles the case where the component gets unmounted while fetching is in progress to prevent React errors.
 * @see [Documentation](https://www.remotion.dev/docs/use-audio-data)
 */
export const useAudioData = (src: string): AudioData | null => {
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

	const [metadata, setMetadata] = useState<AudioData | null>(null);

	const fetchMetadata = useCallback(async () => {
		const handle = delayRender(
			`Waiting for audio metadata with src="${src}" to be loaded`,
		);

		try {
			const data = await getAudioData(src);
			if (mountState.current.isMounted) {
				setMetadata(data);
			}
		} catch (err) {
			cancelRender(err);
		}

		continueRender(handle);
	}, [src]);

	useLayoutEffect(() => {
		fetchMetadata();
	}, [fetchMetadata]);

	return metadata;
};
