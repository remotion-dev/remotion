import {getTimeInSeconds} from './get-time-in-seconds';

export const getVideoFrameSelectionTimeInSeconds = ({
	loop,
	mediaDurationInSeconds,
	unloopedTimeInSeconds,
	durationInSeconds,
	src,
	trimAfter,
	trimBefore,
	fps,
	playbackRate,
	ifNoMediaDuration,
}: {
	loop: boolean;
	mediaDurationInSeconds: number | null;
	unloopedTimeInSeconds: number;
	durationInSeconds: number;
	src: string;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	playbackRate: number;
	fps: number;
	ifNoMediaDuration: 'fail' | 'infinity';
}) => {
	const frameStartTime = getTimeInSeconds({
		loop,
		mediaDurationInSeconds,
		unloopedTimeInSeconds,
		src,
		trimAfter,
		playbackRate,
		trimBefore,
		fps,
		ifNoMediaDuration,
	});

	if (frameStartTime === null) {
		return null;
	}

	const frameCenterTime = getTimeInSeconds({
		loop,
		mediaDurationInSeconds,
		unloopedTimeInSeconds: unloopedTimeInSeconds + durationInSeconds / 2,
		src,
		trimAfter,
		playbackRate,
		trimBefore,
		fps,
		ifNoMediaDuration,
	});

	return frameCenterTime ?? frameStartTime;
};
