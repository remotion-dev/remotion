import type {TComposition} from 'remotion';
import {TIMELINE_PADDING} from './timeline-layout';

export const SEQUENCE_BORDER_WIDTH = 1;

export const getTimelineSequenceLayout = ({
	durationInFrames,
	startFrom,
	maxMediaDuration,
	startFromMedia,
	video,
	windowWidth,
	zoom,
}: {
	durationInFrames: number;
	startFrom: number;
	startFromMedia: number;
	maxMediaDuration: number | null;
	video: TComposition<unknown>;
	windowWidth: number;
	zoom: number;
}) => {
	const maxMediaSequenceDuration =
		(maxMediaDuration ?? Infinity) - startFromMedia;
	const spatialDuration = Math.min(
		maxMediaSequenceDuration,
		durationInFrames - 1
	);

	const lastFrame = (video.durationInFrames ?? 1) - 1;

	const marginLeft =
		lastFrame === 0
			? 0
			: (startFrom / lastFrame) * (windowWidth - TIMELINE_PADDING * 2);

	const negativeMarginLeft = Math.min(marginLeft, 0);

	const width =
		(durationInFrames === Infinity || lastFrame === 0
			? windowWidth - TIMELINE_PADDING * 2
			: (spatialDuration / lastFrame) * (windowWidth - TIMELINE_PADDING * 2)) -
		SEQUENCE_BORDER_WIDTH +
		negativeMarginLeft;
	return {
		marginLeft: Math.round(Math.max(marginLeft, 0)) * zoom,
		width: Math.floor(width) * zoom,
	};
};
