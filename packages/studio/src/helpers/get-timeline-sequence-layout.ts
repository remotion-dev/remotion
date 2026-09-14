import type {VideoConfig} from 'remotion';
import {TIMELINE_PADDING} from './timeline-layout';

export const SEQUENCE_BORDER_WIDTH = 1;

const getWidthOfTrack = ({
	durationInFrames,
	timelineDuration,
	windowWidth,
	spatialDuration,
	nonNegativeMarginLeft,
}: {
	durationInFrames: number;
	timelineDuration: number;
	windowWidth: number;
	spatialDuration: number;
	nonNegativeMarginLeft: number;
}) => {
	const fullWidth = windowWidth - TIMELINE_PADDING * 2;
	const base =
		durationInFrames === Infinity || timelineDuration <= 0
			? fullWidth
			: (spatialDuration / timelineDuration) * fullWidth;

	return Math.max(0, base - SEQUENCE_BORDER_WIDTH + nonNegativeMarginLeft);
};

export const getTimelineSequenceLayout = ({
	durationInFrames,
	startFrom,
	cascadedStart,
	maxMediaDuration,
	startFromMedia,
	video,
	windowWidth,
	premountDisplay,
	postmountDisplay,
}: {
	durationInFrames: number;
	startFrom: number;
	cascadedStart: number;
	startFromMedia: number;
	maxMediaDuration: number | null;
	video: VideoConfig;
	windowWidth: number;
	premountDisplay: number | null;
	postmountDisplay: number | null;
}) => {
	const maxMediaSequenceDuration =
		(maxMediaDuration ?? Infinity) - startFromMedia;
	const timelineDuration = video.durationInFrames ?? 1;
	const fullWidth = windowWidth - TIMELINE_PADDING * 2;

	const spatialDuration = Math.max(
		0,
		Math.min(
			maxMediaSequenceDuration,
			durationInFrames,
			timelineDuration - startFrom,
		),
	);

	// Unclipped spatial duration: without the timeline-end constraint
	const naturalSpatialDuration = Math.max(
		0,
		Math.min(maxMediaSequenceDuration, durationInFrames),
	);

	const marginLeft =
		timelineDuration <= 0 ? 0 : (startFrom / timelineDuration) * fullWidth;

	const naturalNegativeStartWidth =
		timelineDuration > 0 &&
		startFrom === 0 &&
		cascadedStart < 0 &&
		durationInFrames > 0
			? Math.max(0, (-cascadedStart / timelineDuration) * fullWidth)
			: 0;
	const negativeStartWidth = Math.min(
		TIMELINE_PADDING,
		naturalNegativeStartWidth,
	);
	const negativeStartClipped = naturalNegativeStartWidth > TIMELINE_PADDING;

	const nonNegativeMarginLeft = Math.min(marginLeft, 0);

	const width = getWidthOfTrack({
		durationInFrames,
		timelineDuration,
		nonNegativeMarginLeft,
		spatialDuration,
		windowWidth,
	});

	const naturalWidth = getWidthOfTrack({
		durationInFrames,
		timelineDuration,
		nonNegativeMarginLeft,
		spatialDuration: naturalSpatialDuration,
		windowWidth,
	});

	const premountWidth = premountDisplay
		? getWidthOfTrack({
				durationInFrames: premountDisplay,
				timelineDuration,
				nonNegativeMarginLeft,
				spatialDuration: premountDisplay,
				windowWidth,
			})
		: null;

	const postmountWidth = postmountDisplay
		? getWidthOfTrack({
				durationInFrames: postmountDisplay,
				timelineDuration,
				nonNegativeMarginLeft,
				spatialDuration: postmountDisplay,
				windowWidth,
			})
		: null;

	return {
		marginLeft:
			Math.max(marginLeft, 0) - negativeStartWidth - (premountWidth ?? 0),
		width:
			width + negativeStartWidth + (premountWidth ?? 0) + (postmountWidth ?? 0),
		naturalWidth: naturalWidth + (premountWidth ?? 0) + (postmountWidth ?? 0),
		negativeStartWidth,
		negativeStartClipped,
		premountWidth,
		postmountWidth,
	};
};
