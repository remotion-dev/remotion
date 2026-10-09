import {useMemo} from 'react';
import {type LoopVolumeCurveBehavior, type VolumeProp} from 'remotion';
import {getTimeInSeconds} from './get-time-in-seconds';

export const frameForVolumeProp = ({
	behavior,
	loop,
	assetDurationInSeconds,
	fps,
	frame,
	startsAt,
	playbackRate,
	trimBefore,
	trimAfter,
}: {
	behavior: LoopVolumeCurveBehavior;
	loop: boolean;
	assetDurationInSeconds: number | null;
	fps: number;
	frame: number;
	startsAt: number;
	playbackRate: number;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
}) => {
	if (!loop) {
		return frame + startsAt;
	}

	if (behavior === 'extend') {
		return frame + startsAt;
	}

	const sourceTime = getTimeInSeconds({
		loop: true,
		mediaDurationInSeconds: assetDurationInSeconds,
		unloopedTimeInSeconds: frame / fps,
		src: '',
		trimBefore,
		trimAfter,
		playbackRate,
		fps,
		ifNoMediaDuration: 'infinity',
	})!;
	const frameInLoop = (sourceTime * fps - (trimBefore ?? 0)) / playbackRate;
	// A clipped first cycle starts its callback at zero, then later cycles reset
	// at the same source boundaries as the video and audio.
	return Math.max(0, Math.min(frame + startsAt, frameInLoop));
};

export const useLoopedVolume = ({
	volume,
	loop,
	behavior,
	assetDurationInSeconds,
	fps,
	startsAt,
	playbackRate,
	trimBefore,
	trimAfter,
}: Omit<Parameters<typeof frameForVolumeProp>[0], 'frame'> & {
	volume: VolumeProp | undefined;
}) => {
	return useMemo(() => {
		if (typeof volume !== 'function' || !loop || behavior === 'extend') {
			return volume;
		}

		return (frame: number) =>
			volume(
				frameForVolumeProp({
					behavior,
					loop,
					assetDurationInSeconds,
					fps,
					frame: frame - startsAt,
					startsAt,
					playbackRate,
					trimBefore,
					trimAfter,
				}),
			);
	}, [
		volume,
		loop,
		behavior,
		assetDurationInSeconds,
		fps,
		startsAt,
		playbackRate,
		trimBefore,
		trimAfter,
	]);
};
