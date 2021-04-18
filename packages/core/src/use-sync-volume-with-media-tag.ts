import {RefObject, useEffect} from 'react';
import {isApproximatelyTheSame} from './is-approximately-the-same';
import {evaluateVolume, VolumeProp} from './volume-prop';

export const useSyncVolumeWithMediaTag = ({
	volumePropFrame,
	actualVolume,
	volume,
	mediaRef,
}: {
	volumePropFrame: number;
	actualVolume: number;
	volume?: VolumeProp;
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>;
}) => {
	useEffect(() => {
		const userPreferredVolume = evaluateVolume({
			frame: volumePropFrame,
			volume,
		});
		if (
			!isApproximatelyTheSame(userPreferredVolume, actualVolume) &&
			mediaRef.current
		) {
			mediaRef.current.volume = userPreferredVolume;
		}
	}, [actualVolume, volumePropFrame, mediaRef, volume]);
};
