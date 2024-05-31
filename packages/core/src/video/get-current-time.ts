// Calculate the `.currentTime` of a video or audio element

import {interpolate} from '../interpolate.js';

export const getExpectedMediaFrameUncorrected = ({
	frame,
	playbackRate,
	startFrom,
}: {
	frame: number;
	playbackRate: number;
	startFrom: number;
}) => {
	return interpolate(
		frame,
		[-1, startFrom, startFrom + 1],
		[-1, startFrom, startFrom + playbackRate],
	);
};

export const getMediaTime = ({
	fps,
	frame,
	playbackRate,
	startFrom,
}: {
	fps: number;
	frame: number;
	playbackRate: number;
	startFrom: number;
}) => {
	const expectedFrame = getExpectedMediaFrameUncorrected({
		frame,
		playbackRate,
		startFrom,
	});

	const msPerFrame = 1000 / fps;
	return (expectedFrame * msPerFrame) / 1000;
};
