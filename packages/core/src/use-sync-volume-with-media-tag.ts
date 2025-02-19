import type {RefObject} from 'react';
import {useCallback, useEffect} from 'react';
import {isApproximatelyTheSame} from './is-approximately-the-same.js';
import type {VolumeProp} from './volume-prop.js';
import {evaluateVolume} from './volume-prop.js';

export type UseSyncVolumeWithMediaTagOptions = {
	volumePropFrame: number;
	volume?: VolumeProp;
	mediaVolume: number;
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement | null>;
};

export const useSyncVolumeWithMediaTag = ({
	volumePropFrame,
	volume,
	mediaVolume,
	mediaRef,
}: UseSyncVolumeWithMediaTagOptions) => {
	const adjustVolume = useCallback(() => {
		if (!mediaRef.current) {
			return;
		}

		const userPreferredVolume = evaluateVolume({
			frame: volumePropFrame,
			volume,
			mediaVolume,
			allowAmplificationDuringRender: false,
		});

		if (!isApproximatelyTheSame(userPreferredVolume, mediaRef.current.volume)) {
			mediaRef.current.volume = userPreferredVolume;
		}
	}, [mediaRef, mediaVolume, volume, volumePropFrame]);

	useEffect(() => {
		adjustVolume();
	}, [adjustVolume]);

	useEffect(() => {
		const media = mediaRef.current;
		if (!media) {
			return;
		}

		const handleVolumeChange = () => {
			adjustVolume();
		};

		media.addEventListener('volumechange', handleVolumeChange);

		return () => {
			media.removeEventListener('volumechange', handleVolumeChange);
		};
	}, [adjustVolume, mediaRef]);
};
