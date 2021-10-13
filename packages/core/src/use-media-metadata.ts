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

		const hasSourceChild = Array.from(current.childNodes).some(
			(child) => child.nodeName === 'SOURCE'
		);

		if (!current.src && !hasSourceChild) {
			const tagName = current.nodeName === 'AUDIO' ? '<Audio>' : '<Video>';

			throw new Error(
				`No src found. Please provide a src prop or a <source> child to the ${tagName} element.`
			);
		}

		const handler = () => setHasMetadata(true);

		current.addEventListener('loadedmetadata', handler);

		return () => current.removeEventListener('loadedmetadata', handler);
	}, [mediaRef]);

	return hasMetadata;
};
