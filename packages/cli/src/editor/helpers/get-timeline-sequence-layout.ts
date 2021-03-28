import {Internals, TComposition} from 'remotion';
import {TIMELINE_PADDING} from './timeline-layout';

export const SEQUENCE_BORDER_WIDTH = 1;

export const getTimelineSequenceLayout = ({
	durationInFrames,
	startFrom,
	maxMediaDuration,
	video,
	windowWidth,
}: {
	durationInFrames: number;
	startFrom: number;
	maxMediaDuration: number;
	video: TComposition<unknown>;
	windowWidth: number;
}) => {
	const maxMediaSequenceDuration = maxMediaDuration - startFrom;
	const spatialDuration = Math.min(
		maxMediaSequenceDuration,
		Internals.FEATURE_FLAG_V2_BREAKING_CHANGES
			? durationInFrames - 1
			: durationInFrames
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
	return {marginLeft: Math.max(marginLeft, 0), width};
};
