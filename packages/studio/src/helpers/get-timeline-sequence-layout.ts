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
	const timelineDuration = video.durationInFrames ?? 1;

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
		timelineDuration <= 0
			? 0
			: (startFrom / timelineDuration) * (windowWidth - TIMELINE_PADDING * 2);

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
		marginLeft: Math.max(marginLeft, 0) - (premountWidth ?? 0),
		width: width + (premountWidth ?? 0) + (postmountWidth ?? 0),
		naturalWidth: naturalWidth + (premountWidth ?? 0) + (postmountWidth ?? 0),
		premountWidth,
		postmountWidth,
	};
};
