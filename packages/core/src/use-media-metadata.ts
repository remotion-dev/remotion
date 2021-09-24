import {RefObject, useEffect, useState} from 'react';

export const useMediaHasMetadata = (
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>
) => {
	const [hasMetadata, setHasMetadata] = useState(false);

	useEffect(() => {
		const _ref = mediaRef.current;
		const handler = () => setHasMetadata(true);

		_ref?.addEventListener('loadedmetadata', handler);

		return () => _ref?.removeEventListener('loadedmetadata', handler);
	}, [mediaRef]);

	return hasMetadata;
};
