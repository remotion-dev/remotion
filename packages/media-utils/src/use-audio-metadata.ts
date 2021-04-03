import {useCallback, useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {getAudioMetadata} from '.';
import {AudioContextMetadata} from './types';

export const useAudioMetadata = (src: string): AudioContextMetadata | null => {
	const [metadata, setMetadata] = useState<AudioContextMetadata | null>(null);

	const fetchMetadata = useCallback(async () => {
		const handle = delayRender();
		const data = await getAudioMetadata(src);
		setMetadata(data);
		continueRender(handle);
	}, [src]);

	useEffect(() => {
		fetchMetadata();
	}, [fetchMetadata]);

	return metadata;
};
