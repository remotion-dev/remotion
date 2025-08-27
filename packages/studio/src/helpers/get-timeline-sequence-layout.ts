import type {VideoConfig} from 'remotion';
import {TIMELINE_PADDING} from './timeline-layout';

export const SEQUENCE_BORDER_WIDTH = 1;

const getWidthOfTrack = ({
	durationInFrames,
	lastFrame,
	windowWidth,
	spatialDuration,
	nonNegativeMarginLeft,
}: {
	durationInFrames: number;
	lastFrame: number;
	windowWidth: number;
	spatialDuration: number;
	nonNegativeMarginLeft: number;
}) => {
	const fullWidth = windowWidth - TIMELINE_PADDING * 2;
	const base =
		durationInFrames === Infinity || lastFrame === 0
			? fullWidth
			: (spatialDuration / lastFrame) * fullWidth;

	return base - SEQUENCE_BORDER_WIDTH + nonNegativeMarginLeft;
};

export const getTimelineSequenceLayout = ({
	durationInFrames,
	startFrom,
	maxMediaDuration,
	startFromMedia,
	video,
	windowWidth,
	premountDisplay,
	postmountDisplay,
}: {
	durationInFrames: number;
	startFrom: number;
	startFromMedia: number;
	maxMediaDuration: number | null;
	video: VideoConfig;
	windowWidth: number;
	premountDisplay: number | null;
	postmountDisplay: number | null;
}) => {
	const maxMediaSequenceDuration =
		(maxMediaDuration ?? Infinity) - startFromMedia;
	const lastFrame = (video.durationInFrames ?? 1) - 1;

	let spatialDuration = Math.min(
		maxMediaSequenceDuration,
		durationInFrames - 1,
		lastFrame - startFrom,
	);

	const shouldAddHalfAFrameAtEnd = startFrom + durationInFrames < lastFrame;
	const shouldAddHalfAFrameAtStart = startFrom > 0;
	if (shouldAddHalfAFrameAtEnd) {
		spatialDuration += 0.5;
	}

	if (shouldAddHalfAFrameAtStart) {
		spatialDuration += 0.5;
	}

	const startFromWithOffset = shouldAddHalfAFrameAtStart
		? startFrom - 0.5
		: startFrom;

	const marginLeft =
		lastFrame === 0
			? 0
			: (startFromWithOffset / lastFrame) *
				(windowWidth - TIMELINE_PADDING * 2);

	const nonNegativeMarginLeft = Math.min(marginLeft, 0);

	const width = getWidthOfTrack({
		durationInFrames,
		lastFrame,
		nonNegativeMarginLeft,
		spatialDuration,
		windowWidth,
	});

	const premountWidth = premountDisplay
		? getWidthOfTrack({
				durationInFrames: premountDisplay,
				lastFrame,
				nonNegativeMarginLeft,
				spatialDuration: premountDisplay,
				windowWidth,
			})
		: null;

	const postmountWidth = postmountDisplay
		? getWidthOfTrack({
				durationInFrames: postmountDisplay,
				lastFrame,
				nonNegativeMarginLeft,
				spatialDuration: postmountDisplay,
				windowWidth,
			})
		: null;

	return {
		marginLeft: Math.max(marginLeft, 0) - (premountWidth ?? 0),
		width: width + (premountWidth ?? 0) + (postmountWidth ?? 0),
		premountWidth,
		postmountWidth,
	};
};
