import {useCallback, useEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {getAudioData} from './get-audio-data';
import type {AudioData} from './types';

/**
 * @description Wraps the getAudioData() function into a hook and does 3 things:
 * @description Keeps the audio data in a state
 * @description Wraps the function in a delayRender() / continueRender() pattern.
 * @description Handles the case where the component gets unmounted while the fetching is in progress and a React error is thrown.
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
			`Waiting for audio metadata with src="${src}" to be loaded`
		);
		const data = await getAudioData(src);
		if (mountState.current.isMounted) {
			setMetadata(data);
		}

		continueRender(handle);
	}, [src]);

	useEffect(() => {
		fetchMetadata();
	}, [fetchMetadata]);

	return metadata;
};
