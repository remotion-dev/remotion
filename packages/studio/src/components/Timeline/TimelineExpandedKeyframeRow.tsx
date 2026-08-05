import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import React, {useContext} from 'react';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {getTimelineEasingSegments} from './get-timeline-easing-segments';
import type {getTimelineKeyframes} from './get-timeline-keyframes';
import {TimelineKeyframeDiamond} from './TimelineKeyframeDiamond';
import {TimelineKeyframeEasingLine} from './TimelineKeyframeEasingLine';
import {
	getTimelineSelectedTrackHighlightStyle,
	useTimelineRowHighlightBackground,
} from './TimelineSelection';
import {TimelineWidthContext} from './TimelineWidthProvider';

const rowClipper: React.CSSProperties = {
	boxSizing: 'border-box',
	marginLeft: -TIMELINE_PADDING,
	marginRight: -TIMELINE_PADDING,
	overflow: 'hidden',
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
};

const row: React.CSSProperties = {
	position: 'relative',
};

const rowSeparator: React.CSSProperties = {
	height: TIMELINE_ITEM_BORDER_BOTTOM,
};

type TimelineExpandedKeyframeRowProps = {
	readonly height: number;
	readonly keyframes: ReturnType<typeof getTimelineKeyframes>;
	readonly canEditEasing: boolean;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly showSeparator: boolean;
};

const TimelineExpandedKeyframeRowUnmemoized: React.FC<
	TimelineExpandedKeyframeRowProps
> = ({height, keyframes, canEditEasing, nodePathInfo, showSeparator}) => {
	const timelineWidth = useContext(TimelineWidthContext);
	const rowHighlightBackground =
		useTimelineRowHighlightBackground(nodePathInfo);
	const easingSegments = canEditEasing
		? getTimelineEasingSegments(keyframes)
		: [];

	return (
		<>
			{showSeparator ? <div style={rowSeparator} /> : null}
			<div style={{...rowClipper, height, width: timelineWidth ?? undefined}}>
				<div style={{...row, height}}>
					{rowHighlightBackground && timelineWidth !== null ? (
						<div
							style={getTimelineSelectedTrackHighlightStyle(
								timelineWidth,
								rowHighlightBackground,
							)}
						/>
					) : null}
					{easingSegments.map((segment) => (
						<TimelineKeyframeEasingLine
							key={`${segment.segmentIndex}-${segment.fromFrame}-${segment.toFrame}`}
							fromFrame={segment.fromFrame}
							toFrame={segment.toFrame}
							rowHeight={height}
							nodePathInfo={nodePathInfo}
							segmentIndex={segment.segmentIndex}
						/>
					))}
					{keyframes.map((keyframe) => (
						<TimelineKeyframeDiamond
							key={keyframe.frame}
							frame={keyframe.frame}
							rowHeight={height}
							nodePathInfo={nodePathInfo}
						/>
					))}
				</div>
			</div>
		</>
	);
};

const areTimelineExpandedKeyframeRowPropsEqual = (
	prevProps: TimelineExpandedKeyframeRowProps,
	nextProps: TimelineExpandedKeyframeRowProps,
) => {
	if (
		prevProps.height !== nextProps.height ||
		prevProps.canEditEasing !== nextProps.canEditEasing ||
		prevProps.showSeparator !== nextProps.showSeparator ||
		prevProps.keyframes.length !== nextProps.keyframes.length ||
		prevProps.nodePathInfo.index !== nextProps.nodePathInfo.index ||
		prevProps.nodePathInfo.numberOfSequencesWithThisNodePath !==
			nextProps.nodePathInfo.numberOfSequencesWithThisNodePath ||
		prevProps.nodePathInfo.supportsEffects !==
			nextProps.nodePathInfo.supportsEffects ||
		stringifySequenceSubscriptionKey(
			prevProps.nodePathInfo.sequenceSubscriptionKey,
		) !==
			stringifySequenceSubscriptionKey(
				nextProps.nodePathInfo.sequenceSubscriptionKey,
			) ||
		prevProps.nodePathInfo.auxiliaryKeys.length !==
			nextProps.nodePathInfo.auxiliaryKeys.length
	) {
		return false;
	}

	const prevVideoConfig =
		prevProps.nodePathInfo.sequenceSubscriptionKey.videoConfigValues;
	const nextVideoConfig =
		nextProps.nodePathInfo.sequenceSubscriptionKey.videoConfigValues;
	if (
		prevVideoConfig !== nextVideoConfig &&
		(prevVideoConfig === null ||
			nextVideoConfig === null ||
			prevVideoConfig.durationInFrames !== nextVideoConfig.durationInFrames ||
			prevVideoConfig.fps !== nextVideoConfig.fps ||
			prevVideoConfig.height !== nextVideoConfig.height ||
			prevVideoConfig.width !== nextVideoConfig.width)
	) {
		return false;
	}

	return (
		prevProps.keyframes.every(
			(keyframe, index) => keyframe.frame === nextProps.keyframes[index].frame,
		) &&
		prevProps.nodePathInfo.auxiliaryKeys.every(
			(key, index) => key === nextProps.nodePathInfo.auxiliaryKeys[index],
		)
	);
};

export const TimelineExpandedKeyframeRow = React.memo(
	TimelineExpandedKeyframeRowUnmemoized,
	areTimelineExpandedKeyframeRowPropsEqual,
);
