import React from 'react';
import type {TSequence} from 'remotion';
import {areSequenceNodePathInfosEqual} from '../../helpers/are-sequence-node-path-infos-equal';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TimelineExpandedKeyframeRow} from './TimelineExpandedKeyframeRow';
import {useExpandedTrackKeyframeRows} from './use-expanded-track-keyframe-rows';

type TimelineExpandedTrackKeyframesProps = {
	readonly sequence: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
};

const TimelineExpandedTrackKeyframesInner: React.FC<
	TimelineExpandedTrackKeyframesProps
> = ({nodePathInfo, sequence, keyframeDisplayOffset, keyframePlaybackRate}) => {
	const {rows, expandedHeight} = useExpandedTrackKeyframeRows({
		sequence,
		nodePathInfo,
		keyframeDisplayOffset,
		keyframePlaybackRate,
	});

	return (
		<div style={{height: expandedHeight}}>
			{rows.map((row) => (
				<TimelineExpandedKeyframeRow
					key={row.rowKey}
					height={row.height}
					keyframes={row.keyframes}
					canEditEasing={row.canEditEasing}
					nodePathInfo={row.nodePathInfo}
				/>
			))}
		</div>
	);
};

const areTimelineExpandedTrackKeyframesPropsEqual = (
	first: TimelineExpandedTrackKeyframesProps,
	second: TimelineExpandedTrackKeyframesProps,
) => {
	return (
		first.keyframeDisplayOffset === second.keyframeDisplayOffset &&
		first.keyframePlaybackRate === second.keyframePlaybackRate &&
		first.sequence.controls?.schema === second.sequence.controls?.schema &&
		first.sequence.controls?.runtimeValues ===
			second.sequence.controls?.runtimeValues &&
		first.sequence.effects === second.sequence.effects &&
		areSequenceNodePathInfosEqual(first.nodePathInfo, second.nodePathInfo)
	);
};

export const TimelineExpandedTrackKeyframes = React.memo(
	TimelineExpandedTrackKeyframesInner,
	areTimelineExpandedTrackKeyframesPropsEqual,
);
