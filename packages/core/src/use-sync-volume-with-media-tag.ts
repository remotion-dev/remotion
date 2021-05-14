import {RefObject, useEffect} from 'react';
import {isApproximatelyTheSame} from './is-approximately-the-same';
import {evaluateVolume, VolumeProp} from './volume-prop';

export type UseSyncVolumeWithMediaTagOptions = {
	volumePropFrame: number;
	actualVolume: number;
	volume?: VolumeProp;
	mediaVolume: number;
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>;
};

export const useSyncVolumeWithMediaTag = ({
	volumePropFrame,
	actualVolume,
	volume,
	mediaVolume,
	mediaRef,
}: UseSyncVolumeWithMediaTagOptions) => {
	useEffect(() => {
		const userPreferredVolume = evaluateVolume({
			frame: volumePropFrame,
			volume,
			mediaVolume,
		});
		if (
			!isApproximatelyTheSame(userPreferredVolume, actualVolume) &&
			mediaRef.current
		) {
			mediaRef.current.volume = userPreferredVolume;
		}
	}, [actualVolume, volumePropFrame, mediaRef, volume, mediaVolume]);
};
