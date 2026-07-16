import {NoReactInternals} from 'remotion/no-react';

export const getTimelineMediaStartFrame = ({
	startMediaFrom,
	sequenceFrameOffset,
	playbackRate,
}: {
	startMediaFrom: number;
	sequenceFrameOffset: number;
	playbackRate: number;
}) => {
	return NoReactInternals.getExpectedMediaFrameUncorrected({
		frame: sequenceFrameOffset,
		startFrom: startMediaFrom,
		playbackRate,
	});
};
