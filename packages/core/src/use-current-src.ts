import {RefObject, useEffect, useState} from 'react';

export const useCurrentSrc = (
	mediaElement: RefObject<HTMLAudioElement | HTMLVideoElement>
) => {
	const currentSrc = mediaElement.current?.currentSrc ?? null;

	const [currentCurrentSrc, setCurrentCurrentSrc] = useState<string | null>(
		currentSrc ?? null
	);

	useEffect(() => {
		const check = () => {
			if (currentCurrentSrc !== currentSrc) {
				setCurrentCurrentSrc(currentSrc);
			}
		};

		const interval = setInterval(check, 100);

		return () => {
			clearInterval(interval);
		};
	}, [currentCurrentSrc, currentSrc]);

	return currentCurrentSrc;
};
