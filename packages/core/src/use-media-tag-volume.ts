import type {RefObject} from 'react';
import { useEffect, useState} from 'react';

// Returns the real volume of the audio or video while playing,
// no matter what the supposed volume should be
export const useMediaTagVolume = (
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>
) => {
	const [actualVolume, setActualVolume] = useState(1);

	useEffect(() => {
		const ref = mediaRef.current;
		if (!ref) {
			return;
		}

		const onChange = () => {
			setActualVolume(ref.volume);
		};

		ref.addEventListener('volumechange', onChange);
		return () => ref.removeEventListener('volumechange', onChange);
	}, [mediaRef]);

	useEffect(() => {
		const ref = mediaRef.current;
		if (!ref) {
			return;
		}

		if (ref.volume !== actualVolume) {
			setActualVolume(ref.volume);
		}
	}, [actualVolume, mediaRef]);

	return actualVolume;
};
