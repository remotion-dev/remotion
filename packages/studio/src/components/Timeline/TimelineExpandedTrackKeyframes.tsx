import React from 'react';
import type {TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TimelineExpandedKeyframeRow} from './TimelineExpandedKeyframeRow';
import {useExpandedTrackKeyframeRows} from './use-expanded-track-keyframe-rows';

const TimelineExpandedTrackKeyframesInner: React.FC<{
	readonly sequence: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly keyframeDisplayOffset: number;
}> = ({nodePathInfo, sequence, keyframeDisplayOffset}) => {
	const {rows, expandedHeight} = useExpandedTrackKeyframeRows({
		sequence,
		nodePathInfo,
		keyframeDisplayOffset,
	});

	return (
		<div style={{height: expandedHeight}}>
			{rows.map((row, index) => (
				<TimelineExpandedKeyframeRow
					key={row.rowKey}
					height={row.height}
					keyframes={row.keyframes}
					canEditEasing={row.canEditEasing}
					nodePathInfo={row.nodePathInfo}
					showSeparator={index > 0}
				/>
			))}
		</div>
	);
};

export const TimelineExpandedTrackKeyframes = React.memo(
	TimelineExpandedTrackKeyframesInner,
);
