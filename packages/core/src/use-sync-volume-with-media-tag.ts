import {RefObject, useEffect} from 'react';
import {isApproximatelyTheSame} from './is-approximately-the-same';
import {evaluateVolume, VolumeProp} from './volume-prop';

export const useSyncVolumeWithMediaTag = ({
	audioFrame,
	actualVolume,
	volume,
	mediaRef,
}: {
	audioFrame: number;
	actualVolume: number;
	volume?: VolumeProp;
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>;
}) => {
	useEffect(() => {
		const userPreferredVolume = evaluateVolume({
			frame: audioFrame,
			volume,
		});
		if (
			!isApproximatelyTheSame(userPreferredVolume, actualVolume) &&
			mediaRef.current
		) {
			mediaRef.current.volume = userPreferredVolume;
		}
	}, [actualVolume, audioFrame, mediaRef, volume]);
};
