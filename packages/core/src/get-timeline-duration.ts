import {calculateMediaDuration} from './calculate-media-duration.js';

export const getTimelineDuration = ({
	compositionDurationInFrames,
	playbackRate,
	trimBefore,
	trimAfter,
	parentSequenceDurationInFrames,
	loop,
}: {
	compositionDurationInFrames: number;
	playbackRate: number;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
	parentSequenceDurationInFrames: number | null;
	loop: boolean;
}) => {
	if (loop) {
		return compositionDurationInFrames;
	}

	const mediaDuration = calculateMediaDuration({
		mediaDurationInFrames:
			compositionDurationInFrames * playbackRate + (trimBefore ?? 0),
		playbackRate,
		trimBefore,
		trimAfter,
	});

	if (parentSequenceDurationInFrames !== null) {
		return Math.floor(
			Math.min(parentSequenceDurationInFrames * playbackRate, mediaDuration),
		);
	}

	return mediaDuration;
};
