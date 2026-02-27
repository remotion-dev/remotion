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

	const spatialDuration = Math.min(
		maxMediaSequenceDuration,
		durationInFrames - 1,
		lastFrame - startFrom,
	);

	// Unclipped spatial duration: without the lastFrame - startFrom constraint
	const naturalSpatialDuration = Math.min(
		maxMediaSequenceDuration,
		durationInFrames - 1,
	);

	const marginLeft =
		lastFrame === 0
			? 0
			: (startFrom / lastFrame) * (windowWidth - TIMELINE_PADDING * 2);

	const nonNegativeMarginLeft = Math.min(marginLeft, 0);

	const width = getWidthOfTrack({
		durationInFrames,
		lastFrame,
		nonNegativeMarginLeft,
		spatialDuration,
		windowWidth,
	});

	const naturalWidth = getWidthOfTrack({
		durationInFrames,
		lastFrame,
		nonNegativeMarginLeft,
		spatialDuration: naturalSpatialDuration,
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
		naturalWidth: naturalWidth + (premountWidth ?? 0) + (postmountWidth ?? 0),
		premountWidth,
		postmountWidth,
	};
};
