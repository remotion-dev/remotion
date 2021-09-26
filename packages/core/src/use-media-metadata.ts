import {RefObject, useEffect, useState} from 'react';

export const useMediaHasMetadata = (
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>
) => {
	const [hasMetadata, setHasMetadata] = useState(false);

	useEffect(() => {
		const {current} = mediaRef;
		if (!current) {
			return;
		}

		const handler = () => setHasMetadata(true);

		current.addEventListener('loadedmetadata', handler);

		return () => current.removeEventListener('loadedmetadata', handler);
	}, [mediaRef]);

	return hasMetadata;
};
