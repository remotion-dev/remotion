// Calculate the `.currentTime` of a video or audio element

import {interpolate} from '../interpolate';

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
		[-1, startFrom, startFrom + playbackRate]
	);
};

export const getMediaTime = ({
	fps,
	frame,
	src,
	playbackRate,
	startFrom,
	mediaType,
}: {
	fps: number;
	frame: number;
	src: string;
	playbackRate: number;
	startFrom: number;
	mediaType: 'video' | 'audio';
}) => {
	const expectedFrame = getExpectedMediaFrameUncorrected({
		frame,
		playbackRate,
		startFrom,
	});

	if (src.endsWith('webm')) {
		// For WebM videos, we need to add a little bit of shift to get the right frame.
		const msPerFrame = 1000 / fps;
		const msShift = msPerFrame / 2;
		return (expectedFrame * msPerFrame + msShift) / 1000;
	}

	if (mediaType === 'video') {
		// In Chrome, for MP4s, if 30fps, the first frame is still displayed at 0.033333
		// even though after that it increases by 0.033333333 each.
		// So frame = 0 in Remotion is like frame = 1 for the browser
		return (expectedFrame + 1) / fps;
	}

	// For audio, we don't do any shift correction
	return expectedFrame / fps;
};
