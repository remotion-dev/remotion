import {NoReactInternals} from 'remotion/no-react';

export const getTimelineMediaStartFrame = ({
	startMediaFrom,
	mediaFrameAtSequenceZero,
	sequenceFrameOffset,
	playbackRate,
}: {
	startMediaFrom: number;
	mediaFrameAtSequenceZero: number | null;
	sequenceFrameOffset: number;
	playbackRate: number;
}) => {
	if (mediaFrameAtSequenceZero !== null) {
		return mediaFrameAtSequenceZero + sequenceFrameOffset * playbackRate;
	}

	return NoReactInternals.getExpectedMediaFrameUncorrected({
		frame: sequenceFrameOffset,
		startFrom: startMediaFrom,
		playbackRate,
	});
};
